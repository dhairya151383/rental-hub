import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component'; // Keep import for clarity, though loadComponent will handle it
import { RegisterComponent } from './register/register.component'; // Keep import for clarity
import { RoleGuard } from './Service/auth-guard/role.guard';
import { AuthGuard } from './Service/auth-guard/auth.guard'; // Assuming you want to use AuthGuard for dashboard

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    // Lazy load the standalone LoginComponent
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    // Lazy load the standalone RegisterComponent
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    // Apply both AuthGuard (for authentication) and RoleGuard (for authorization)
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'admin' }, // Data for RoleGuard
  },
  {
    path: 'apartment',
    loadChildren: () => import('./Apartment/apartment.module').then(m => m.ApartmentModule),
    // Apply both AuthGuard (for authentication) and RoleGuard (for authorization)
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'admin' }, // Data for RoleGuard
  },
  { path: '**', redirectTo: 'login', pathMatch: 'full' } // Wildcard route for unmatched paths
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
