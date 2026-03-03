import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, combineLatest, map, shareReplay } from 'rxjs';
import { CatalogItem, CatalogType, RarityType, UnlockType } from '../model/interfaces/customization';
import { CatalogService, CatalogSortMode } from './catalog.service';
import { UserService } from './user/user.service';

export type CustomizationFilterMode = 'all' | 'purchased' | 'progression';

export interface CustomizationInventoryVm {
  cardSkinItems: CatalogItem[];
  matchEffectItems: CatalogItem[];
  titleItems: CatalogItem[];
}

@Injectable({ providedIn: 'root' })
export class CustomizationService {
  private readonly userService = inject(UserService);
  private readonly catalogService = inject(CatalogService);

  private readonly sortModeSubject = new BehaviorSubject<CatalogSortMode>('price-asc');
  readonly sortMode$ = this.sortModeSubject.asObservable();

  private readonly filterModeSubject = new BehaviorSubject<CustomizationFilterMode>('all');
  readonly filterMode$ = this.filterModeSubject.asObservable();

  readonly inventoryVm$ = combineLatest([
    this.userService.user$,
    this.sortMode$,
    this.filterMode$,
  ]).pipe(
    map(([user, sortMode, filterMode]) => {
      const ownedItems = user?.ownedCatalogItems ?? [];
      const filteredItems = this.filterItems(ownedItems, filterMode);

      const cardSkinItems = this.withDefaultSkin(
        this.catalogService.withDefaultPrices(filteredItems.filter((item) => item.type === CatalogType.CARD_SKIN))
      );
      const matchEffectItems = this.catalogService.withDefaultPrices(filteredItems.filter((item) => item.type === CatalogType.MATCH_EFFECT));
      const titleItems = this.catalogService.withDefaultPrices(filteredItems.filter((item) => item.type === CatalogType.TITLE));

      return {
        cardSkinItems: this.catalogService.sortCatalogItems(cardSkinItems, sortMode),
        matchEffectItems: this.catalogService.sortCatalogItems(matchEffectItems, sortMode),
        titleItems: this.catalogService.sortCatalogItems(titleItems, sortMode),
      } as CustomizationInventoryVm;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  setSortMode(mode: CatalogSortMode): void {
    if (this.sortModeSubject.value === mode) return;
    this.sortModeSubject.next(mode);
  }

  setFilterMode(mode: CustomizationFilterMode): void {
    if (this.filterModeSubject.value === mode) return;
    this.filterModeSubject.next(mode);
  }

  clearFilter(): void {
    this.setFilterMode('all');
  }

  private filterItems(items: CatalogItem[], mode: CustomizationFilterMode): CatalogItem[] {
    if (mode === 'purchased') {
      return items.filter((item) => item.unlockType === UnlockType.IN_GAME_PURCHASE);
    }
    if (mode === 'progression') {
      return items.filter((item) => item.unlockType === UnlockType.LEVEL_UP);
    }
    return items;
  }

  private withDefaultSkin(items: CatalogItem[]): CatalogItem[] {
    if (items.some((item) => item.name === DEFAULT_SKIN.name)) {
      return items;
    }
    return [...items, DEFAULT_SKIN];
  }
}

const DEFAULT_SKIN: CatalogItem = {
  type: CatalogType.CARD_SKIN,
  name: 'default_skin',
  displayName: 'Default',
  rarity: RarityType.COMMON,
  unlockType: UnlockType.LEVEL_UP,
  isRetired: false,
  version: 1,
  styleRecipe: 'default-skin',
  levelRequirement: 0,
  isSkyboxed: false,
  isAnimated: false,
};
