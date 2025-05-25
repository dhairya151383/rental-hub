import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './../../Shared/services/auth.service';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate() {
    return this.authService.currentUser$.pipe(
      take(1), // Wait for one emission from BehaviorSubject
      map(user => {
        if (user) {
          return true; // User is logged in and user info loaded
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}
