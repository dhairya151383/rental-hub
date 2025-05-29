import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-upload-image',
  standalone: false,
  templateUrl: './upload-image.component.html',
  styleUrls: ['./upload-image.component.css']
})
export class UploadImageComponent {
  @Input() existingImageUrls: string[] = [];
  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() existingImageRemoved = new EventEmitter<string>();

  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  private readonly URL = window.URL;

  onFileSelected(event: Event): void {
    this.selectedFiles = [];
    this.previewUrls = [];

    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      Array.from(input.files).forEach(file => {
        this.selectedFiles.push(file);
        this.previewUrls.push(this.URL.createObjectURL(file));
      });
    }
    this.filesSelected.emit(this.selectedFiles);
  }
  /**
   * Removes a newly selected image at the given index
   * and updates the emitted files accordingly.
   */
  removeSelectedImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
    this.filesSelected.emit(this.selectedFiles);
  }

  /**
   * Emits the event to notify parent component
   * that an existing image URL should be removed.
   */
  removeExistingImage(url: string): void {
    this.existingImageRemoved.emit(url);
  }
}
