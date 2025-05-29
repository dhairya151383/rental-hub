import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavService } from './../Shared/services/nav.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(
    private readonly router: Router,
    private readonly navService: NavService
  ) {}

  ngOnInit(): void {
    this.navService.setBreadcrumbs([]);
    this.navService.setShowPostButton(true);
  }
}
