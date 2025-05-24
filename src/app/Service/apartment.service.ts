import { Injectable } from '@angular/core';
import { Apartment } from './../model/apartment.model';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { Firestore, collection, addDoc, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import { CollectionReference, DocumentData } from 'firebase/firestore';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApartmentService {
  private apartmentCollection: CollectionReference<DocumentData>;
  private apartmentDataSubject = new BehaviorSubject<Apartment | null>(null);
  currentApartmentData: Observable<Apartment | null> = this.apartmentDataSubject.asObservable();

  constructor(private firestore: Firestore) {
    this.apartmentCollection = collection(this.firestore, 'apartments') as CollectionReference<DocumentData>;
  }

  setApartmentData(data: Apartment): void {
    if (!data || typeof data !== 'object') {
      console.error('Invalid apartment data provided');
      return;
    }
    this.apartmentDataSubject.next(data);
  }

  getApartments(): Observable<Apartment[]> {
    // Get apartments collection with document IDs included as 'id'
    return collectionData(this.apartmentCollection, { idField: 'id' }) as Observable<Apartment[]>;
  }

  addApartment(apartment: Apartment): Observable<any> {
    if (!apartment.title || !apartment.description || !apartment.contactName || !apartment.contactEmail) {
      return throwError(() => new Error('Apartment title, description, contact name, and contact email are required.'));
    }
    // Add createdAt timestamp here before saving
    apartment.createdAt = new Date();
    return from(addDoc(this.apartmentCollection, apartment)).pipe(
      catchError(err => {
        console.error('Failed to add apartment:', err);
        return throwError(() => new Error('Failed to add apartment.'));
      })
    );
  }

  updateApartmentFavoriteStatus(apartmentId: string, isFavorite: boolean) {
    const apartmentDocRef = doc(this.firestore, 'apartments', apartmentId);
    return updateDoc(apartmentDocRef, { isFavorite });
  }
}