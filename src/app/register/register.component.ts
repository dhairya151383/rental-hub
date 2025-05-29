import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../Shared/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.createRegisterForm();
  }

  /**
   * Initializes the registration form with validation.
   */
  private createRegisterForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      password: ['', Validators.required],
      passwordConfirm: ['', Validators.required],
      role: ['user', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  /**
   * Custom validator to ensure password and confirm password match.
   */
  private passwordMatchValidator(group: FormGroup): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('passwordConfirm')?.value;
    return password === confirm ? null : { passwordsNotMatching: true };
  }

  /**
   * Handles form submission and user registration.
   */
  registerAction(): void {
    this.errorMessage = null;
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid) return;

    const { email, password, role } = this.registerForm.value;

    this.authService.register(email, password, role)
      .then(() => this.router.navigate(['/login']))
      .catch(err => {
        console.error('Registration failed:', err);
        this.errorMessage = this.getErrorMessage(err);
      });
  }

  /**
   * Maps Firebase error codes to user-friendly messages.
   */
  private getErrorMessage(error: any): string {
    switch (error?.code) {
      case 'auth/email-already-in-use':
        return 'This email address is already registered.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use a stronger password.';
      default:
        return 'Registration failed. Please try again later.';
    }
  }
}
