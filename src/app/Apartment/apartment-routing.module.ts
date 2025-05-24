import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostApartmentComponent } from './post-apartment/post-apartment.component';
import { ApartmentDetailComponent } from './apartment-detail/apartment-detail.component';
import { ApartmentCommentsComponent } from './apartment-comments/apartment-comments.component';
import { ApartmentListingsComponent } from './apartment-listings/apartment-listings.component';

const routes: Routes = [
  { path: 'apartment-listings', component: ApartmentListingsComponent },
  { path: 'post-apartment', component: PostApartmentComponent},
  { path: 'apartment-detail', component: ApartmentDetailComponent },
  { path: 'apartment-comments', component: ApartmentCommentsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApartmentRoutingModule {}
