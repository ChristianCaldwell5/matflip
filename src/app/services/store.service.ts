import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, shareReplay } from 'rxjs';
import { CatalogItem, CatalogType, RarityType, UnlockType } from '../model/interfaces/customization';
import { CatalogService, CatalogSortMode } from './catalog.service';
import { UserService } from './user/user.service';

export interface StoreItems {
  skinItems: CatalogItem[];
  effectItems: CatalogItem[];
  titleItems: CatalogItem[];
}

@Injectable({ providedIn: 'root' })
export class StoreService {
    private readonly sortModeSubject = new BehaviorSubject<CatalogSortMode>('price-asc');
    readonly sortMode$ = this.sortModeSubject.asObservable();

  private readonly catalogService = inject(CatalogService);
  private readonly userService = inject(UserService);

  readonly storeItems$ = combineLatest([
    this.catalogService.activeCatalog$,
    this.userService.user$,
    this.sortMode$,
  ]).pipe(
    map(([activeCatalog, currentUser, sortMode]) => {
      const ownedItemKeys = new Set((currentUser?.ownedCatalogItems ?? []).map((item) => this.itemKey(item)));

      let purchasableItems = (activeCatalog?.items ?? [])
        .filter((item) => item.unlockType === UnlockType.IN_GAME_PURCHASE);

      const mockPurchasableItems = this.generateMockPurchasableItems();
      purchasableItems = [...purchasableItems, ...mockPurchasableItems];

      const uniqueByKey = new Map<string, CatalogItem>();
      for (const item of purchasableItems) {
        const key = this.itemKey(item);
        if (!uniqueByKey.has(key)) {
          uniqueByKey.set(key, item);
        }
      }

      const availableItems = Array.from(uniqueByKey.values()).filter((item) => !ownedItemKeys.has(this.itemKey(item)));
      const itemsWithPrices = this.catalogService.withDefaultPrices(availableItems);

      return {
        skinItems: this.catalogService.sortCatalogItems(itemsWithPrices.filter((item) => item.type === CatalogType.CARD_SKIN), sortMode),
        effectItems: this.catalogService.sortCatalogItems(itemsWithPrices.filter((item) => item.type === CatalogType.MATCH_EFFECT), sortMode),
        titleItems: this.catalogService.sortCatalogItems(itemsWithPrices.filter((item) => item.type === CatalogType.TITLE), sortMode),
      } as StoreItems;
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  setSortMode(mode: CatalogSortMode): void {
    if (this.sortModeSubject.value === mode) return;
    this.sortModeSubject.next(mode);
  }

  private itemKey(item: CatalogItem): string {
    return `${item.type}:${item.name}`;
  }

  private generateMockPurchasableItems(): CatalogItem[] {
    return [
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
