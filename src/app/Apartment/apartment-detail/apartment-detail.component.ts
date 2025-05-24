import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApartmentService } from '../../Shared/services/apartment.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Apartment } from './../../core/models/apartment.model';
import { environment } from '../../../environments/environment.production';

@Component({
  selector: 'app-apartment-detail',
  standalone: false,
  templateUrl: './apartment-detail.component.html',
  styleUrl: './apartment-detail.component.css'
})
export class ApartmentDetailComponent implements OnInit, OnDestroy {
  apartmentData: Apartment | any;
  private subscription: Subscription | undefined;
  currentImageIndex = 0;
  defaultImageUrl: string = environment.defaultApartmentImage;
  isFavorite: boolean = false;
  previousPage: 'dashboard' | 'listings' | null = null;
  activeTab: 'overview' | 'details' = 'overview'; // Initially show overview

  constructor(
    private apartmentService: ApartmentService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const fromPreview = params['fromPreview'];
      const fromListing = params['fromListing'];
      if (fromPreview === 'true') {
        this.previousPage = 'dashboard';
      } else if (fromListing === 'true') {
        this.previousPage = 'listings';
      } else {
        this.previousPage = 'dashboard';
      }
    });

    this.subscription = this.apartmentService.currentApartmentData.subscribe(data => {
      this.apartmentData = data;
      if (this.apartmentData) {
        this.isFavorite = this.apartmentData.isFavorite || false;
      }
    });
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
    if (this.previousPage === 'listings') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/apartment/post-apartment'], { state: { apartmentData: this.apartmentData } });
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