import { TestBed } from '@angular/core/testing';
import { ApartmentService } from './apartment.service';
import { Firestore } from '@angular/fire/firestore';
import { of, throwError } from 'rxjs';
import { Apartment } from './../../core/models/apartment.model';

jest.mock('@angular/fire/firestore', () => {
  const original = jest.requireActual('@angular/fire/firestore');
  return {
    ...original,
    collection: jest.fn(),
    collectionData: jest.fn(),
    addDoc: jest.fn(),
    doc: jest.fn(),
    updateDoc: jest.fn(),
    docData: jest.fn()
  };
});

import {
  collection,
  collectionData,
  addDoc,
  doc,
  updateDoc,
  docData
} from '@angular/fire/firestore';

describe('ApartmentService', () => {
  let service: ApartmentService;

  const mockApartment: Apartment = {
    id: '1',
    title: 'Test Apartment',
    description: 'A nice place to live',
    contactName: 'John Doe',
    contactEmail: 'john@example.com',
    createdAt: new Date(),
    isFavorite: false,
    apartmentBuilding: 'Sunset Heights',
    isShared: false,
    propertyLocation: {
      streetAddress: '123 Main St'
    },
    propertyDetails: {
      squareFeet: 1200,
      leaseType: 'monthly',
      beds: 3,
      baths: 2
    },
    expectedRent: {
      expectedRent: 1500,
      negotiable: true
    },
    utilitiesIncluded: true,
    isFurnished: true,
    amenities: ['WiFi', 'Balcony'],
    images: ['http://example.com/photo1.jpg']
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApartmentService,
        { provide: Firestore, useValue: {} }
      ]
    });

    service = TestBed.inject(ApartmentService);
  });

  it('should set apartment data', (done) => {
    service.setApartmentData(mockApartment);
    service.currentApartmentData$.subscribe(data => {
      expect(data).toEqual(mockApartment);
      done();
    });
  });

  it('should get apartments from collection', () => {
    (collectionData as jest.Mock).mockReturnValue(of([mockApartment]));

    service.getApartments().subscribe(apartments => {
      expect(apartments).toEqual([mockApartment]);
    });

    expect(collectionData).toHaveBeenCalled();
  });

  it('should add a new apartment', (done) => {
    (addDoc as jest.Mock).mockResolvedValue({ id: '1' });

    service.addApartment(mockApartment).subscribe({
      next: res => {
        expect(res).toEqual({ id: '1' });
        expect(addDoc).toHaveBeenCalled();
        done();
      }
    });
  });

  it('should throw error when adding invalid apartment', (done) => {
    const invalidApartment = { ...mockApartment, title: '', contactName: '', contactEmail: '', description: '' };

    service.addApartment(invalidApartment).subscribe({
      error: err => {
        expect(err).toBeTruthy();
        done();
      }
    });
  });

  it('should update favorite status', async () => {
    (doc as jest.Mock).mockReturnValue('mockDocRef');
    (updateDoc as jest.Mock).mockResolvedValue(undefined);

    await service.updateApartmentFavoriteStatus('1', true);

    expect(updateDoc).toHaveBeenCalledWith('mockDocRef', { isFavorite: true });
  });

  it('should get apartment by id', () => {
    (doc as jest.Mock).mockReturnValue('mockDocRef');
    (docData as jest.Mock).mockReturnValue(of(mockApartment));

    service.getApartmentById('1').subscribe(apartment => {
      expect(apartment).toEqual(mockApartment);
    });

    expect(docData).toHaveBeenCalledWith('mockDocRef', { idField: 'id' });
  });
});
