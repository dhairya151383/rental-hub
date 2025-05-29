import { Component } from '@angular/core';
import { AuthService } from './Shared/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'RentalHub';
  authLoaded = false;

  constructor(private authService: AuthService) {
    // Subscribe to authentication load status
    this.authService.isAuthLoaded$.subscribe(loaded => {
      this.authLoaded = loaded;
    });
  }
}
