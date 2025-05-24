import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './../../Shared/services/auth.service';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

export function RoleGuard(allowedRoles: string[]): CanActivateFn {
  return (): Observable<boolean> => {
    const authService = inject(AuthService);
    const router = inject(Router);
    return authService.getCurrentUserWithRole().pipe(
      take(1), // Take only the first emission and then complete
      map(user => {
        if (!user || !allowedRoles.includes(user.role)) {
          router.navigate(['/unauthorized']);
          return false;
        }
        return true;
      })
    );
  };
}