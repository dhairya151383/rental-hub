import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
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
   * Registers a new user and stores additional user data in Firestore.
   */
  async register(email: string, password: string, role: string): Promise<void> {
    const credentials = await createUserWithEmailAndPassword(this.auth, email, password);
    const userRef = doc(this.firestore, 'users', credentials.user.uid);
    await setDoc(userRef, { email, role });
  }

  /**
   * Authenticates the user with email and password.
   */
  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error: any) {
      let message = 'Login failed.';
      switch (error?.code) {
        case 'auth/user-not-found':
          message = 'No user found with this email.';
          break;
        case 'auth/wrong-password':
          message = 'Incorrect password.';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email format.';
          break;
        default:
          message = 'Invalid credentials';
          break;
      }
      throw new Error(message);
    }
  }

  /**
   * Signs out the current user and clears the current user subject.
   */
  async logout(): Promise<void> {
    await signOut(this.auth);
    this.currentUserSubject.next(null);
  }

  /**
   * Retrieves the currently authenticated user along with their role.
   */
  getCurrentUserWithRole(): Observable<UserWithRole | null> {
    return of(this.auth.currentUser).pipe(
      switchMap(user => user ? from(this.fetchUserWithRole(user.uid)) : of(null)),
      catchError(error => {
        console.error('Failed to fetch user with role:', error);
        return of(null);
      })
    );
  }

  /**
   * Fetches user information including role from Firestore by UID.
   */
  private async fetchUserWithRole(uid: string): Promise<UserWithRole | null> {
    const userRef = doc(this.firestore, 'users', uid);
    const docSnap = await getDoc(userRef);
    return docSnap.exists() ? { uid, ...(docSnap.data() as any) } : null;
  }
}
