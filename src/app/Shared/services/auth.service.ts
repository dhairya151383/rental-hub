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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserWithRole | null>(null);
  public currentUser$: Observable<UserWithRole | null> = this.currentUserSubject.asObservable();

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
        console.error('Error fetching user data on auth state change:', error);
        this.currentUserSubject.next(null);
      }
    });
  }

  // Register new user and save role in Firestore
  async register(email: string, password: string, role: string): Promise<void> {
    try {
      const cred = await createUserWithEmailAndPassword(this.auth, email, password);
      const userRef = doc(this.firestore, 'users', cred.user.uid);
      await setDoc(userRef, { email, role });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login existing user
async login(email: string, password: string): Promise<any> {
  try {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    return userCredential; // or return a simplified structure if needed
  } catch (error: any) {
    const err = error as AuthError;
    switch (err.code) {
      case 'auth/user-not-found':
        throw new Error('No user found with this email.');
      case 'auth/wrong-password':
        throw new Error('Incorrect password.');
      case 'auth/invalid-email':
        throw new Error('Invalid email format.');
      default:
        throw new Error(err.message || 'Login failed.');
    }
  }
}

  // Logout current user
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Observable to get current user data including role
  getCurrentUserWithRole(): Observable<UserWithRole | null> {
    return of(this.auth.currentUser).pipe(
      switchMap(user => {
        if (!user) return of(null);
        return from(this.fetchUserWithRole(user.uid));
      }),
      catchError(error => {
        console.error('Error fetching current user with role:', error);
        return of(null);
      })
    );
  }

  // Helper: fetch user document from Firestore
  private async fetchUserWithRole(uid: string): Promise<UserWithRole | null> {
    try {
      const userRef = doc(this.firestore, 'users', uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        return { uid, ...(docSnap.data() as any) } as UserWithRole;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user document:', error);
      throw error;
    }
  }
}
