import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

import { AuthService } from './../../services/auth.service';
import { NavService } from '../../services/nav.service';

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

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly navService: NavService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscribeToBreadcrumbs();
    this.subscribeToPostButtonVisibility();
    this.subscribeToUserRole();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  goToPost(): void {
    this.router.navigate(['/apartment/post-apartment']);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  // Subscriptions below are separated for readability and single responsibility

  private subscribeToBreadcrumbs(): void {
    this.navService.breadcrumbs$
      .pipe(takeUntil(this.destroy$))
      .subscribe(crumbs => {
        this.breadcrumbs = crumbs;
        this.cdr.detectChanges();
      });
  }

  private subscribeToPostButtonVisibility(): void {
    this.navService.showPostButton$
      .pipe(takeUntil(this.destroy$))
      .subscribe(show => {
        this.showPostButton = show;
        this.cdr.detectChanges();
      });
  }

  private subscribeToUserRole(): void {
    this.authService.currentUser$
      .pipe(
        takeUntil(this.destroy$),
        map(user =>
          user?.role === 'admin' || user?.role === 'user'
            ? user.role
            : null
        )
      )
      .subscribe(role => {
        this.userRole = role;
        this.cdr.detectChanges();
      });
  }
}
