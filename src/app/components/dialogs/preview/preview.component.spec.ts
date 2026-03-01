import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CatalogItem, CatalogType, RarityType, UnlockType } from '../../../model/interfaces/customization';

import { PreviewComponent } from './preview.component';

describe('PreviewComponent', () => {
  let component: PreviewComponent;
  let fixture: ComponentFixture<PreviewComponent>;

  const mockSkin: CatalogItem = {
    type: CatalogType.CARD_SKIN,
    name: 'test_skin',
    displayName: 'Test Skin',
    rarity: RarityType.COMMON,
    unlockType: UnlockType.IN_GAME_PURCHASE,
    isRetired: false,
    version: 1,
    styleRecipe: 'common-card-skin-lemon-zest',
    levelRequirement: 0,
    flipBucksRequirement: 100,
    isSkyboxed: false,
    isAnimated: false
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { skinPreview: mockSkin, playerFlipBucks: 1000 }
        },
        {
          provide: MatDialogRef,
          useValue: { close: jasmine.createSpy('close') }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
