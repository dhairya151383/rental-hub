import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { UserWithRole } from '../../core/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserWithRole | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private authLoadedSubject = new BehaviorSubject<boolean>(false);
  public isAuthLoaded$ = this.authLoadedSubject.asObservable();

  constructor(private auth: Auth, private firestore: Firestore) {
    onAuthStateChanged(this.auth, async (user) => {
      try {
        const userData = user ? await this.fetchUserWithRole(user.uid) : null;
        this.currentUserSubject.next(userData);
      } catch (error) {
        console.error('Auth state change error:', error);
        this.currentUserSubject.next(null);
      } finally {
        this.authLoadedSubject.next(true);
      }
    });
  }

  /**
   * Registers a new user and assigns a role.
   */
  async register(email: string, password: string, role: string): Promise<void> {
    const credentials = await createUserWithEmailAndPassword(this.auth, email, password);
    const userRef = doc(this.firestore, 'users', credentials.user.uid);
    await setDoc(userRef, { email, role });
  }

  /**
   * Logs in the user with email and password.
   */
  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error: any) {
      const code = error?.code;
      switch (code) {
        case 'auth/user-not-found':
          throw new Error('No user found with this email.');
        case 'auth/wrong-password':
          throw new Error('Incorrect password.');
        case 'auth/invalid-email':
          throw new Error('Invalid email format.');
        default:
          throw new Error(error?.message || 'Login failed.');
      }
    }
  }

  /**
   * Logs out the current user.
   */
  async logout(): Promise<void> {
    await signOut(this.auth);
    this.currentUserSubject.next(null);
  }

  /**
   * Returns an observable of the current user with role, if available.
   */
  getCurrentUserWithRole(): Observable<UserWithRole | null> {
    return of(this.auth.currentUser).pipe(
      switchMap(user => {
        if (!user) return of(null);
        return from(this.fetchUserWithRole(user.uid));
      }),
            catchError(error => {
        console.error('Failed to fetch user with role:', error);
        return of(null);
      })
    );
  }

  /**
   * Fetches user details from Firestore using UID and includes the role.
   */
  private async fetchUserWithRole(uid: string): Promise<UserWithRole | null> {
    const userRef = doc(this.firestore, 'users', uid);
    const docSnap = await getDoc(userRef);
    return docSnap.exists() ? { uid, ...(docSnap.data() as any) } : null;
  }
}
