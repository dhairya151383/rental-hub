import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.production';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private readonly cloudName: string = environment.cloudName;
  private readonly uploadPreset: string = environment.uploadPreset;

  constructor(private readonly http: HttpClient) {}

  /**
   * Uploads an image to Cloudinary
   * @param file - Image file to upload
   * @returns Observable with the upload response
   */
  uploadImage(file: File) {
    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    return this.http.post<any>(url, formData);
  }
}
