import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LevelDisplayComponent } from './level-display.component';

describe('LevelDisplayComponent', () => {
  let component: LevelDisplayComponent;
  let fixture: ComponentFixture<LevelDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LevelDisplayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LevelDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
