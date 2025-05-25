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
  loginForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required]),
  });

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    if (!this.loginForm.valid) {
      return;
    }

    const { email, password } = this.loginForm.value;
    this.authService.login(email, password)
      .then(() => this.router.navigate(['/dashboard']))
      .catch(err => console.error(err));
  }
}