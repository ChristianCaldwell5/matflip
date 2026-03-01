import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CatalogItem, CatalogType, RarityType, UnlockType } from '../../model/interfaces/customization';
import { CatalogService, CatalogSortMode } from '../../services/catalog.service';
import { UserService } from '../../services/user/user.service';
import { distinctUntilChanged, Observable, Subject, takeUntil } from 'rxjs';
import { UserProfile } from '../../model/interfaces/user/user-profile';
import { PreviewComponent } from '../../components/dialogs/preview/preview.component';

@Component({
  selector: 'app-store',
  imports: [CommonModule, MatButtonModule, MatCardModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatSelectModule, MatTabsModule],
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
    private catalogService: CatalogService,
    private dialog: MatDialog
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

  openSkinPreview(item: CatalogItem, playerFlipBucks: number): void {
    this.dialog.open(PreviewComponent, {
      width: '90%',
      maxWidth: '560px',
      disableClose: false,
      data: {
        skinPreview: item,
        playerFlipBucks
      }
    });
  }

  openTitlePreview(item: CatalogItem, playerFlipBucks: number, playerDisplayName?: string): void {
    this.dialog.open(PreviewComponent, {
      width: '90%',
      maxWidth: '560px',
      disableClose: false,
      data: {
        titlePreview: item,
        playerFlipBucks,
        playerDisplayName: playerDisplayName ?? 'Player'
      }
    });
  }

  openEffectPreview(item: CatalogItem, playerFlipBucks: number, equippedSkinStyleRecipe?: string): void {
    this.dialog.open(PreviewComponent, {
      width: '90%',
      maxWidth: '560px',
      disableClose: false,
      data: {
        effectPreview: item,
        playerFlipBucks,
        equippedSkinStyleRecipe: equippedSkinStyleRecipe ?? 'default-skin'
      }
    });
  }

  private sortItems(items: CatalogItem[]): CatalogItem[] {
    return this.catalogService.sortCatalogItems(items, this.sortMode);
  }

  private generateMockPurchasableItems(): CatalogItem[] {
    const mockSkins: CatalogItem[] = [
      { type: CatalogType.CARD_SKIN, name: 'lemon_zest', displayName: 'Lemon Zest', rarity: RarityType.COMMON, unlockType: UnlockType.IN_GAME_PURCHASE, isRetired: false, version: 1, styleRecipe: 'common-card-skin-lemon-zest', levelRequirement: 0, isSkyboxed: false, isAnimated: false },
      { type: CatalogType.CARD_SKIN, name: 'ocean_breeze', displayName: 'Ocean Breeze', rarity: RarityType.COMMON, unlockType: UnlockType.IN_GAME_PURCHASE, isRetired: false, version: 1, styleRecipe: 'common-card-skin-ocean-breeze', levelRequirement: 0, isSkyboxed: false, isAnimated: false },
      { type: CatalogType.CARD_SKIN, name: 'peach_fizz', displayName: 'Peach Fizz', rarity: RarityType.COMMON, unlockType: UnlockType.IN_GAME_PURCHASE, isRetired: false, version: 1, styleRecipe: 'common-card-skin-peach-fizz', levelRequirement: 0, isSkyboxed: false, isAnimated: false },
      { type: CatalogType.CARD_SKIN, name: 'mint_pop', displayName: 'Mint Pop', rarity: RarityType.COMMON, unlockType: UnlockType.IN_GAME_PURCHASE, isRetired: false, version: 1, styleRecipe: 'common-card-skin-mint-pop', levelRequirement: 0, isSkyboxed: false, isAnimated: false }
    ];

    return [
      ...mockSkins,
      {
        type: CatalogType.MATCH_EFFECT,
        name: 'distort',
        displayName: 'Distort',
        rarity: RarityType.COMMON,
        unlockType: UnlockType.IN_GAME_PURCHASE,
        isRetired: false,
        version: 1,
        styleRecipe: 'effect-distort',
        levelRequirement: 0,
        isSkyboxed: false,
        isAnimated: true
      },
      {
        type: CatalogType.MATCH_EFFECT,
        name: 'pop_n_lock',
        displayName: 'Pop-n-Lock',
        rarity: RarityType.RARE,
        unlockType: UnlockType.IN_GAME_PURCHASE,
        isRetired: false,
        version: 1,
        styleRecipe: 'effect-pop-n-lock',
        levelRequirement: 0,
        isSkyboxed: false,
        isAnimated: true
      },
      {
        type: CatalogType.MATCH_EFFECT,
        name: 'aurora_blast',
        displayName: 'Aurora Blast',
        rarity: RarityType.LEGENDARY,
        unlockType: UnlockType.IN_GAME_PURCHASE,
        isRetired: false,
        version: 1,
        styleRecipe: 'effect-aurora-blast',
        levelRequirement: 0,
        isSkyboxed: false,
        isAnimated: true
      },
      {
        type: CatalogType.MATCH_EFFECT,
        name: 'amethyst_crush',
        displayName: 'Amethyst Crush',
        rarity: RarityType.LEGENDARY,
        unlockType: UnlockType.IN_GAME_PURCHASE,
        isRetired: false,
        version: 1,
        styleRecipe: 'effect-amethyst-crush',
        levelRequirement: 0,
        isSkyboxed: false,
        isAnimated: true
      },
      {
        type: CatalogType.TITLE,
        name: 'flipionaire',
        displayName: 'Flipionaire',
        rarity: RarityType.LEGENDARY,
        unlockType: UnlockType.IN_GAME_PURCHASE,
        isRetired: false,
        version: 1,
        styleRecipe: 'flipionaire',
        levelRequirement: 0,
        isSkyboxed: false,
        isAnimated: false
      },
      {
        type: CatalogType.TITLE,
        name: 'flip_buck_treasurer',
        displayName: 'Flip Buck Treasurer',
        rarity: RarityType.RARE,
        unlockType: UnlockType.IN_GAME_PURCHASE,
        isRetired: false,
        version: 1,
        styleRecipe: 'flip-buck-treasurer',
        levelRequirement: 0,
        isSkyboxed: false,
        isAnimated: false
      },
      {
        type: CatalogType.TITLE,
        name: 'coin_count_captain',
        displayName: 'Coin Count Captain',
        rarity: RarityType.UNCOMMON,
        unlockType: UnlockType.IN_GAME_PURCHASE,
        isRetired: false,
        version: 1,
        styleRecipe: 'coin-count-captain',
        levelRequirement: 0,
        isSkyboxed: false,
        isAnimated: false
      }
    ];
  }

}
