import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../Shared/services/auth.service';
import { LoginComponent } from './login.component';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    const authServiceSpy = {
      login: jest.fn(() => Promise.resolve()),
    };
    const routerSpy = {
      navigate: jest.fn(() => Promise.resolve(true)),
    };

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize loginForm with email and password controls', () => {
    expect(component.loginForm.get('email')).toBeTruthy();
    expect(component.loginForm.get('password')).toBeTruthy();
    expect(component.errorMessage).toBeNull();
  });

  describe('login', () => {
    it('should not call authService.login if the form is invalid', async () => {
      component.loginForm.setValue({ email: null, password: null });
      await component.login();
      expect(authService.login).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
      expect(component.errorMessage).toBeNull();
    });

    it('should call authService.login with email and password when the form is valid', async () => {
      const mockEmail = 'test@example.com';
      const mockPassword = 'password123';
      component.loginForm.setValue({ email: mockEmail, password: mockPassword });
      (authService.login as jest.Mock).mockResolvedValue(undefined); // Simulate successful login

      await component.login();

      expect(authService.login).toHaveBeenCalledWith(mockEmail, mockPassword);
      expect(component.errorMessage).toBeNull();
    });

    it('should navigate to /dashboard on successful login', async () => {
      component.loginForm.setValue({ email: 'test@example.com', password: 'password123' });
      (authService.login as jest.Mock).mockResolvedValue(undefined);

      await component.login();

      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
      expect(component.errorMessage).toBeNull();
    });

    it('should set errorMessage and log to console on failed login', async () => {
      const mockError = new Error('Invalid credentials');
      component.loginForm.setValue({ email: 'test@example.com', password: 'wrongpassword' });
      (authService.login as jest.Mock).mockRejectedValue(mockError);
      const consoleErrorSpy = jest.spyOn(console, 'error');

      await component.login();

      expect(authService.login).toHaveBeenCalled();
      expect(component.errorMessage).toBe('Invalid credentials');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Login error:', mockError);
      consoleErrorSpy.mockRestore(); // Clean up the spy
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should set a generic error message if the error has no message', async () => {
      const mockError = {}; // Error with no message property
      component.loginForm.setValue({ email: 'test@example.com', password: 'wrongpassword' });
      (authService.login as jest.Mock).mockRejectedValue(mockError);

      await component.login();

      expect(component.errorMessage).toBe('Login failed.');
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });
});