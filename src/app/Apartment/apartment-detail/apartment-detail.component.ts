import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ApartmentService } from '../../Shared/services/apartment.service';
import { NavService } from '../../Shared/services/nav.service';
import { Apartment } from './../../core/models/apartment.model';
import { environment } from '../../../environments/environment.production';

@Component({
  selector: 'app-apartment-detail',
  standalone: false,
  templateUrl: './apartment-detail.component.html',
  styleUrls: ['./apartment-detail.component.css']
})
export class ApartmentDetailComponent implements OnInit, OnDestroy {
  apartmentData: Apartment | null = null;
  private subscription?: Subscription;
  currentImageIndex = 0;
  readonly defaultImageUrl: string = environment.defaultApartmentImage;
  isFavorite = false;

  previousPage: 'dashboard' | 'postApartment' | null = null;
  activeTab: 'overview' | 'details' = 'overview';

  constructor(
    private apartmentService: ApartmentService,
    private router: Router,
    private route: ActivatedRoute,
    private navService: NavService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const routeId = this.route.snapshot.paramMap.get('id');

    this.route.queryParams.subscribe(params => {
      this.previousPage = params['fromPostApartment'] === 'true' ? 'postApartment' : 'dashboard';
      this.setBreadcrumbs();

      this.subscription = this.apartmentService.currentApartmentData$.subscribe(data => {
        if (data) {
          this.apartmentData = data;
          this.isFavorite = data.isFavorite || false;
        } else if (routeId && routeId !== 'preview') {
          this.loadApartmentById(routeId);
        } else {
          this.redirectToDashboard();
        }
      });
    });
  }

  private loadApartmentById(id: string): void {
    this.apartmentService.getApartmentById(id).subscribe({
      next: (apartment) => {
        if (apartment) {
          this.apartmentData = apartment;
          this.isFavorite = apartment.isFavorite || false;
          this.cdr.detectChanges();
        } else {
          this.redirectToDashboard();
        }
      },
      error: () => this.redirectToDashboard()
    });
  }

  private setBreadcrumbs(): void {
    const breadcrumbs = this.previousPage === 'postApartment' ? ['Post', 'Detail'] : ['Detail'];
    this.navService.setBreadcrumbs(breadcrumbs);
  }

  private redirectToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  getAmenities(amenities: string[] = []): string {
    return amenities.length ? amenities.join(', ') : 'No amenities listed';
  }

  goBack(): void {
    if (this.previousPage === 'postApartment') {
      this.router.navigate(['/apartment/post-apartment'], {
        state: {
          returnFromPost: true,
          apartmentData: this.apartmentData
        }
      });
    } else {
      this.redirectToDashboard();
    }
  }

  nextImage(): void {
    if (this.apartmentData?.images?.length) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.apartmentData.images.length;
    }
  }

  prevImage(): void {
    if (this.apartmentData?.images?.length) {
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.apartmentData.images.length) % this.apartmentData.images.length;
    }
  }

  setCurrentImage(index: number): void {
    this.currentImageIndex = index;
  }

  getBeds(): number {
    return this.apartmentData?.propertyDetails?.beds ?? 0;
  }

  getBaths(): number {
    return this.apartmentData?.propertyDetails?.baths ?? 0;
  }

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;

    if (this.apartmentData?.id) {
      this.apartmentService
        .updateApartmentFavoriteStatus(this.apartmentData.id, this.isFavorite)
        .then(() => {
          if (this.apartmentData) {
            this.apartmentData.isFavorite = this.isFavorite;
          }
        })
        .catch(error => {
          console.error('Failed to update favorite status:', error);
          this.isFavorite = !this.isFavorite;
        });
    }
  }
}
