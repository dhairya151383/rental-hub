import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostApartmentComponent } from './post-apartment.component';

describe('PostApartmentComponent', () => {
  let component: PostApartmentComponent;
  let fixture: ComponentFixture<PostApartmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostApartmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostApartmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
