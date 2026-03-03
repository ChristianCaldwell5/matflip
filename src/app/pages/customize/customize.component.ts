import { Component, OnDestroy } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { UserProfile } from '../../model/interfaces/user/user-profile';
import { Router } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { CatalogItem, CatalogType, UnlockType } from '../../model/interfaces/customization';
import { CatalogService, CatalogSortMode } from '../../services/catalog.service';

@Component({
  selector: 'app-customize',
  imports: [CommonModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatSelectModule, MatTabsModule],
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
  sortMode: CatalogSortMode = 'price-asc';
  readonly CatalogType = CatalogType;

  $destroyed = new Subject<void>();

  constructor(
    private userService: UserService,
    private catalogService: CatalogService,
    private router: Router
  ) {
    this.currentUser$ = this.userService.user$;
    this.initializeInventoryItems();
    this.currentUser$.pipe(takeUntil(this.$destroyed)).subscribe(user => {
      this.savedSkin = this.cardSkinChange = user?.currentCustomizationSelects?.cardSkin || null;
      this.savedTitle = this.titleChange = user?.currentCustomizationSelects?.title || null;
      this.savedMatchEffect = this.matchEffectChange = user?.currentCustomizationSelects?.matchEffect || null;
    });
  }

  ngOnDestroy(): void {
    this.$destroyed.next();
    this.$destroyed.complete();
  }

  get hasPendingChanges(): boolean {
    return this.hasCatalogItemChanged(this.cardSkinChange, this.savedSkin)
      || this.hasCatalogItemChanged(this.titleChange, this.savedTitle)
      || this.hasCatalogItemChanged(this.matchEffectChange, this.savedMatchEffect);
  }

  goToMenu(): void {
    this.router.navigate(['/']);
  }

  saveCustomizationChanges(): void {
    this.savedSkin = this.cardSkinChange;
    this.savedTitle = this.titleChange;
    this.savedMatchEffect = this.matchEffectChange;

    this.userService.updateUserCustomization({
      cardSkin: this.cardSkinChange,
      title: this.titleChange,
      matchEffect: this.matchEffectChange
    }).subscribe({
      next: (updatedProfile) => {
        console.log('User customization updated successfully:', updatedProfile);
      },
      error: (error) => {
        console.error('Error updating user customization:', error);
      }
    });

    this.cardSkinChange = this.savedSkin;
    this.titleChange = this.savedTitle;
    this.matchEffectChange = this.savedMatchEffect;
  }

  cancelCustomizationChanges(): void {
    this.cardSkinChange = this.savedSkin;
    this.titleChange = this.savedTitle;
    this.matchEffectChange = this.savedMatchEffect;
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

  setSortMode(mode: CatalogSortMode): void {
    if (this.sortMode === mode) return;
    this.sortMode = mode;
    this.cardSkinItems = this.sortItems(this.cardSkinItems);
    this.matchEffectItems = this.sortItems(this.matchEffectItems);
    this.titleItems = this.sortItems(this.titleItems);
  }

  private initializeInventoryItems(): void {
    this.currentUser$
      .pipe(takeUntil(this.$destroyed))
      .subscribe((user) => {
        if (user) {
          this.cardSkinItems = this.catalogService.withDefaultPrices(this.filterItems(user, CatalogType.CARD_SKIN));
          this.matchEffectItems = this.catalogService.withDefaultPrices(this.filterItems(user, CatalogType.MATCH_EFFECT));
          this.titleItems = this.catalogService.withDefaultPrices(this.filterItems(user, CatalogType.TITLE));
          // this.cardSkinItems.push(...MOCK_OWNED_SKINS)
          this.cardSkinItems.push(DEFAULT_SKIN);
          this.cardSkinItems = this.sortItems(this.cardSkinItems);
          this.matchEffectItems = this.sortItems(this.matchEffectItems);
          this.titleItems = this.sortItems(this.titleItems);
          console.log('Customized Inventory Items Loaded:', {
            cardSkins: this.cardSkinItems,
            matchEffects: this.matchEffectItems,
            titles: this.titleItems
          });
        }
      });
  }

  private sortItems(items: CatalogItem[]): CatalogItem[] {
    return this.catalogService.sortCatalogItems(items, this.sortMode);
  }

  private hasCatalogItemChanged(current: CatalogItem | null, saved: CatalogItem | null): boolean {
    return (current?.name ?? null) !== (saved?.name ?? null);
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
