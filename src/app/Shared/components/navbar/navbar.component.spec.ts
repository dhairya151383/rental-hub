import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject, BehaviorSubject, of } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { NavService } from '../../services/nav.service';
import { NavbarComponent } from './navbar.component';
import { ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Mocked } from 'jest-mock';

// Define the UserWithRole interface to match your AuthService's user model
// Ensure this matches the actual interface in your application (e.g., in user.model.ts)
interface UserWithRole {
  uid: string;
  email: string | null;
  role: 'admin' | 'user' | null;
  // Add any other properties that your UserWithRole interface might have
}

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let navService: Mocked<NavService>;
  let authService: Mocked<AuthService>;
  let router: Mocked<Router>;
  let cdr: ChangeDetectorRef;
  let breadcrumbsSubject: BehaviorSubject<string[]>;
  let showPostButtonSubject: BehaviorSubject<boolean>;
  let currentUserSubject: BehaviorSubject<UserWithRole | null>;

  // Create mock objects for the services
  // Using BehaviorSubject for observables allows us to control their emitted values in tests
  const mockNavService = {
    breadcrumbs$: new BehaviorSubject<string[]>([]).asObservable(),
    showPostButton$: new BehaviorSubject<boolean>(false).asObservable(),
    setBreadcrumbs: jest.fn(), // Mock the method
    setShowPostButton: jest.fn(), // Mock the method
  };

  const mockAuthService = {
    // Let jest.fn() infer the return type (Promise<void>)
    // The type assertion for the entire `mockAuthService` object will handle the `Mocked` type
    logout: jest.fn(() => Promise.resolve()),
    currentUser$: new BehaviorSubject<UserWithRole | null>(null).asObservable(),
    // Add other AuthService properties/methods if your component interacts with them
    // Example: login: jest.fn(() => Promise.resolve()),
    // Example: isAuthLoaded$: new BehaviorSubject<boolean>(false).asObservable(),
  };

  const mockRouter = {
    navigate: jest.fn(() => Promise.resolve(true)), // Mock the navigate method
  };

  beforeEach(() => {
    // Configure the testing module
    TestBed.configureTestingModule({
      declarations: [NavbarComponent], // Declare the component under test
      providers: [
        // Provide the mock services
        { provide: NavService, useValue: mockNavService },
        { provide: AuthService, useValue: mockAuthService }, // Provide the mock object
        { provide: Router, useValue: mockRouter },
        ChangeDetectorRef, // Provide ChangeDetectorRef as it's injected in the component
      ],
    }).overrideComponent(NavbarComponent, {
      // Override change detection strategy for better testing control
      set: { changeDetection: ChangeDetectionStrategy.OnPush },
    }).compileComponents(); // Compile components asynchronously

    // Create component fixture and instance
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;

    // Inject the mocked services and ChangeDetectorRef
    // Cast them to Mocked<Service> to access Jest's mock methods (e.g., .toHaveBeenCalled)
    navService = TestBed.inject(NavService) as Mocked<NavService>;
    authService = TestBed.inject(AuthService) as Mocked<AuthService>;
    router = TestBed.inject(Router) as Mocked<Router>;
    cdr = TestBed.inject(ChangeDetectorRef); // Correctly inject ChangeDetectorRef

    // Get references to the BehaviorSubjects from the mock services
    // This allows us to control the emitted values during tests
    breadcrumbsSubject = mockNavService.breadcrumbs$ as BehaviorSubject<string[]>;
    showPostButtonSubject = mockNavService.showPostButton$ as BehaviorSubject<boolean>;
    currentUserSubject = mockAuthService.currentUser$ as BehaviorSubject<UserWithRole | null>;

    // Trigger initial change detection to run ngOnInit and set up subscriptions
    fixture.detectChanges();
  });

  // Test case: Component creation
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test case: Initial state of breadcrumbs
  it('should initialize breadcrumbs to an empty array', () => {
    expect(component.breadcrumbs).toEqual([]);
  });

  // Test case: Initial state of showPostButton
  it('should initialize showPostButton to false', () => {
    expect(component.showPostButton).toBe(false); // Use .toBe(false) for strict boolean check
  });

  // Test case: Initial state of userRole
  it('should initialize userRole to null', () => {
    expect(component.userRole).toBeNull();
  });


  // Group of tests for ngOnDestroy lifecycle hook
  describe('ngOnDestroy', () => {
    it('should complete the destroy$ subject to unsubscribe from observables', () => {
      // Spy on the complete method of the private destroy$ Subject
      const destroyCompleteSpy = jest.spyOn((component as any).destroy$, 'complete');
      component.ngOnDestroy(); // Call ngOnDestroy
      expect(destroyCompleteSpy).toHaveBeenCalled();
    });

    it('should emit a value to the destroy$ subject before completing', () => {
      // Spy on the next method of the private destroy$ Subject
      const destroyNextSpy = jest.spyOn((component as any).destroy$, 'next');
      component.ngOnDestroy(); // Call ngOnDestroy
      expect(destroyNextSpy).toHaveBeenCalled();
    });
  });

  // Group of tests for logout method
  describe('logout', () => {
    it('should call authService.logout', async () => {
      await component.logout(); // Call the logout method
      expect(authService.logout).toHaveBeenCalledTimes(1); // Verify authService.logout was called
    });

    it('should navigate to /login on successful logout', async () => {
      // Mock a successful logout
      authService.logout.mockResolvedValue(undefined);
      await component.logout();
      expect(router.navigate).toHaveBeenCalledWith(['/login']); // Verify navigation
    });

    
  });

  // Group of tests for goToPost method
  describe('goToPost', () => {
    it('should navigate to /apartment/post-apartment', () => {
      component.goToPost();
      expect(router.navigate).toHaveBeenCalledWith(['/apartment/post-apartment']);
    });
  });

  // Group of tests for goToDashboard method
  describe('goToDashboard', () => {
    it('should navigate to /dashboard', () => {
      component.goToDashboard();
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });
});
