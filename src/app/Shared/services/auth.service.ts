import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  AuthError
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

// Define a type for user data including role
interface UserWithRole {
  uid: string;
  email: string;
  role: string;
  // add other user properties if needed
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserWithRole | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private auth: Auth, private firestore: Firestore) {
    onAuthStateChanged(this.auth, async (user) => {
      try {
        if (user) {
          const userData = await this.fetchUserWithRole(user.uid);
          this.currentUserSubject.next(userData);
        } else {
          this.currentUserSubject.next(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        this.currentUserSubject.next(null);
      }
    });
  }

  async register(email: string, password: string, role: string): Promise<void> {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    const userRef = doc(this.firestore, 'users', cred.user.uid);
    await setDoc(userRef, { email, role });
  }

  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error: any) {
      const code = error?.code;
      switch (code) {
        case 'auth/user-not-found': throw new Error('No user found with this email.');
        case 'auth/wrong-password': throw new Error('Incorrect password.');
        case 'auth/invalid-email': throw new Error('Invalid email format.');
        default: throw new Error(error.message || 'Login failed.');
      }
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.currentUserSubject.next(null);
  }

  getCurrentUserWithRole(): Observable<UserWithRole | null> {
    return of(this.auth.currentUser).pipe(
      switchMap(user => {
        if (!user) return of(null);
        return from(this.fetchUserWithRole(user.uid));
      }),
      catchError(err => {
        console.error('Failed to fetch user with role:', err);
        return of(null);
      })
    );
  }

  private async fetchUserWithRole(uid: string): Promise<UserWithRole | null> {
    const userRef = doc(this.firestore, 'users', uid);
    const docSnap = await getDoc(userRef);
    return docSnap.exists() ? { uid, ...(docSnap.data() as any) } : null;
  }
}

