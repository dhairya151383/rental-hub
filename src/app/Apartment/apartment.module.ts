import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { ApartmentDetailComponent } from './apartment-detail/apartment-detail.component';
import { PostApartmentComponent } from './post-apartment/post-apartment.component';
import { ApartmentRoutingModule } from './apartment-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApartmentCommentsComponent } from './apartment-comments/apartment-comments.component';
import { ApartmentListingsComponent } from './apartment-listings/apartment-listings.component';



@NgModule({
  declarations: [
    ApartmentDetailComponent,
    PostApartmentComponent,
    ApartmentCommentsComponent,
    ApartmentListingsComponent,
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule,
    ApartmentRoutingModule,
    ReactiveFormsModule,
    FormsModule 
  ],
  exports: [ ApartmentListingsComponent ,PostApartmentComponent, ApartmentDetailComponent, ApartmentCommentsComponent]
})
export class ApartmentModule { }
