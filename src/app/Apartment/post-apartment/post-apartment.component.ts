import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApartmentService } from '../../Shared/services/apartment.service';
import { Apartment } from './../../core/models/apartment.model';
import { CloudinaryService } from '../../Shared/services/image-upload/cloudinary.service';
import { getAuth, onAuthStateChanged } from '@angular/fire/auth';

@Component({
  selector: 'app-post-apartment',
  standalone: false,
  templateUrl: './post-apartment.component.html',
  styleUrls: ['./post-apartment.component.css']
})
export class PostApartmentComponent implements OnInit {
  defaultImageUrl: string = 'assets/images/default-apartment.png';
  URL = window.URL;
  apartmentForm!: FormGroup;
  isPreview = false;
  previewApartmentData: any;
  apartmentBuildings = ['Sunshine Residency', 'Maple Heights', 'Ocean View'];
  leaseTypes = ['Long term (6+ months)', 'Short term', 'Both'];
  allAmenities = [
    { name: 'Gym/Fitness Center' },
    { name: 'Swimming Pool' },
    { name: 'Park' },
    { name: 'Visitors Parking' },
    { name: 'Power Backup' },
    { name: 'Garbage Disposal' },
    { name: 'Private Lawn' },
    { name: 'Water Heater' },
    { name: 'Plant Security System' },
    { name: 'Laundry Service' },
    { name: 'Fire Alarm' },
    { name: 'Club House' }
  ];

  selectedFiles: File[] = [];
  uploadedImageUrls: string[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apartmentService: ApartmentService,
    private cloudinaryService: CloudinaryService,
    private activatedRoute: ActivatedRoute
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.previewApartmentData = navigation?.extras?.state?.['apartmentData'];
  }

  ngOnInit(): void {
    this.initializeForm();
    this.populateFormForEdit();

    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.warn('User not logged in, redirecting to login...');
        this.router.navigate(['/login']);
      }
    });
  }

  populateFormForEdit(): void {
    if (this.previewApartmentData) {
      this.apartmentForm.patchValue({
        apartmentBuilding: this.previewApartmentData.apartmentBuilding,
        apartmentBuildingName: this.previewApartmentData.apartmentBuildingName,
        isShared: this.previewApartmentData.isShared,
        propertyLocation: this.previewApartmentData.propertyLocation,
        propertyDetails: {
          squareFeet: this.previewApartmentData.propertyDetails?.squareFeet,
          leaseType: this.previewApartmentData.propertyDetails?.leaseType,
          beds: this.previewApartmentData.propertyDetails?.beds,
          baths: this.previewApartmentData.propertyDetails?.baths,
        },
        expectedRent: {
          expectedRent: this.previewApartmentData.expectedRent?.expectedRent,
          negotiable: this.previewApartmentData.expectedRent?.negotiable,
        },
        utilitiesIncluded: this.previewApartmentData.utilitiesIncluded,
        isFurnished: this.previewApartmentData.isFurnished,
        description: this.previewApartmentData.description,
        title: this.previewApartmentData.title,
        images: this.previewApartmentData.images || [],
        contactName: this.previewApartmentData.contactName,
        contactEmail: this.previewApartmentData.contactEmail,
      });

      // Update amenities checkboxes
      const amenitiesArray = this.apartmentForm.get('amenities') as FormArray;
      amenitiesArray.clear();
      this.allAmenities.forEach(amenity => {
        const isSelected = this.previewApartmentData.amenities?.includes(amenity.name);
        amenitiesArray.push(this.fb.control(isSelected));
      });

      this.uploadedImageUrls = this.previewApartmentData.images || [];
      console.log('Populating form with:', this.previewApartmentData);
    }
  }

  initializeForm(): void {
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

  get amenitiesFormArray(): FormArray {
    return this.apartmentForm.get('amenities') as FormArray;
  }

  getFormControl(controlName: string, groupName?: string): FormControl | null {
    if (groupName) {
      const group = this.apartmentForm.get(groupName);
      if (group instanceof FormGroup) {
        const control = group.get(controlName);
        return control instanceof FormControl ? control : null;
      }
      return null;
    }
    const control = this.apartmentForm.get(controlName);
    return control instanceof FormControl ? control : null;
  }

  getSelectedAmenities(): string {
    return this.allAmenities
      .filter((_, i) => this.amenitiesFormArray.at(i).value)
      .map(a => a.name)
      .join(', ');
  }

  getAmenityControl(index: number): FormControl {
    return this.amenitiesFormArray.at(index) as FormControl;
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFiles = [];
      for (let i = 0; i < event.target.files.length; i++) {
        this.selectedFiles.push(event.target.files[i]);
      }
    }
  }

  async uploadImages(): Promise<string[]> {
    const uploadedUrls: string[] = [];
    for (const file of this.selectedFiles) {
      try {
        const url = await this.cloudinaryService.uploadImage(file).toPromise();
        uploadedUrls.push(url.secure_url);
      } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
      }
    }
    return uploadedUrls;
  }

  async onPreview(): Promise<void> {
    console.log('Preview button clicked');
    if (this.apartmentForm.invalid) {
      this.apartmentForm.markAllAsTouched();
      return;
    }

    try {
      if (this.selectedFiles.length) {
        this.uploadedImageUrls = await this.uploadImages();
      }
    } catch (err) {
      console.error('Preview image upload failed:', err);
      return;
    }

    const formValue = this.apartmentForm.value;
    const selectedAmenities = this.getSelectedAmenities().split(', ');
    const previewImages = this.uploadedImageUrls.length > 0 ? this.uploadedImageUrls : [this.defaultImageUrl];

    this.previewApartmentData = {
      ...formValue,
      amenities: selectedAmenities,
      isShared: formValue.isShared,
      isFurnished: formValue.isFurnished,
      utilitiesIncluded: formValue.utilitiesIncluded,
      images: previewImages,
      // Include contact details for preview if needed
      contactName: formValue.contactName,
      contactEmail: formValue.contactEmail,
    };

    this.apartmentService.setApartmentData(this.previewApartmentData);
    this.router.navigate(['/apartment/apartment-detail'], { state: { apartmentData: this.previewApartmentData }, queryParams: { fromPreview: true } });
  }

  async onSubmit(): Promise<void> {
    if (this.apartmentForm.invalid) {
      this.apartmentForm.markAllAsTouched();
      return;
    }

    try {
      if (this.selectedFiles.length) {
        this.uploadedImageUrls = await this.uploadImages();
      }
    } catch (err) {
      console.error('Submission image upload failed:', err);
      return;
    }

    const finalImages = this.uploadedImageUrls.length > 0 ? this.uploadedImageUrls : [this.defaultImageUrl];

    const formData: Apartment = {
      ...this.apartmentForm.value,
      apartmentBuilding: this.apartmentForm.value.apartmentBuildingName || this.apartmentForm.value.apartmentBuilding,
      amenities: this.getSelectedAmenities().split(', '),
      images: finalImages,
    };

    this.apartmentService.addApartment(formData).subscribe({
      next: () => {
        this.resetForm();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Failed to submit apartment:', err);
      }
    });
  }

  resetForm(): void {
    this.apartmentForm.reset();
    this.selectedFiles = [];
    this.uploadedImageUrls = [];

    // Reset amenity checkboxes
    const amenitiesArray = this.apartmentForm.get('amenities') as FormArray;
    amenitiesArray.clear();
    this.allAmenities.forEach(() => amenitiesArray.push(new FormControl(false)));
  }
}