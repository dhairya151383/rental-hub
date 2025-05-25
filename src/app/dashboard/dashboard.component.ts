import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { NavService } from './../Shared/services/nav.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(
    private router: Router,
    private navService: NavService
  ) {}

  ngOnInit() {
    this.navService.setBreadcrumbs([]);
    this.navService.setShowPostButton(true); 
  }
}
