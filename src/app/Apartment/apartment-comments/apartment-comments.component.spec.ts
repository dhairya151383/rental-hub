import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApartmentCommentsComponent } from './apartment-comments.component';

describe('ApartmentCommentsComponent', () => {
  let component: ApartmentCommentsComponent;
  let fixture: ComponentFixture<ApartmentCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApartmentCommentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApartmentCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
