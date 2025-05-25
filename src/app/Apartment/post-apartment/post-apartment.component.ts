import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Apartment } from './../../core/models/apartment.model';
import { getAuth, onAuthStateChanged } from '@angular/fire/auth';
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

  selectedFilesToUpload: File[] = [];
  finalImageUrls: string[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apartmentService: ApartmentService,
    private cloudinaryService: CloudinaryService,
    private activatedRoute: ActivatedRoute,
    private navService: NavService
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
        this.router.navigate(['/login']);
      }
    });
    this.navService.setBreadcrumbs(['Post']);
    this.navService.setShowPostButton(false);
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

  populateFormForEdit(): void {
    if (this.previewApartmentData) {
      this.apartmentForm.patchValue({
        ...this.previewApartmentData,
        propertyLocation: { streetAddress: this.previewApartmentData?.propertyLocation?.streetAddress },
        propertyDetails: { ...this.previewApartmentData?.propertyDetails },
        expectedRent: { ...this.previewApartmentData?.expectedRent }
      });

      const amenitiesArray = this.apartmentForm.get('amenities') as FormArray;
      amenitiesArray.clear();
      this.allAmenities.forEach(amenity => {
        const isSelected = this.previewApartmentData.amenities?.includes(amenity.name);
        amenitiesArray.push(this.fb.control(isSelected));
      });

      this.finalImageUrls = this.previewApartmentData.images || [];
    }
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

  getSelectedAmenities(): string[] {
    return this.allAmenities
      .filter((_, i) => this.amenitiesFormArray.at(i).value)
      .map(a => a.name);
  }

  getAmenityControl(index: number): FormControl {
    return this.amenitiesFormArray.at(index) as FormControl;
  }

  onFilesSelected(files: File[]): void {
    this.selectedFilesToUpload = files;
  }

  async uploadImages(): Promise<string[]> {
    const uploadedUrls: string[] = [];
    for (const file of this.selectedFilesToUpload) {
      try {
        const urlResponse = await this.cloudinaryService.uploadImage(file).toPromise();
        if (urlResponse?.secure_url) {
          uploadedUrls.push(urlResponse.secure_url);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
      }
    }
    return uploadedUrls;
  }

  async onPreview(): Promise<void> {
    if (this.apartmentForm.invalid) {
      this.apartmentForm.markAllAsTouched();
      return;
    }

    const formValue = this.apartmentForm.value;
    const selectedAmenities = this.getSelectedAmenities();

    const previewImages = this.selectedFilesToUpload.length > 0
      ? this.selectedFilesToUpload.map(file => this.URL.createObjectURL(file))
      : (this.finalImageUrls.length > 0 ? this.finalImageUrls : []);

    this.previewApartmentData = {
      ...formValue,
      amenities: selectedAmenities,
      images: previewImages,
    };

    this.apartmentService.setApartmentData(this.previewApartmentData);
    this.router.navigate(['/apartment/apartment-detail', this.previewApartmentData.id || 'preview'], {
      state: { apartmentData: this.previewApartmentData },
      queryParams: { fromPostApartment: true }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.apartmentForm.invalid) {
      this.apartmentForm.markAllAsTouched();
      return;
    }

    let imagesForSubmission: string[] = [...this.finalImageUrls];

    if (this.selectedFilesToUpload.length > 0) {
      try {
        const newlyUploadedUrls = await this.uploadImages();
        imagesForSubmission = [...imagesForSubmission, ...newlyUploadedUrls];
      } catch (err) {
        console.error('Submission image upload failed:', err);
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
