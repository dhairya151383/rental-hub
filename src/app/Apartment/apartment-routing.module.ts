import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostApartmentComponent } from './post-apartment/post-apartment.component';
import { ApartmentDetailComponent } from './apartment-detail/apartment-detail.component';
import { ApartmentListingsComponent } from './apartment-listings/apartment-listings.component';
import { RoleGuard } from '../core/guards/role.guard';

const routes: Routes = [
  { path: 'apartment-listings', component: ApartmentListingsComponent },
  {
    path: 'post-apartment',
    component: PostApartmentComponent,
    canActivate: [RoleGuard],
    data: { expectedRole: 'admin' }
  },
  { path: 'apartment-detail/:id', component: ApartmentDetailComponent },
  { path: '', redirectTo: 'apartment-listings', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApartmentRoutingModule {}
