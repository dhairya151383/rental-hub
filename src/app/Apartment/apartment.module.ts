import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PostApartmentComponent } from './post-apartment/post-apartment.component';
import { ApartmentListingsComponent } from './apartment-listings/apartment-listings.component';
import { ApartmentDetailComponent } from './apartment-detail/apartment-detail.component';
import { ApartmentCommentsComponent } from './apartment-comments/apartment-comments.component';
import { ApartmentRoutingModule } from './apartment-routing.module';
import { SharedModule } from './../Shared/shared.module';

@NgModule({
  declarations: [
    PostApartmentComponent,
    ApartmentListingsComponent,
    ApartmentDetailComponent,
    ApartmentCommentsComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ApartmentRoutingModule,
    SharedModule
  ],
  exports:[
    ApartmentListingsComponent,
    ApartmentCommentsComponent,
  ]
})
export class ApartmentModule { }