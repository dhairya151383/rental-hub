import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApartmentService } from '../../Shared/services/apartment.service';
import { Apartment } from '../../core/models/apartment.model';
import { environment } from '../../../environments/environment.production';

@Component({
  selector: 'app-apartment-listings',
  standalone: false,
  templateUrl: './apartment-listings.component.html',
  styleUrls: ['./apartment-listings.component.css']
})
export class ApartmentListingsComponent implements OnInit, OnDestroy {
  apartments: Apartment[] = [];
  filteredApartments: Apartment[] = [];
  favoriteApartments: Apartment[] = [];

  filterText = '';
  sortBy: 'rentAsc' | 'rentDesc' | 'sizeAsc' | 'sizeDesc' | '' = '';
  showCarousel = false;
  defaultImageUrl = environment.defaultApartmentImage;

  private apartmentsSub?: Subscription;

  constructor(
    private apartmentService: ApartmentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadApartments();
  }

  ngOnDestroy(): void {
    this.apartmentsSub?.unsubscribe();
  }

  private loadApartments(): void {
    this.apartmentsSub?.unsubscribe();

    this.apartmentsSub = this.apartmentService.getApartments().subscribe({
      next: (apts: Apartment[]) => {
        if (!Array.isArray(apts)) {
          console.error('Invalid apartment data received:', apts);
          this.apartments = [];
          this.favoriteApartments = [];
          this.showCarousel = false;
          this.cdr.detectChanges();
          return;
        }

        this.apartments = apts.map(apartment => ({
          ...apartment,
          images: apartment.images?.length ? apartment.images : [this.defaultImageUrl],
          
          isFavorite: apartment.isFavorite === true
        }));
        console.log(this.apartments)
        this.updateFavoriteApartments();
        this.applyFilterAndSort();
        this.cdr.detectChanges();
      },
      error: () => {
        alert('Error fetching apartment listings. Please try again later.');
      }
    });
  }

  private updateFavoriteApartments(): void {
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
      await this.apartmentService.updateApartmentFavoriteStatus(apartment.id, newFavoriteStatus);
      this.apartments = this.apartments.map(a =>
        a.id === apartment.id ? { ...a, isFavorite: newFavoriteStatus } : a
      );

      this.updateFavoriteApartments();
      this.applyFilterAndSort();
      this.cdr.detectChanges();
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
    this.router.navigate(['/apartment/apartment-detail', apartment.id], {
      queryParams: { fromListing: true }
    });
  }

  applyFilterAndSort(): void {
    let result = [...this.apartments];

    if (this.filterText.trim()) {
      const filter = this.filterText.toLowerCase();
      result = result.filter(apt =>
        apt.title.toLowerCase().includes(filter) ||
        apt.propertyLocation.streetAddress.toLowerCase().includes(filter)
      );
    }

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

  onFilterChange(value: string): void {
    this.filterText = value;
    this.applyFilterAndSort();
  }

  onSortChange(value: string): void {
    this.sortBy = value as typeof this.sortBy;
    this.applyFilterAndSort();
  }
}
