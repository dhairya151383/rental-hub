import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

import { ApartmentDetailComponent } from './apartment-detail.component';
import { ApartmentService } from '../../Shared/services/apartment.service';
import { NavService } from '../../Shared/services/nav.service';

describe('ApartmentDetailComponent', () => {
  let component: ApartmentDetailComponent;
  let fixture: ComponentFixture<ApartmentDetailComponent>;

  let mockApartmentService: any;
  let mockRouter: any;
  let mockActivatedRoute: any;
  let mockNavService: any;
  let mockChangeDetectorRef: any;

  const mockApartment = {
    id: 'apt1',
    apartmentBuilding: 'Building A',
    isShared: false,
    propertyLocation: { streetAddress: '123 Main St' },
    propertyDetails: { squareFeet: 1000, leaseType: 'yearly', beds: 3, baths: 2 },
    expectedRent: { expectedRent: 1200, negotiable: false },
    utilitiesIncluded: false,
    isFurnished: true,
    amenities: ['Pool', 'Gym'],
    description: 'Nice apartment',
    title: 'Lovely Place',
    images: ['img1.jpg', 'img2.jpg'],
    isFavorite: true,
    contactName: 'John Doe',
    contactEmail: 'john@example.com'
  };

  beforeEach(async () => {
    mockApartmentService = {
      currentApartmentData$: new Subject(),
      getApartmentById: jest.fn().mockReturnValue(of(mockApartment)),
      updateApartmentFavoriteStatus: jest.fn().mockResolvedValue(undefined)
    };

    mockRouter = {
      navigate: jest.fn()
    };

    mockActivatedRoute = {
      snapshot: { paramMap: { get: jest.fn().mockReturnValue('apt1') } },
      queryParams: of({ fromPostApartment: 'true' })
    };

    mockNavService = {
      setBreadcrumbs: jest.fn()
    };

    mockChangeDetectorRef = {
      detectChanges: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [ApartmentDetailComponent],
      providers: [
        { provide: ApartmentService, useValue: mockApartmentService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: NavService, useValue: mockNavService },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ApartmentDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should subscribe and set previousPage, breadcrumbs, apartmentData and isFavorite', (done) => {
      component.ngOnInit();

      mockApartmentService.currentApartmentData$.next(mockApartment);

      setTimeout(() => {
        expect(component.previousPage).toBe('postApartment');
        expect(mockNavService.setBreadcrumbs).toHaveBeenCalledWith(['Post', 'Detail']);
        expect(component.apartmentData).toEqual(mockApartment);
        expect(component.isFavorite).toBe(true);
        done();
      }, 0);
    });

    it('should call loadApartmentById if currentApartmentData$ emits null and routeId is not preview', (done) => {
      // Spy on private loadApartmentById by casting to any
      const loadApartmentSpy = jest.spyOn(component as any, 'loadApartmentById');

      component.ngOnInit();

      mockApartmentService.currentApartmentData$.next(null);

      setTimeout(() => {
        expect(loadApartmentSpy).toHaveBeenCalledWith('apt1');
        done();
      }, 0);
    });

    it('should redirect to dashboard if currentApartmentData$ emits null and routeId is preview', (done) => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('preview');

      component.ngOnInit();

      mockApartmentService.currentApartmentData$.next(null);

      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
        done();
      }, 0);
    });
  });

  describe('loadApartmentById', () => {
    
    it('should redirect to dashboard if apartment is null', async () => {
      mockApartmentService.getApartmentById.mockReturnValue(of(null));

      await (component as any).loadApartmentById('apt1');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should redirect to dashboard on error', async () => {
      // Create observable that errors
      const errorObservable = new Subject();
      mockApartmentService.getApartmentById.mockReturnValue(errorObservable);

      (component as any).loadApartmentById('apt1');
      errorObservable.error('Error');

      // Wait a tick to let observable error handling run
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  describe('setBreadcrumbs', () => {
    it('should set breadcrumbs correctly for postApartment', () => {
      component.previousPage = 'postApartment';
      (component as any).setBreadcrumbs();
      expect(mockNavService.setBreadcrumbs).toHaveBeenCalledWith(['Post', 'Detail']);
    });

    it('should set breadcrumbs correctly for dashboard', () => {
      component.previousPage = 'dashboard';
      (component as any).setBreadcrumbs();
      expect(mockNavService.setBreadcrumbs).toHaveBeenCalledWith(['Detail']);
    });
  });

  describe('redirectToDashboard', () => {
    it('should navigate to /dashboard', () => {
      (component as any).redirectToDashboard();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe subscription', () => {
      (component as any).subscription = { unsubscribe: jest.fn() };
      component.ngOnDestroy();
      expect((component as any).subscription.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('getAmenities', () => {
    it('should return comma separated amenities', () => {
      expect(component.getAmenities(['Pool', 'Gym'])).toBe('Pool, Gym');
    });

    it('should return "No amenities listed" if empty array', () => {
      expect(component.getAmenities([])).toBe('No amenities listed');
    });

    it('should return "No amenities listed" if undefined', () => {
      expect(component.getAmenities(undefined)).toBe('No amenities listed');
    });
  });

  describe('goBack', () => {
    it('should navigate to post-apartment route with state when previousPage is postApartment', () => {
      component.previousPage = 'postApartment';
      component.apartmentData = mockApartment;

      component.goBack();

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/apartment/post-apartment'],
        { state: { returnFromPost: true, apartmentData: mockApartment } }
      );
    });

    it('should redirect to dashboard when previousPage is not postApartment', () => {
      component.previousPage = 'dashboard';

      component.goBack();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  describe('Image navigation methods', () => {
    beforeEach(() => {
      component.apartmentData = { ...mockApartment };
    });

    it('nextImage should increment currentImageIndex and wrap around', () => {
      component.currentImageIndex = 0;
      component.nextImage();
      expect(component.currentImageIndex).toBe(1);

      component.currentImageIndex = 1;
      component.nextImage();
      expect(component.currentImageIndex).toBe(0);
    });

    it('prevImage should decrement currentImageIndex and wrap around', () => {
      component.currentImageIndex = 0;
      component.prevImage();
      expect(component.currentImageIndex).toBe(1);

      component.currentImageIndex = 1;
      component.prevImage();
      expect(component.currentImageIndex).toBe(0);
    });

    it('setCurrentImage should set currentImageIndex', () => {
      component.setCurrentImage(1);
      expect(component.currentImageIndex).toBe(1);
    });
  });

  describe('getBeds and getBaths', () => {
    it('should return correct beds and baths from apartmentData', () => {
      component.apartmentData = mockApartment;
      expect(component.getBeds()).toBe(3);
      expect(component.getBaths()).toBe(2);
    });

    it('should return 0 if apartmentData or propertyDetails is missing', () => {
      component.apartmentData = null as any;
      expect(component.getBeds()).toBe(0);
      expect(component.getBaths()).toBe(0);

      component.apartmentData = { ...mockApartment, propertyDetails: null as any };
      expect(component.getBeds()).toBe(0);
      expect(component.getBaths()).toBe(0);
    });
  });

  describe('toggleFavorite', () => {
    beforeEach(() => {
      component.apartmentData = mockApartment;
      component.isFavorite = false;
    });

    it('should update favorite status successfully', async () => {
      await component.toggleFavorite();

      expect(mockApartmentService.updateApartmentFavoriteStatus).toHaveBeenCalledWith('apt1', true);
      expect(component.isFavorite).toBe(true);
    });

    it('should revert favorite status on error', async () => {
      mockApartmentService.updateApartmentFavoriteStatus.mockRejectedValueOnce('Error');

      await component.toggleFavorite();

      expect(component.isFavorite).toBe(false);
    });
  });
});
