import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NavService } from '../Shared/services/nav.service';
import { DashboardComponent } from './dashboard.component';
import { of } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let router: Router;
  let navService: NavService;

  beforeEach(() => {
    const routerSpy = { navigate: jest.fn() };
    const navServiceSpy = { setBreadcrumbs: jest.fn(), setShowPostButton: jest.fn() };

    TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: NavService, useValue: navServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    navService = TestBed.inject(NavService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call navService.setBreadcrumbs with an empty array', () => {
      component.ngOnInit();
      expect(navService.setBreadcrumbs).toHaveBeenCalledWith([]);
    });

    it('should call navService.setShowPostButton with true', () => {
      component.ngOnInit();
      expect(navService.setShowPostButton).toHaveBeenCalledWith(true);
    });
  });
});