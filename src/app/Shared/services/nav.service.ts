import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NavService {
  // Subjects to hold the current state
  private readonly breadcrumbsSubject = new BehaviorSubject<string[]>([]);
  private readonly showPostButtonSubject = new BehaviorSubject<boolean>(false);

  // Public observables for components to subscribe to
  readonly breadcrumbs$: Observable<string[]> = this.breadcrumbsSubject.asObservable();
  readonly showPostButton$: Observable<boolean> = this.showPostButtonSubject.asObservable();

  /**
   * Updates the breadcrumb navigation
   * @param crumbs Array of breadcrumb strings
   */
  setBreadcrumbs(crumbs: string[]): void {
    this.breadcrumbsSubject.next(crumbs);
  }

  /**
   * Controls the visibility of the post button
   * @param show Boolean flag to show/hide post button
   */
  setShowPostButton(show: boolean): void {
    this.showPostButtonSubject.next(show);
  }

  /**
   * Resets navigation state to default
   */
  resetNavState(): void {
    this.setBreadcrumbs([]);
    this.setShowPostButton(false);
  }
}
