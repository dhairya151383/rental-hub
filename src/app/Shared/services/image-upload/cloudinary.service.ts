import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.production';
import { CloudinaryUploadResponse } from './../../../core/models/cloudinaryUploadResponse.model';
@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private readonly cloudName = environment.cloudName;
  private readonly uploadPreset = environment.uploadPreset;

  constructor(private readonly http: HttpClient) { }

  /**
   * Uploads an image file to Cloudinary.
   * @param file Image file to upload.
   * @returns Observable with the upload response.
   */
  uploadImage(file: File) {
    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    return this.http.post<CloudinaryUploadResponse>(url, formData);
  }
}
