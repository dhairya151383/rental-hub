import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.production';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
 private readonly cloudName = environment.cloudName;
  private readonly uploadPreset = environment.uploadPreset;

  constructor(private http: HttpClient) {}

  uploadImage(file: File) {
    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    return this.http.post<any>(url, formData);
  }
}
