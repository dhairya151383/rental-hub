import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NavService {
  private breadcrumbsSubject = new BehaviorSubject<string[]>([]);
  breadcrumbs$ = this.breadcrumbsSubject.asObservable();

  private showPostButtonSubject = new BehaviorSubject<boolean>(false);
  showPostButton$ = this.showPostButtonSubject.asObservable();

  setBreadcrumbs(crumbs: string[]) {
    this.breadcrumbsSubject.next(crumbs);
  }

  setShowPostButton(show: boolean) {
    this.showPostButtonSubject.next(show);
  }

  resetNavState() {
    this.setBreadcrumbs([]);
    this.setShowPostButton(false);
  }
}
