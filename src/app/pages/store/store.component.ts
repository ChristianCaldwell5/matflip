import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { CatalogItem, CatalogType, RarityType, UnlockType } from '../../model/interfaces/customization';
import { CatalogService, CatalogSortMode } from '../../services/catalog.service';
import { UserService } from '../../services/user/user.service';
import { distinctUntilChanged, Observable, Subject, takeUntil } from 'rxjs';
import { UserProfile } from '../../model/interfaces/user/user-profile';

@Component({
  selector: 'app-store',
  imports: [CommonModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatSelectModule, MatTabsModule],
  templateUrl: './store.component.html',
  styleUrl: './store.component.scss'
})
export class StoreComponent implements OnDestroy {

  currentUser$: Observable<UserProfile | null>;
  selectedTabIndex = 0;
  sortMode: CatalogSortMode = 'price-asc';

  readonly mockFlipBucks = 1250;
  readonly unlockType = UnlockType.IN_GAME_PURCHASE;

  skinItems: CatalogItem[] = [];
  effectItems: CatalogItem[] = [];
  titleItems: CatalogItem[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private userService: UserService,
    private catalogService: CatalogService
  ) {
    this.currentUser$ = this.userService.user$;
    this.initializeStoreItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToMenu(): void {
    this.router.navigate(['/']);
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

  private initializeStoreItems(): void {
    this.catalogService.activeCatalog$
      .pipe(
        distinctUntilChanged((prev, curr) => {
          if (prev === curr) return true;
          if (!prev || !curr) return false;
          return prev.version === curr.version && prev.items.length === curr.items.length;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((activeCatalog) => {
        let purchasableItems = (activeCatalog?.items ?? [])
          .filter((item) => item.unlockType === UnlockType.IN_GAME_PURCHASE);
        
        // Add mock purchasable items for testing display
        const mockPurchasableItems = this.generateMockPurchasableItems();
        purchasableItems = [...purchasableItems, ...mockPurchasableItems];
        
        // Add flipBucks requirement to each item
        const itemsWithPrices = this.catalogService.withDefaultPrices(purchasableItems);

        this.skinItems = this.sortItems(itemsWithPrices.filter((item) => item.type === CatalogType.CARD_SKIN));
        this.effectItems = this.sortItems(itemsWithPrices.filter((item) => item.type === CatalogType.MATCH_EFFECT));
        this.titleItems = this.sortItems(itemsWithPrices.filter((item) => item.type === CatalogType.TITLE));
      });
  }

  setSortMode(mode: CatalogSortMode): void {
    if (this.sortMode === mode) return;
    this.sortMode = mode;
    this.skinItems = this.sortItems(this.skinItems);
    this.effectItems = this.sortItems(this.effectItems);
    this.titleItems = this.sortItems(this.titleItems);
  }

  private sortItems(items: CatalogItem[]): CatalogItem[] {
    return this.catalogService.sortCatalogItems(items, this.sortMode);
  }

  private generateMockPurchasableItems(): CatalogItem[] {
    return [
      {
        type: CatalogType.CARD_SKIN,
        name: 'cyberpunk_neon',
        displayName: 'Cyberpunk Neon',
        rarity: RarityType.RARE,
        unlockType: UnlockType.IN_GAME_PURCHASE,
        isRetired: false,
        version: 1,
        styleRecipe: 'cyberpunk-neon',
        levelRequirement: 0,
        isSkyboxed: false,
        isAnimated: true
      },
      {
        type: CatalogType.CARD_SKIN,
        name: 'forest_moss',
        displayName: 'Forest Moss',
        rarity: RarityType.UNCOMMON,
        unlockType: UnlockType.IN_GAME_PURCHASE,
        isRetired: false,
        version: 1,
        styleRecipe: 'forest-moss',
        levelRequirement: 0,
        isSkyboxed: true,
        isAnimated: false
      },
      {
        type: CatalogType.CARD_SKIN,
        name: 'golden_royal',
        displayName: 'Golden Royal',
        rarity: RarityType.LEGENDARY,
        unlockType: UnlockType.IN_GAME_PURCHASE,
        isRetired: false,
        version: 1,
        styleRecipe: 'golden-royal',
        levelRequirement: 0,
        isSkyboxed: true,
        isAnimated: true
      },
      {
        type: CatalogType.MATCH_EFFECT,
        name: 'sparkle_burst',
        displayName: 'Sparkle Burst',
        rarity: RarityType.COMMON,
        unlockType: UnlockType.IN_GAME_PURCHASE,
        isRetired: false,
        version: 1,
        styleRecipe: 'sparkle-burst',
        levelRequirement: 0,
        isSkyboxed: false,
        isAnimated: true
      },
      {
        type: CatalogType.MATCH_EFFECT,
        name: 'flame_strike',
        displayName: 'Flame Strike',
        rarity: RarityType.EPIC,
        unlockType: UnlockType.IN_GAME_PURCHASE,
        isRetired: false,
        version: 1,
        styleRecipe: 'flame-strike',
        levelRequirement: 0,
        isSkyboxed: false,
        isAnimated: true
      },
      {
        type: CatalogType.MATCH_EFFECT,
        name: 'shadow_void',
        displayName: 'Shadow Void',
        rarity: RarityType.RARE,
        unlockType: UnlockType.IN_GAME_PURCHASE,
        isRetired: false,
        version: 1,
        styleRecipe: 'shadow-void',
        levelRequirement: 0,
        isSkyboxed: false,
        isAnimated: true
      },
      {
        type: CatalogType.TITLE,
        name: 'legendary_slayer',
        displayName: 'Legendary Slayer',
        rarity: RarityType.LEGENDARY,
        unlockType: UnlockType.IN_GAME_PURCHASE,
        isRetired: false,
        version: 1,
        styleRecipe: 'legendary-slayer',
        levelRequirement: 0,
        isSkyboxed: false,
        isAnimated: false
      },
      {
        type: CatalogType.TITLE,
        name: 'swift_master',
        displayName: 'Swift Master',
        rarity: RarityType.UNCOMMON,
        unlockType: UnlockType.IN_GAME_PURCHASE,
        isRetired: false,
        version: 1,
        styleRecipe: 'swift-master',
        levelRequirement: 0,
        isSkyboxed: false,
        isAnimated: false
      },
      {
        type: CatalogType.TITLE,
        name: 'shadow_dancer',
        displayName: 'Shadow Dancer',
        rarity: RarityType.COMMON,
        unlockType: UnlockType.IN_GAME_PURCHASE,
        isRetired: false,
        version: 1,
        styleRecipe: 'shadow-dancer',
        levelRequirement: 0,
        isSkyboxed: false,
        isAnimated: false
      }
    ];
  }

}
