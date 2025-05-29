import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NavService {
  // Internal state subjects
  private readonly breadcrumbsSubject = new BehaviorSubject<string[]>([]);
  private readonly showPostButtonSubject = new BehaviorSubject<boolean>(false);

  // Public observables to expose state reactively
  readonly breadcrumbs$: Observable<string[]> = this.breadcrumbsSubject.asObservable();
  readonly showPostButton$: Observable<boolean> = this.showPostButtonSubject.asObservable();

  /**
   * Updates the breadcrumb navigation.
   * @param crumbs - Array of breadcrumb strings.
   */
  setBreadcrumbs(crumbs: string[]): void {
    this.breadcrumbsSubject.next(crumbs);
  }

  /**
   * Controls the visibility of the "Post Apartment" button.
   * @param show - Boolean flag to show or hide the button.
   */
  setShowPostButton(show: boolean): void {
    this.showPostButtonSubject.next(show);
  }

  /**
   * Resets navigation state to default values.
   */
  resetNavState(): void {
    this.setBreadcrumbs([]);
    this.setShowPostButton(false);
  }
}
