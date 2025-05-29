import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, catchError } from 'rxjs/operators';
import { AuthService } from '../../Shared/services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const expectedRole = route.data['expectedRole'];
    return this.authService.getCurrentUserWithRole().pipe(
      take(1),
      map(user => {
        if (user?.role === expectedRole) {
          return true;
        }
        this.router.navigate(['/unauthorized']);
        return false;
      }),
      catchError(() => {
        this.router.navigate(['/unauthorized']);
        return of(false);
      })
    );
  }
}
