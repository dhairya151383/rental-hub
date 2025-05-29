import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../Shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm = new FormGroup({
    email: new FormControl<string | null>(null, [Validators.required, Validators.email]),
    password: new FormControl<string | null>(null, [Validators.required]),
  });
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  async login(): Promise<void> {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;
    this.errorMessage = null;
    try {
      await this.authService.login(email!, password!);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage = error?.message || 'Login failed.';
      console.error('Login error:', error);
    }
  }
}
