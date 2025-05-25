import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApartmentService } from '../../Shared/services/apartment.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Apartment } from './../../core/models/apartment.model';
import { environment } from '../../../environments/environment.production';
import { NavService } from '../../Shared/services/nav.service';

@Component({
  selector: 'app-apartment-detail',
  standalone: false,
  templateUrl: './apartment-detail.component.html',
  styleUrls: ['./apartment-detail.component.css']
})
export class ApartmentDetailComponent implements OnInit, OnDestroy {
  apartmentData: Apartment | any;
  private subscription: Subscription | undefined;
  currentImageIndex = 0;
  defaultImageUrl: string = environment.defaultApartmentImage;
  isFavorite: boolean = false;

  // This keeps track of where user came from for breadcrumb/navigation logic
  previousPage: 'dashboard' | 'postApartment' | null = null;
  activeTab: 'overview' | 'details' = 'overview'; // Initially show overview

  constructor(
    private apartmentService: ApartmentService,
    private router: Router,
    private route: ActivatedRoute,
    private navService:NavService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      // Detect the page user came from via query params
      // If navigated from post-apartment, param fromPostApartment=true will be set
      if (params['fromPostApartment'] === 'true') {
        this.previousPage = 'postApartment';
      } else {
        // Default to dashboard if no specific param
        this.previousPage = 'dashboard';
      }
    });

    // Subscribe to the apartment data observable
    this.subscription = this.apartmentService.currentApartmentData.subscribe(data => {
      this.apartmentData = data;
      if (this.apartmentData) {
        this.isFavorite = this.apartmentData.isFavorite || false;
      }
    });
    if (this.previousPage === 'postApartment') {
    this.navService.setBreadcrumbs(['Post', 'Detail']);
  } else {
    this.navService.setBreadcrumbs(['Detail']);
  }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getAmenities(amenities: string[]): string {
    if (!amenities || amenities.length === 0) {
      return 'No amenities listed';
    }
    return amenities.join(', ');
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
    this.router.navigate(['/dashboard']);
  }
}


  nextImage(): void {
    if (this.apartmentData?.images) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.apartmentData.images.length;
    }
  }

  prevImage(): void {
    if (this.apartmentData?.images) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.apartmentData.images.length) % this.apartmentData.images.length;
    }
  }

  setCurrentImage(index: number): void {
    this.currentImageIndex = index;
  }

  getBeds(): number {
    return this.apartmentData?.propertyDetails?.beds || 0;
  }

  getBaths(): number {
    return this.apartmentData?.propertyDetails?.baths || 0;
  }

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
    if (this.apartmentData?.id) {
      this.apartmentService.updateApartmentFavoriteStatus(this.apartmentData.id, this.isFavorite)
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
