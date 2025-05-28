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
  filteredApartments: Apartment[] = [];
  filterText: string = '';
  sortBy: 'rentAsc' | 'rentDesc' | 'sizeAsc' | 'sizeDesc' | '' = '';

  favoriteApartments: Apartment[] = [];
  showCarousel = false;
  defaultImageUrl: string = environment.defaultApartmentImage;

  constructor(
    private apartmentService: ApartmentService,
    private router: Router
  ) { }

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
        this.updateFavoriteApartments();
        this.applyFilterAndSort();
      },
      error: (err) => {
        alert('Error fetching apartment listings. Please try again later.');
      }
    });
  }


  updateFavoriteApartments(): void {
    this.favoriteApartments = this.apartments.filter(a => a.isFavorite);
    this.showCarousel = this.favoriteApartments.length > 0;
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
      this.applyFilterAndSort();
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
  applyFilterAndSort(): void {
    let result = [...this.apartments];

    // Filter by text: title or streetAddress contains filterText (case insensitive)
    if (this.filterText.trim().length > 0) {
      const filter = this.filterText.toLowerCase();
      result = result.filter(apt =>
        apt.title.toLowerCase().includes(filter) ||
        apt.propertyLocation.streetAddress.toLowerCase().includes(filter)
      );
    }

    // Sort
    switch (this.sortBy) {
      case 'rentAsc':
        result.sort((a, b) => a.expectedRent.expectedRent - b.expectedRent.expectedRent);
        break;
      case 'rentDesc':
        result.sort((a, b) => b.expectedRent.expectedRent - a.expectedRent.expectedRent);
        break;
      case 'sizeAsc':
        result.sort((a, b) => a.propertyDetails.squareFeet - b.propertyDetails.squareFeet);
        break;
      case 'sizeDesc':
        result.sort((a, b) => b.propertyDetails.squareFeet - a.propertyDetails.squareFeet);
        break;
    }

    this.filteredApartments = result;
  }

  // Triggered when filter input or sort changes
  onFilterChange(value: string): void {
    this.filterText = value;
    this.applyFilterAndSort();
  }

  onSortChange(value: string): void {
    this.sortBy = value as any;
    this.applyFilterAndSort();
  }
}
