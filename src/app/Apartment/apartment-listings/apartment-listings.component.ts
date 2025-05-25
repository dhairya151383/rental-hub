import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApartmentService } from '../../Shared/services/apartment.service';
import { Apartment } from '../../core/models/apartment.model';
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

  loadApartments(): void {
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
          images: apartment.images?.length ? apartment.images : [this.defaultImageUrl],
          isFavorite: apartment.isFavorite === true
        }));

        this.favoriteApartments = this.apartments.filter(a => a.isFavorite);
        this.showCarousel = this.favoriteApartments.length > 0;
      },
      error: (err) => {
        console.error('Failed to fetch apartments:', err);
        alert('Error fetching apartment listings. Please try again later.');
      }
    });
  }

  markAsFavorite(apartment: Apartment): void {
    if (!apartment?.id) {
      alert('Invalid apartment data.');
      return;
    }

    const newFavoriteStatus = !apartment.isFavorite;
    apartment.isFavorite = newFavoriteStatus; // Optimistic update

    this.apartmentService.updateApartmentFavoriteStatus(apartment.id, newFavoriteStatus)
      .catch(error => {
        console.error('Failed to update favorite status:', error);
        alert('Failed to update favorite status. Please try again.');
        apartment.isFavorite = !newFavoriteStatus; // Revert on error
      });
  }

  viewDetails(apartment: Apartment): void {
    if (!apartment?.id) {
      alert('Apartment details unavailable.');
      return;
    }

    this.apartmentService.setApartmentData(apartment);
    this.router.navigate(['/apartment/apartment-detail', apartment.id], { queryParams: { fromListing: true } });
  }
}
