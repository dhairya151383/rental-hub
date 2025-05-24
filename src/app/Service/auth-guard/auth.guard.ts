import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth'; // Import User
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private auth: Auth, private router: Router) { }

  canActivate(): Observable<boolean> {
    return from(new Promise<User | null>((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
        resolve(user);
      });
    })).pipe(
      take(1),
      map(user => {
        if (user) {
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}