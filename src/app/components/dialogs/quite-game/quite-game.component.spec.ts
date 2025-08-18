import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuiteGameComponent } from './quite-game.component';

describe('QuiteGameComponent', () => {
  let component: QuiteGameComponent;
  let fixture: ComponentFixture<QuiteGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuiteGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuiteGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
