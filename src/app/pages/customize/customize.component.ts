import { Component, OnDestroy } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { UserProfile } from '../../model/interfaces/user/user-profile';
import { Router } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { CatalogItem, CatalogType, UnlockType } from '../../model/interfaces/customization';

@Component({
  selector: 'app-customize',
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, MatTabsModule],
  templateUrl: './customize.component.html',
  styleUrls: ['./customize.component.scss']
})
export class CustomizeComponent implements OnDestroy {

  currentUser$: Observable<UserProfile | null>;
  savedSkin: CatalogItem | null = null;
  savedTitle: CatalogItem | null = null;
  savedMatchEffect: CatalogItem | null = null;

  cardSkinChange: CatalogItem | null = null;
  titleChange: CatalogItem | null = null;
  matchEffectChange: CatalogItem | null = null;

  cardSkinItems: CatalogItem[] = [];
  matchEffectItems: CatalogItem[] = [];
  titleItems: CatalogItem[] = [];

  selectedTabIndex = 0;
  readonly CatalogType = CatalogType;

  $destroyed = new Subject<void>();

  constructor(
    private userService: UserService,
    private router: Router
  ) {
    this.currentUser$ = this.userService.user$;
    this.initializeInventoryItems();
    this.currentUser$.pipe(takeUntil(this.$destroyed)).subscribe(user => {
      this.savedSkin = user?.currentCustomizationSelects?.cardSkin || null;
      this.savedTitle = user?.currentCustomizationSelects?.title || null;
      this.savedMatchEffect = user?.currentCustomizationSelects?.matchEffect || null;
    });
  }

  ngOnDestroy(): void {
    this.$destroyed.next();
    this.$destroyed.complete();
  }

  get hasPendingChanges(): boolean {
    return !!(this.cardSkinChange || this.titleChange || this.matchEffectChange);
  }

  goToMenu(): void {
    this.router.navigate(['/']);
  }

  saveCustomizationChanges(): void {
    // Apply any staged changes to the "saved" selections
    if (this.cardSkinChange) {
      this.savedSkin = this.cardSkinChange;
    }
    if (this.titleChange) {
      this.savedTitle = this.titleChange;
    }
    if (this.matchEffectChange) {
      this.savedMatchEffect = this.matchEffectChange;
    }

    this.userService.updateUserCustomization({
      cardSkin: this.savedSkin,
      title: this.savedTitle,
      matchEffect: this.savedMatchEffect
    }).subscribe({
      next: (updatedProfile) => {
        console.log('User customization updated successfully:', updatedProfile);
      },
      error: (error) => {
        console.error('Error updating user customization:', error);
      }
    });

    // Clear staged changes after saving
    this.cardSkinChange = null;
    this.titleChange = null;
    this.matchEffectChange = null;
  }

  cancelCustomizationChanges(): void {
    // Simply discard any staged changes
    this.cardSkinChange = null;
    this.titleChange = null;
    this.matchEffectChange = null;
  }

  get activeTabTitle(): string {
    switch (this.selectedTabIndex) {
      case 0:
        return 'Skins';
      case 1:
        return 'Effects';
      case 2:
        return 'Titles';
      default:
        return '';
    }
  }

  filterItems(user: UserProfile | null, type: CatalogType): CatalogItem[] {
    if (!user || !user.ownedCatalogItems) {
      return [];
    }
    return user.ownedCatalogItems.filter((item) => item.type === type);
  }

  private initializeInventoryItems(): void {
    this.currentUser$
      .pipe(takeUntil(this.$destroyed))
      .subscribe((user) => {
        if (user) {
          this.cardSkinItems = this.filterItems(user, CatalogType.CARD_SKIN);
          this.matchEffectItems = this.filterItems(user, CatalogType.MATCH_EFFECT);
          this.titleItems = this.filterItems(user, CatalogType.TITLE);
          // this.cardSkinItems.push(...MOCK_OWNED_SKINS)
          this.cardSkinItems.push(DEFAULT_SKIN);
          console.log('Customized Inventory Items Loaded:', {
            cardSkins: this.cardSkinItems,
            matchEffects: this.matchEffectItems,
            titles: this.titleItems
          });
        }
      });
  }
}

const DEFAULT_SKIN: CatalogItem = {
  id: 'default-001',
  type: CatalogType.CARD_SKIN,
  name: 'default_skin',
  displayName: 'Default',
  rarity: 'common',
  unlockType: UnlockType.LEVEL_UP,
  isRetired: false,
  version: 1,
  styleRecipe: 'default-skin',
  levelRequirement: 0,
  isSkyboxed: false,
  isAnimated: false
} as CatalogItem;
