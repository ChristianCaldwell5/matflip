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
import { CatalogItem, CatalogType } from '../../model/interfaces/customization';

@Component({
  selector: 'app-customize',
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, MatTabsModule],
  templateUrl: './customize.component.html',
  styleUrls: ['./customize.component.scss']
})
export class CustomizeComponent implements OnDestroy {

  currentUser$: Observable<UserProfile | null>;

  cardSkinChangeName: string | null = null;
  titleChangeName: string | null = null;
  matchEffectChangeName: string | null = null;

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
  }

  ngOnDestroy(): void {
    this.$destroyed.next();
    this.$destroyed.complete();
  }

  goToMenu(): void {
    this.router.navigate(['/']);
  }

  saveCustomizationChanges() { }

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
          this.cardSkinItems.push(...MOCK_OWNED_SKINS)
          console.log('Customized Inventory Items Loaded:', {
            cardSkins: this.cardSkinItems,
            matchEffects: this.matchEffectItems,
            titles: this.titleItems
          });
        }
      });
  }
}

const MOCK_OWNED_SKINS: CatalogItem[] = [
  {
    id: 'cc-0001',
    type: CatalogType.CARD_SKIN,
    name: 'cotton_candy_classic',
    displayName: 'Cotton Candy Classic',
    rarity: 'uncommon',
    unlockType: 'in_game_purchase',
    isRetired: false,
    version: 1,
    styleRecipe: 'cotton-candy-classic',
    isAnimated: false
  } as CatalogItem,
  {
    id: 'cc-0002',
    type: CatalogType.CARD_SKIN,
    name: 'cotton_candy_swirl',
    displayName: 'Cotton Candy Swirl',
    rarity: 'rare',
    unlockType: 'in_game_purchase',
    isRetired: false,
    version: 1,
    styleRecipe: 'cotton-candy-swirl',
    isAnimated: false
  } as CatalogItem,
  {
    id: 'ag-0001',
    type: CatalogType.CARD_SKIN,
    name: 'acid_green_bubbles',
    displayName: 'Acid Green Bubbles',
    rarity: 'rare',
    unlockType: 'in_game_purchase',
    isRetired: false,
    version: 1,
    styleRecipe: 'acid-green-bubbles',
    isAnimated: false
  } as CatalogItem,
  {
    id: 'is-0001',
    type: CatalogType.CARD_SKIN,
    name: 'ice_shards',
    displayName: 'Ice Shards',
    rarity: 'uncommon',
    unlockType: 'in_game_purchase',
    isRetired: false,
    version: 1,
    styleRecipe: 'ice-shards',
    isAnimated: false
  } as CatalogItem,
  {
    id: 'aw-0001',
    type: CatalogType.CARD_SKIN,
    name: 'aurora_wave',
    displayName: 'Aurora Wave',
    rarity: 'rare',
    unlockType: 'in_game_purchase',
    isRetired: false,
    version: 1,
    styleRecipe: 'aurora-wave',
    isAnimated: false
  } as CatalogItem,
  {
    id: 'gd-0001',
    type: CatalogType.CARD_SKIN,
    name: 'galaxy_dust',
    displayName: 'Galaxy Dust',
    rarity: 'legendary',
    unlockType: 'in_game_purchase',
    isRetired: false,
    version: 1,
    styleRecipe: 'galaxy-dust',
    isAnimated: false
  } as CatalogItem,
  {
    id: 'rv-0001',
    type: CatalogType.CARD_SKIN,
    name: 'royal_velvet',
    displayName: 'Royal Velvet',
    rarity: 'epic',
    unlockType: 'in_game_purchase',
    isRetired: false,
    version: 1,
    styleRecipe: 'royal-velvet',
    isAnimated: false
  } as CatalogItem,
  {
    id: 'pc-0001',
    type: CatalogType.CARD_SKIN,
    name: 'pixel_confetti',
    displayName: 'Pixel Confetti',
    rarity: 'uncommon',
    unlockType: 'in_game_purchase',
    isRetired: false,
    version: 1,
    styleRecipe: 'pixel-confetti',
    isAnimated: false
  } as CatalogItem,
  {
    id: 'gs-0001',
    type: CatalogType.CARD_SKIN,
    name: 'golden_sunburst',
    displayName: 'Golden Sunburst',
    rarity: 'legendary',
    unlockType: 'in_game_purchase',
    isRetired: false,
    version: 1,
    styleRecipe: 'golden-sunburst',
    isAnimated: false
  } as CatalogItem,
  {
    id: 'cn-0001',
    type: CatalogType.CARD_SKIN,
    name: 'candy_cane',
    displayName: 'Candy Cane',
    rarity: 'rare',
    unlockType: 'in_game_purchase',
    isRetired: false,
    version: 1,
    styleRecipe: 'candy-cane',
    isAnimated: false
  } as CatalogItem,
  {
    id: 'sm-0001',
    type: CatalogType.CARD_SKIN,
    name: 'spearmint_cane',
    displayName: 'Spearmint Cane',
    rarity: 'rare',
    unlockType: 'in_game_purchase',
    isRetired: false,
    version: 1,
    styleRecipe: 'spearmint-cane',
    isAnimated: false
  } as CatalogItem,
  {
    id: 'os-0002',
    type: CatalogType.CARD_SKIN,
    name: 'oil_spill',
    displayName: 'Oil Spill',
    rarity: 'rare',
    unlockType: 'in_game_purchase',
    isRetired: false,
    version: 1,
    styleRecipe: 'oil-spill',
    isAnimated: false
  } as CatalogItem,
  {
    id: 'rb-0001',
    type: CatalogType.CARD_SKIN,
    name: 'rainbow_burst',
    displayName: 'Rainbow Burst',
    rarity: 'epic',
    unlockType: 'in_game_purchase',
    isRetired: false,
    version: 1,
    styleRecipe: 'rainbow-burst',
    isAnimated: false
  } as CatalogItem,
  {
    id: 'gd-0002',
    type: CatalogType.CARD_SKIN,
    name: 'gilded',
    displayName: 'Gilded',
    rarity: 'legendary',
    unlockType: 'in_game_purchase',
    isRetired: false,
    version: 1,
    styleRecipe: 'gilded',
    isAnimated: false
  } as CatalogItem,
  {
    id: 'oc-0001',
    type: CatalogType.CARD_SKIN,
    name: 'ocean',
    displayName: 'Ocean',
    rarity: 'rare',
    unlockType: 'in_game_purchase',
    isRetired: false,
    version: 1,
    styleRecipe: 'ocean',
    isAnimated: false
  } as CatalogItem,
  {
    id: 'st-0001',
    type: CatalogType.CARD_SKIN,
    name: 'static_tv',
    displayName: 'Static TV',
    rarity: 'uncommon',
    unlockType: 'in_game_purchase',
    isRetired: false,
    version: 1,
    styleRecipe: 'static-tv',
    isAnimated: false
  } as CatalogItem,
  {
    id: 'sn-0001',
    type: CatalogType.CARD_SKIN,
    name: 'snickerdoodle',
    displayName: 'Snickerdoodle',
    rarity: 'uncommon',
    unlockType: 'in_game_purchase',
    isRetired: false,
    version: 1,
    styleRecipe: 'snickerdoodle',
    isAnimated: false
  } as CatalogItem,
  {
    id: 'fl-0001',
    type: CatalogType.CARD_SKIN,
    name: 'foilage',
    displayName: 'Foilage',
    rarity: 'rare',
    unlockType: 'in_game_purchase',
    isRetired: false,
    version: 1,
    styleRecipe: 'foilage',
    isAnimated: false
  } as CatalogItem,
  {
    id: 'sg-0001',
    type: CatalogType.CARD_SKIN,
    name: 'stained_glass',
    displayName: 'Stained Glass',
    rarity: 'epic',
    unlockType: 'in_game_purchase',
    isRetired: false,
    version: 1,
    styleRecipe: 'stained-glass',
    isAnimated: false
  } as CatalogItem,
  {
    id: 'cb-0003',
    type: CatalogType.CARD_SKIN,
    name: 'cosmic_brownie',
    displayName: 'Cosmic Brownie',
    rarity: 'rare',
    unlockType: 'in_game_purchase',
    isRetired: false,
    version: 1,
    styleRecipe: 'cosmic-brownie',
    isAnimated: false
  } as CatalogItem
  ,
  {
    id: 'eg-0001',
    type: CatalogType.CARD_SKIN,
    name: 'ember_glow',
    displayName: 'Ember Glow',
    rarity: 'rare',
    unlockType: 'in_game_purchase',
    isRetired: false,
    version: 1,
    styleRecipe: 'ember-glow',
    isAnimated: false
  } as CatalogItem,
  {
    id: 'gc-0001',
    type: CatalogType.CARD_SKIN,
    name: 'glacier_crest',
    displayName: 'Glacier Crest',
    rarity: 'uncommon',
    unlockType: 'in_game_purchase',
    isRetired: false,
    version: 1,
    styleRecipe: 'glacier-crest',
    isAnimated: false
  } as CatalogItem,
  {
    id: 'sb-0001',
    type: CatalogType.CARD_SKIN,
    name: 'bubblegum_bliss',
    displayName: 'Bubblegum Bliss',
    rarity: 'uncommon',
    unlockType: 'in_game_purchase',
    isRetired: false,
    version: 1,
    styleRecipe: 'bubblegum-bliss',
    isAnimated: false
  } as CatalogItem,
  {
    id: 'ct-0001',
    type: CatalogType.CARD_SKIN,
    name: 'citrus_twist',
    displayName: 'Citrus Twist',
    rarity: 'rare',
    unlockType: 'in_game_purchase',
    isRetired: false,
    version: 1,
    styleRecipe: 'citrus-twist',
    isAnimated: false
  } as CatalogItem,
  {
    id: 'pf-0001',
    type: CatalogType.CARD_SKIN,
    name: 'peacock_feather',
    displayName: 'Peacock Feather',
    rarity: 'epic',
    unlockType: 'in_game_purchase',
    isRetired: false,
    version: 1,
    styleRecipe: 'peacock-feather',
    isAnimated: false
  } as CatalogItem,
  {
    id: 'vg-0001',
    type: CatalogType.CARD_SKIN,
    name: 'vaporwave_grid',
    displayName: 'Vaporwave Grid',
    rarity: 'uncommon',
    unlockType: 'in_game_purchase',
    isRetired: false,
    version: 1,
    styleRecipe: 'vaporwave-grid',
    isAnimated: false
  } as CatalogItem,
  {
    id: 'pv-0001',
    type: CatalogType.CARD_SKIN,
    name: 'prism_veil',
    displayName: 'Prism Veil',
    rarity: 'epic',
    unlockType: 'in_game_purchase',
    isRetired: false,
    version: 1,
    styleRecipe: 'prism-veil',
    isAnimated: false
  } as CatalogItem,
  {
    id: 'cr-0001',
    type: CatalogType.CARD_SKIN,
    name: 'koi_pond',
    displayName: 'Koi Pond',
    rarity: 'rare',
    unlockType: 'in_game_purchase',
    isRetired: false,
    version: 1,
    styleRecipe: 'koi-pond',
    isAnimated: false
  } as CatalogItem,
]
