import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject, from, Observable, of, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

// Define a type for your user data with role for better type safety
interface UserWithRole {
  uid: string;
  email: string;
  role: string;
  // Add any other user properties you store in Firestore
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Use the defined interface for better type safety
  private currentUserSubject = new BehaviorSubject<UserWithRole | null>(null);
  public currentUser$: Observable<UserWithRole | null> = this.currentUserSubject.asObservable();

  constructor(private auth: Auth, private firestore: Firestore) {
    // Listen for authentication state changes
    onAuthStateChanged(this.auth, async (user) => {
      try {
        if (user) {
          // If a user is logged in, fetch their role and other data from Firestore
          const userData = await this.fetchUserWithRole(user.uid);
          this.currentUserSubject.next(userData);
        } else {
          // If no user is logged in, set current user to null
          this.currentUserSubject.next(null);
        }
      } catch (error) {
        // Log any errors during user data fetching on auth state change
        console.error('Error fetching user data on auth state change:', error);
        this.currentUserSubject.next(null); // Ensure subject is null on error
      }
    });
  }

  /**
   * Registers a new user with email and password, and stores their role in Firestore.
   * @param email The user's email.
   * @param password The user's password.
   * @param role The role assigned to the user (e.g., 'admin', 'user').
   * @returns A Promise that resolves when registration and data storage are complete.
   */
  async register(email: string, password: string, role: string): Promise<void> {
    try {
      // Create user with email and password using Firebase Auth
      const cred = await createUserWithEmailAndPassword(this.auth, email, password);
      // Get a reference to the user's document in Firestore
      const userRef = doc(this.firestore, 'users', cred.user.uid);
      // Set the user's email and role in their Firestore document
      await setDoc(userRef, { email, role });
    } catch (error) {
      // Log and re-throw registration errors for handling in the UI or caller
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Logs in an existing user with email and password.
   * @param email The user's email.
   * @param password The user's password.
   * @returns A Promise that resolves with the user credentials.
   */
  async login(email: string, password: string): Promise<any> {
    try {
      // Sign in user with email and password using Firebase Auth
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      // Log and re-throw login errors for handling in the UI or caller
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logs out the current user.
   * @returns A Promise that resolves when logout is complete.
   */
  async logout(): Promise<void> {
    try {
      // Sign out the current user using Firebase Auth
      await signOut(this.auth);
    } catch (error) {
      // Log and re-throw logout errors
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Gets the current authenticated user along with their role from Firestore.
   * This is an Observable-based method, suitable for use in guards or components.
   * @returns An Observable that emits the user data with role, or null if no user is logged in.
   */
  getCurrentUserWithRole(): Observable<UserWithRole | null> {
    // Convert the current user (which might be null) into an Observable
    return of(this.auth.currentUser).pipe(
      // Use switchMap to switch to a new Observable (fetching user role) if a user exists
      switchMap(user => {
        if (!user) {
          // If no user, immediately return an Observable of null
          return of(null);
        }
        // If user exists, fetch their role from Firestore and convert the Promise to an Observable
        return from(this.fetchUserWithRole(user.uid));
      }),
      // Catch any errors during the process and return null
      catchError(error => {
        console.error('Error fetching current user with role:', error);
        return of(null); // Return null on error, or throwError(error) to propagate
      })
    );
  }

  /**
   * Helper method to fetch user data and role from Firestore by UID.
   * @param uid The user's unique ID.
   * @returns A Promise that resolves with the user's data including role, or null if not found.
   */
  private async fetchUserWithRole(uid: string): Promise<UserWithRole | null> {
    try {
      // Get a reference to the user's document
      const userRef = doc(this.firestore, 'users', uid);
      // Fetch the document snapshot
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        // If the document exists, combine UID with document data
        return { uid, ...docSnap.data() } as UserWithRole;
      }
      return null; // Return null if document does not exist
    } catch (error) {
      // Log and re-throw errors during Firestore document fetching
      console.error('Error fetching user document:', error);
      throw error;
    }
  }
}