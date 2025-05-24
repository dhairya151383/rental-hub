import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-upload-image',
  standalone: false, // Assuming it's part of a shared module
  templateUrl: './upload-image.component.html',
  styleUrls: ['./upload-image.component.css']
})
export class UploadImageComponent {
  // Input: Existing image URLs (e.g., from an edit scenario)
  @Input() existingImageUrls: string[] = [];
  // Output: Emits the selected File objects (not URLs yet)
  @Output() filesSelected = new EventEmitter<File[]>();
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  URL = window.URL;

  constructor() { }

  onFileSelected(event: any): void {
    this.selectedFiles = [];
    this.previewUrls = [];   // Clear previous previews

    if (event.target.files && event.target.files.length > 0) {
      for (let i = 0; i < event.target.files.length; i++) {
        const file = event.target.files[i];
        this.selectedFiles.push(file);
        this.previewUrls.push(this.URL.createObjectURL(file));
      }
    }
    // Emit the selected File objects to the parent component immediately
    this.filesSelected.emit(this.selectedFiles);
  }
}