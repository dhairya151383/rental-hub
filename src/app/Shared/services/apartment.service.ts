import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Firestore, collection, addDoc, collectionData, doc, updateDoc, docData } from '@angular/fire/firestore';
import { CollectionReference, DocumentData } from 'firebase/firestore';
import { Apartment } from './../../core/models/apartment.model';

@Injectable({
  providedIn: 'root'
})
export class ApartmentService {
  private apartmentCollection: CollectionReference<DocumentData>;
  private apartmentDataSubject = new BehaviorSubject<Apartment | null>(null);
  currentApartmentData$: Observable<Apartment | null> = this.apartmentDataSubject.asObservable();
  constructor(private firestore: Firestore) {
    this.apartmentCollection = collection(this.firestore, 'apartments') as CollectionReference<DocumentData>;
  }
  /**
   * Sets the currently selected apartment data.
   */
  setApartmentData(data: Apartment): void {
    if (!data || typeof data !== 'object') {
      console.error('Invalid apartment data provided');
      return;
    }
    this.apartmentDataSubject.next(data);
  }
  /**
   * Retrieves all apartments from the collection.
   */
  getApartments(): Observable<Apartment[]> {
    return collectionData(this.apartmentCollection, { idField: 'id' }) as Observable<Apartment[]>;
  }
  /**
   * Adds a new apartment to the collection.
   */
  addApartment(apartment: Apartment): Observable<any> {
    if (!apartment.title || !apartment.description || !apartment.contactName || !apartment.contactEmail) {
      return throwError(() => new Error('Apartment title, description, contact name, and contact email are required.'));
    }
    apartment.createdAt = new Date();
    return from(addDoc(this.apartmentCollection, apartment)).pipe(
      catchError(err => {
        console.error('Failed to add apartment:', err);
        return throwError(() => new Error('Failed to add apartment.'));
      })
    );
  }
  /**
   * Updates the favorite status of an apartment.
   */
  updateApartmentFavoriteStatus(apartmentId: string, isFavorite: boolean) {
    const apartmentDocRef = doc(this.firestore, 'apartments', apartmentId);
    return updateDoc(apartmentDocRef, { isFavorite });
  }
  /**
   * Retrieves a single apartment by its ID.
   */
  getApartmentById(id: string): Observable<Apartment> {
    const apartmentDocRef = doc(this.firestore, 'apartments', id);
    return docData(apartmentDocRef, { idField: 'id' }) as Observable<Apartment>;
  }
}
