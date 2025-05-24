import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApartmentListingsComponent } from './apartment-listings.component';

describe('ApartmentListingsComponent', () => {
  let component: ApartmentListingsComponent;
  let fixture: ComponentFixture<ApartmentListingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApartmentListingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApartmentListingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
