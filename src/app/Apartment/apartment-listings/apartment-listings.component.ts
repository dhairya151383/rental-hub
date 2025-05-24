import { Component, OnInit } from '@angular/core';
import { Apartment } from './../../core/models/apartment.model';
import { ApartmentService } from '../../Shared/services/apartment.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.production';

@Component({
  selector: 'app-apartment-listings',
  standalone: false,
  templateUrl: './apartment-listings.component.html',
  styleUrls: ['./apartment-listings.component.css']
})
export class ApartmentListingsComponent implements OnInit {
  apartments: Apartment[] = [];
  favoriteApartments: Apartment[] = [];
  showCarousel = false;

  defaultImageUrl: string = environment.defaultApartmentImage;
  constructor(
    private apartmentService: ApartmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadApartments();
  }

  loadApartments() {
    this.apartmentService.getApartments().subscribe({
      next: (apts: Apartment[]) => {
        if (!Array.isArray(apts)) {
          console.error('Invalid apartment data received:', apts);
          this.apartments = [];
          this.favoriteApartments = [];
          this.showCarousel = false;
          return;
        }

        this.apartments = apts.map(apartment => ({
  ...apartment,
  images: apartment.images && apartment.images.length ? apartment.images : [this.defaultImageUrl],
  isFavorite: apartment.isFavorite === true
}));

this.favoriteApartments = this.apartments.filter(a => a.isFavorite === true);

console.log('Favorite Apartments:', this.favoriteApartments);

this.showCarousel = this.favoriteApartments.length > 0;
      },
      error: (err) => {
        console.error('Failed to fetch apartments:', err);
        alert('Error fetching apartment listings. Please try again later.');
      }
    });
  }

  markAsFavorite(apartment: Apartment) {
    if (!apartment || !apartment.id) {
      alert('Apartment data is invalid or ID is missing.');
      return;
    }

    const newFavoriteStatus = !apartment.isFavorite;

    this.apartmentService.updateApartmentFavoriteStatus(apartment.id, newFavoriteStatus)
      .then(() => {
        // Reload the entire page to update carousel
        this.loadApartments();
      })
      .catch(error => {
        console.error('Failed to update favorite status:', error);
        alert('Failed to update favorite status. Please try again.');
      });
  }

  viewDetails(apartment: Apartment) {
    if (!apartment || !apartment.id) {
      alert('Apartment details unavailable.');
      return;
    }
    this.apartmentService.setApartmentData(apartment); // Assuming you are setting the data this way
    this.router.navigate(['/apartment/apartment-detail'], { queryParams: { fromListing: true } });
  }
}
