import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AuthService } from './Shared/services/auth.service';
import { of, BehaviorSubject } from 'rxjs';
import { Mocked } from 'jest-mock';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authService: Mocked<AuthService>;
  let isAuthLoadedSubject: BehaviorSubject<boolean>;

  beforeEach(() => {
    isAuthLoadedSubject = new BehaviorSubject<boolean>(false);

    // Create a mock AuthService
    const authServiceMock: Mocked<AuthService> = {
      isAuthLoaded$: isAuthLoadedSubject.asObservable() as Mocked<AuthService>['isAuthLoaded$'],
      // Add other methods of AuthService if your component uses them
    } as Mocked<AuthService>;

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as Mocked<AuthService>;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have as title 'RentalHub'`, () => {
    expect(component.title).toEqual('RentalHub');
  });

  it('should initialize authLoaded to false', () => {
    expect(component.authLoaded).toBe(false); // Use toBe(false)
  });

  it('should update authLoaded when AuthService.isAuthLoaded$ emits true', () => {
    isAuthLoadedSubject.next(true);
    fixture.detectChanges();
    expect(component.authLoaded).toBe(true); // Use toBe(true)
  });

  it('should update authLoaded when AuthService.isAuthLoaded$ emits false', () => {
    isAuthLoadedSubject.next(false);
    fixture.detectChanges();
    expect(component.authLoaded).toBe(false); // Use toBe(false)
  });
});