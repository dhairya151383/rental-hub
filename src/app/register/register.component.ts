import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../Shared/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      password: ['', Validators.required],
      passwordConfirm: ['', Validators.required],
      role: ['user', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirm = group.get('passwordConfirm')?.value;
    return password === confirm ? null : { passwordsNotMatching: true };
  }

  registerAction() {
    this.errorMessage = null;
    this.registerForm.markAllAsTouched();

    if (!this.registerForm.valid) {
      return;
    }

    const { email, password, role } = this.registerForm.value;

    this.authService.register(email, password, role)
      .then(() => {
        this.router.navigate(['/login']);
      })
      .catch(err => {
        console.error('Registration failed:', err);
        this.errorMessage = this.getErrorMessage(err);
      });
  }

  private getErrorMessage(error: any): string {
    if (error.code) {
      switch (error.code) {
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
    return 'An unexpected error occurred.';
  }
}