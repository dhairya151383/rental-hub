import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../../services/auth.service';
import { NavService } from '../../services/nav.service';
import { Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  breadcrumbs: string[] = [];
  showPostButton = false;
  userRole: 'admin' | 'user' | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private navService: NavService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Breadcrumbs
    this.navService.breadcrumbs$
      .pipe(takeUntil(this.destroy$))
      .subscribe(crumbs => {
        this.breadcrumbs = crumbs;
        this.cdr.detectChanges();
      });

    // Show/hide "Post Apartment" button
    this.navService.showPostButton$
      .pipe(takeUntil(this.destroy$))
      .subscribe(show => {
        this.showPostButton = show;
        this.cdr.detectChanges();
      });

    // Get user role
    this.authService.currentUser$
      .pipe(
        takeUntil(this.destroy$),
        map(user => user?.role === 'admin' || user?.role === 'user' ? user.role : null)
      )
      .subscribe(role => {
        this.userRole = role;
        this.cdr.detectChanges();
      });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToPost() {
    this.router.navigate(['/apartment/post-apartment']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
