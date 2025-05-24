import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Apartment } from './../../core/models/apartment.model';
import { getAuth, onAuthStateChanged } from '@angular/fire/auth';
import { ApartmentService } from '../../Shared/services/apartment.service';
import { CloudinaryService } from '../../Shared/services/image-upload/cloudinary.service';

@Component({
  selector: 'app-post-apartment',
  standalone: false,
  templateUrl: './post-apartment.component.html',
  styleUrls: ['./post-apartment.component.css']
})
export class PostApartmentComponent implements OnInit {
  URL = window.URL; // For creating local object URLs for preview
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

  // This will hold the File objects selected by the user
  selectedFilesToUpload: File[] = [];
  // This will hold the Cloudinary URLs (either existing or newly uploaded)
  finalImageUrls: string[] = [];

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

  /**
   * Initializes the apartment form with default values and validators.
   */
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
      images: [[]], // This form control will eventually hold the Cloudinary URLs
      contactName: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]],
    });
  }

  /**
   * Populates the form fields if apartment data is available for editing (e.g., from preview).
   */
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

      // Set existing images for the UploadImageComponent
      this.finalImageUrls = this.previewApartmentData.images || [];
      console.log('Populating form with:', this.previewApartmentData);
    }
  }

  /**
   * Getter for the amenities FormArray.
   */
  get amenitiesFormArray(): FormArray {
    return this.apartmentForm.get('amenities') as FormArray;
  }

  /**
   * Helper to get a FormControl from the main form or a FormGroup within it.
   * @param controlName The name of the form control.
   * @param groupName (Optional) The name of the FormGroup if the control is nested.
   * @returns The FormControl or null if not found.
   */
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

  /**
   * Returns a comma-separated string of selected amenity names.
   */
  getSelectedAmenities(): string {
    return this.allAmenities
      .filter((_, i) => this.amenitiesFormArray.at(i).value)
      .map(a => a.name)
      .join(', ');
  }

  /**
   * Gets a specific amenity FormControl by its index.
   * @param index The index of the amenity in the FormArray.
   * @returns The FormControl for the amenity.
   */
  getAmenityControl(index: number): FormControl {
    return this.amenitiesFormArray.at(index) as FormControl;
  }

  /**
   * Callback for when files are selected in the UploadImageComponent.
   * Updates the `selectedFilesToUpload` array.
   * @param files The array of File objects emitted by UploadImageComponent.
   */
  onFilesSelected(files: File[]): void {
    this.selectedFilesToUpload = files;
    console.log('Files selected for upload:', this.selectedFilesToUpload);
  }

  /**
   * Uploads the selected files to Cloudinary.
   * @returns A Promise that resolves with an array of uploaded image URLs.
   */
  async uploadImages(): Promise<string[]> {
    const uploadedUrls: string[] = [];
    for (const file of this.selectedFilesToUpload) {
      try {
        const urlResponse = await this.cloudinaryService.uploadImage(file).toPromise();
        if (urlResponse && urlResponse.secure_url) {
          uploadedUrls.push(urlResponse.secure_url);
        } else {
          console.warn('Cloudinary upload response missing secure_url:', urlResponse);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        throw error; // Re-throw to propagate the error
      }
    }
    return uploadedUrls;
  }

  /**
   * Handles the "Preview" button click.
   * Prepares apartment data for preview, including local image URLs if new files are selected.
   */
  async onPreview(): Promise<void> {
    console.log('Preview button clicked');
    if (this.apartmentForm.invalid) {
      this.apartmentForm.markAllAsTouched();
      return;
    }

    const formValue = this.apartmentForm.value;
    const selectedAmenities = this.getSelectedAmenities().split(', ');

    // Determine images for preview:
    // 1. If new files are selected, use their local object URLs.
    // 2. Otherwise, use existing Cloudinary URLs.
    // 3. If neither, use the default image.
    const previewImages = this.selectedFilesToUpload.length > 0
      ? this.selectedFilesToUpload.map(file => this.URL.createObjectURL(file))
      : (this.finalImageUrls.length > 0 ? this.finalImageUrls : []);

    this.previewApartmentData = {
      ...formValue,
      amenities: selectedAmenities,
      isShared: formValue.isShared,
      isFurnished: formValue.isFurnished,
      utilitiesIncluded: formValue.utilitiesIncluded,
      images: previewImages,
      contactName: formValue.contactName,
      contactEmail: formValue.contactEmail,
    };

    this.apartmentService.setApartmentData(this.previewApartmentData);
    this.router.navigate(['/apartment/apartment-detail'], { state: { apartmentData: this.previewApartmentData }, queryParams: { fromPreview: true } });
  }

  /**
   * Handles the form submission.
   * Uploads images to Cloudinary if new files are selected, then submits apartment data.
   */
  async onSubmit(): Promise<void> {
    if (this.apartmentForm.invalid) {
      this.apartmentForm.markAllAsTouched();
      return;
    }

    let imagesForSubmission: string[] = [...this.finalImageUrls]; // Start with existing images

    // If new files are selected, upload them and add to the list
    if (this.selectedFilesToUpload.length > 0) {
      try {
        const newlyUploadedUrls = await this.uploadImages();
        imagesForSubmission = [...imagesForSubmission, ...newlyUploadedUrls];
      } catch (err) {
        console.error('Submission image upload failed:', err);
        // Optionally show an error message to the user
        return; // Stop submission if upload fails
      }
    }

    // If no images (existing or new), use the default image
    if (imagesForSubmission.length === 0) {
      imagesForSubmission = [];
    }

    const formData: Apartment = {
      ...this.apartmentForm.value,
      apartmentBuilding: this.apartmentForm.value.apartmentBuildingName || this.apartmentForm.value.apartmentBuilding,
      amenities: this.getSelectedAmenities().split(', '),
      images: imagesForSubmission, // Use the final list of Cloudinary URLs
    };

    this.apartmentService.addApartment(formData).subscribe({
      next: () => {
        this.resetForm();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Failed to submit apartment:', err);
        // Optionally show an error message to the user
      }
    });
  }

  /**
   * Resets the form and image related state.
   */
  resetForm(): void {
    this.apartmentForm.reset();
    this.selectedFilesToUpload = [];
    this.finalImageUrls = [];

    // Reset amenity checkboxes
    const amenitiesArray = this.apartmentForm.get('amenities') as FormArray;
    amenitiesArray.clear();
    this.allAmenities.forEach(() => amenitiesArray.push(new FormControl(false)));
  }
}