import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
    private navService: NavService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const routeId = this.route.snapshot.paramMap.get('id');
    this.route.queryParams.subscribe(params => {
      this.previousPage = params['fromPostApartment'] === 'true' ? 'postApartment' : 'dashboard';
      this.subscription = this.apartmentService.currentApartmentData.subscribe(data => {
        this.apartmentData = data;
        if (this.apartmentData) {
          this.isFavorite = this.apartmentData.isFavorite || false;
          console.log('1' + this.apartmentData)
        } else {
          if (routeId && routeId !== 'preview') {
            this.apartmentService.getApartmentById(routeId).subscribe({
              next: (apartment) => {
                if (apartment) {
                  this.apartmentData = apartment;
                  this.isFavorite = apartment.isFavorite || false;
                  this.cdr.detectChanges();
                } else {
                  this.router.navigate(['/dashboard']);
                }
              },
              error: () => this.router.navigate(['/dashboard'])
            });
          } else {
            this.router.navigate(['/dashboard']);
          }
        }
      });

      if (this.previousPage === 'postApartment') {
        this.navService.setBreadcrumbs(['Post', 'Detail']);
      } else {
        this.navService.setBreadcrumbs(['Detail']);
      }
    });
  }


  private setBreadcrumbs() {
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
function take(arg0: number): import("rxjs").OperatorFunction<import("@angular/router").Params, unknown> {
  throw new Error('Function not implemented.');
}

