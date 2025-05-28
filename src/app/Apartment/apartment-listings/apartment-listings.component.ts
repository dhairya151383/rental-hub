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
      console.log('Loaded apartments:', apts); // Debug log

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
        isFavorite: apartment.isFavorite === true // explicitly convert to boolean
      }));

      console.log('Processed apartments with isFavorite:', this.apartments.map(a => ({id: a.id, isFavorite: a.isFavorite})));

      this.updateFavoriteApartments();
    },
    error: (err) => {
      console.error('Failed to fetch apartments:', err);
      alert('Error fetching apartment listings. Please try again later.');
    }
  });
}


  private updateFavoriteApartments(): void {
    console.log('Favorite Apartments:', this.favoriteApartments);
    this.favoriteApartments = this.apartments.filter(a => a.isFavorite);
    console.log('Favorite Apartments2:', this.favoriteApartments);
    this.showCarousel = this.favoriteApartments.length > 0;
    console.log('showCarousel', this.showCarousel);
  }

  async markAsFavorite(apartment: Apartment): Promise<void> {
    if (!apartment?.id) {
      alert('Invalid apartment data.');
      return;
    }

    const newFavoriteStatus = !apartment.isFavorite;

    try {
      // Await the backend update first
      await this.apartmentService.updateApartmentFavoriteStatus(apartment.id, newFavoriteStatus);

      // Update local apartments list immutably
      this.apartments = this.apartments.map(a => 
        a.id === apartment.id ? { ...a, isFavorite: newFavoriteStatus } : a
      );

      // Refresh favorites list and carousel visibility
      this.updateFavoriteApartments();
    } catch (error) {
      console.error('Failed to update favorite status:', error);
      alert('Failed to update favorite status. Please try again.');
    }
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
