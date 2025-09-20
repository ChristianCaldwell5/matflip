import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardRegionComponent } from './card-region.component';

describe('CardRegionComponent', () => {
  let component: CardRegionComponent;
  let fixture: ComponentFixture<CardRegionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardRegionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardRegionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
