import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { getAuth, onAuthStateChanged } from '@angular/fire/auth';

import { Apartment } from './../../core/models/apartment.model';
import { ApartmentService } from '../../Shared/services/apartment.service';
import { CloudinaryService } from '../../Shared/services/image-upload/cloudinary.service';
import { NavService } from '../../Shared/services/nav.service';

@Component({
  selector: 'app-post-apartment',
  standalone: false,
  templateUrl: './post-apartment.component.html',
  styleUrls: ['./post-apartment.component.css']
})
export class PostApartmentComponent implements OnInit {
  apartmentForm!: FormGroup;
  isPreview = false;
  previewApartmentData: any;
  finalImageUrls: string[] = [];
  selectedFilesToUpload: File[] = [];

  apartmentBuildings = ['Sunshine Residency', 'Maple Heights', 'Ocean View'];
  leaseTypes = ['Long term (6+ months)', 'Short term', 'Both'];
  allAmenities = [
    'Gym/Fitness Center', 'Swimming Pool', 'Park', 'Visitors Parking', 'Power Backup',
    'Garbage Disposal', 'Private Lawn', 'Water Heater', 'Plant Security System',
    'Laundry Service', 'Fire Alarm', 'Club House'
  ].map(name => ({ name }));

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private apartmentService: ApartmentService,
    private cloudinaryService: CloudinaryService,
    private navService: NavService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.previewApartmentData = navigation?.extras?.state?.['apartmentData'];
  }

  ngOnInit(): void {
    this.initializeForm();
    this.populateFormForEdit();

    onAuthStateChanged(getAuth(), user => {
      if (!user) {
        this.router.navigate(['/login']);
      }
    });

    this.navService.setBreadcrumbs(['Post']);
    this.navService.setShowPostButton(false);
  }

  /**
   * Initialize the apartment form group with nested controls.
   */
  private initializeForm(): void {
    this.apartmentForm = this.fb.group({
      apartmentBuilding: [''],
      apartmentBuildingName: [''],
      isShared: [false, Validators.required],
      propertyLocation: this.fb.group({
        streetAddress: ['', Validators.required]
      }),
      propertyDetails: this.fb.group({
        squareFeet: [null, [Validators.required, Validators.min(1)]],
        leaseType: ['', Validators.required],
        beds: [0, [Validators.required, Validators.min(0)]],
        baths: [0, [Validators.required, Validators.min(0)]],
      }),
      expectedRent: this.fb.group({
        expectedRent: [null, [Validators.required, Validators.min(1)]],
        negotiable: [false],
      }),
      utilitiesIncluded: [false],
      isFurnished: [false, Validators.required],
      amenities: this.fb.array(this.allAmenities.map(() => this.fb.control(false))),
      description: ['', [Validators.required, Validators.maxLength(1400)]],
      title: ['', Validators.required],
      images: [[]],
      contactName: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]],
    });
  }

  /**
   * Populate form when in edit/preview mode.
   */
  private populateFormForEdit(): void {
    if (!this.previewApartmentData) return;

    this.apartmentForm.patchValue({
      ...this.previewApartmentData,
      propertyLocation: {
        streetAddress: this.previewApartmentData?.propertyLocation?.streetAddress
      },
      propertyDetails: { ...this.previewApartmentData?.propertyDetails },
      expectedRent: { ...this.previewApartmentData?.expectedRent }
    });

    const amenitiesArray = this.amenitiesFormArray;
    amenitiesArray.clear();
    this.allAmenities.forEach(amenity => {
      const isSelected = this.previewApartmentData.amenities?.includes(amenity.name);
      amenitiesArray.push(this.fb.control(isSelected));
    });

    this.finalImageUrls = this.previewApartmentData.images || [];
  }

  get amenitiesFormArray(): FormArray {
    return this.apartmentForm.get('amenities') as FormArray;
  }

  getFormControl(controlName: string, groupName?: string): FormControl | null {
    const control = groupName
      ? (this.apartmentForm.get(groupName) as FormGroup)?.get(controlName)
      : this.apartmentForm.get(controlName);
    return control instanceof FormControl ? control : null;
  }

  getAmenityControl(index: number): FormControl {
    return this.amenitiesFormArray.at(index) as FormControl;
  }

  getSelectedAmenities(): string[] {
    return this.allAmenities
      .filter((_, i) => this.amenitiesFormArray.at(i).value)
      .map(a => a.name);
  }

  onFilesSelected(files: File[]): void {
    this.selectedFilesToUpload = files;
  }

  /**
   * Uploads images to Cloudinary and returns secure URLs.
   */
  private async uploadImages(): Promise<string[]> {
    const uploadedUrls: string[] = [];

    for (const file of this.selectedFilesToUpload) {
      try {
        const response = await this.cloudinaryService.uploadImage(file).toPromise();
        if (response?.secure_url) {
          uploadedUrls.push(response.secure_url);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
      }
    }

    return uploadedUrls;
  }

  /**
   * Handles previewing the apartment post.
   */
  async onPreview(): Promise<void> {
    if (this.apartmentForm.invalid) {
      this.apartmentForm.markAllAsTouched();
      return;
    }

    const formValue = this.apartmentForm.value;
    const selectedAmenities = this.getSelectedAmenities();
    const previewImages = this.selectedFilesToUpload.length
      ? this.selectedFilesToUpload.map(file => window.URL.createObjectURL(file))
      : this.finalImageUrls;

    this.previewApartmentData = {
      ...formValue,
      amenities: selectedAmenities,
      images: previewImages
    };

    this.apartmentService.setApartmentData(this.previewApartmentData);
    this.router.navigate(
      ['/apartment/apartment-detail', this.previewApartmentData.id || 'preview'],
      {
        state: { apartmentData: this.previewApartmentData },
        queryParams: { fromPostApartment: true }
      }
    );
  }

  /**
   * Handles form submission and apartment creation.
   */
  async onSubmit(): Promise<void> {
    if (this.apartmentForm.invalid) {
      this.apartmentForm.markAllAsTouched();
      return;
    }

    let imagesForSubmission = [...this.finalImageUrls];

    if (this.selectedFilesToUpload.length > 0) {
      try {
        const uploadedUrls = await this.uploadImages();
        imagesForSubmission = [...imagesForSubmission, ...uploadedUrls];
      } catch (err) {
        console.error('Image upload failed during submission:', err);
        return;
      }
    }

    const formData: Apartment = {
      ...this.apartmentForm.value,
      apartmentBuilding: this.apartmentForm.value.apartmentBuildingName || this.apartmentForm.value.apartmentBuilding,
      amenities: this.getSelectedAmenities(),
      images: imagesForSubmission
    };

    this.apartmentService.addApartment(formData);
    this.router.navigate(['/dashboard']);
  }
}
