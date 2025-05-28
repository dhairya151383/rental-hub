import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './Shared/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'RentalHub';
  authLoaded = false;

  constructor(private authService: AuthService) {
    this.authService.isAuthLoaded$.subscribe(loaded => {
      this.authLoaded = loaded;
    });
  }
}
