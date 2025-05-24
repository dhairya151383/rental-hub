import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './../auth.service'; // Corrected path if needed
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

// Usage: canActivate: [RoleGuard(['admin'])]
/**
 * A functional guard that checks if the current user has one of the allowed roles.
 * If the user does not have an allowed role, they are redirected to '/unauthorized'.
 * @param allowedRoles An array of roles that are permitted to access the route.
 * @returns A boolean Observable indicating if the user is authorized.
 */
export function RoleGuard(allowedRoles: string[]): CanActivateFn {
  return (): Observable<boolean> => {
    // Inject AuthService and Router using the inject function for functional guards
    const authService = inject(AuthService);
    const router = inject(Router);

    // Get the current user with their role
    return authService.getCurrentUserWithRole().pipe(
      take(1), // Take only the first emission and then complete
      map(user => {
        // Check if user exists and their role is included in the allowed roles
        if (!user || !allowedRoles.includes(user.role)) {
          // If not authorized, navigate to the unauthorized page
          router.navigate(['/unauthorized']);
          return false; // Prevent access
        }
        return true; // Allow access
      })
    );
  };
}