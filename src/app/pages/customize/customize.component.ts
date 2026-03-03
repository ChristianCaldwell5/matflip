import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { UserProfile } from '../../model/interfaces/user/user-profile';
import { Router } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { CatalogItem, CatalogType } from '../../model/interfaces/customization';
import { CatalogSortMode } from '../../services/catalog.service';
import { CustomizationFilterMode, CustomizationService } from '../../services/customization.service';

@Component({
  selector: 'app-customize',
  imports: [CommonModule, MatButtonModule, MatCardModule, MatChipsModule, MatFormFieldModule, MatIconModule, MatMenuModule, MatSelectModule, MatTabsModule],
  templateUrl: './customize.component.html',
  styleUrls: ['./customize.component.scss']
})
export class CustomizeComponent implements OnInit, OnDestroy {

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
  filterMode: CustomizationFilterMode = 'all';
  readonly CatalogType = CatalogType;

  $destroyed = new Subject<void>();

  constructor(
    private userService: UserService,
    private customizationService: CustomizationService,
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

  ngOnInit(): void {
    this.filterMode = 'all';
    this.customizationService.clearFilter();
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

  get hasActiveFilter(): boolean {
    return this.filterMode !== 'all';
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

  setSortMode(mode: CatalogSortMode): void {
    if (this.sortMode === mode) return;
    this.sortMode = mode;
    this.customizationService.setSortMode(mode);
  }

  setFilterMode(mode: CustomizationFilterMode): void {
    if (this.filterMode === mode) return;
    this.filterMode = mode;
    this.customizationService.setFilterMode(mode);
  }

  clearFilters(): void {
    this.filterMode = 'all';
    this.customizationService.clearFilter();
  }

  selectSkin(item: CatalogItem): void {
    this.cardSkinChange = item;
  }

  selectEffect(item: CatalogItem | null): void {
    this.matchEffectChange = item;
  }

  selectTitle(item: CatalogItem | null): void {
    this.titleChange = item;
  }

  isSkinSelected(item: CatalogItem): boolean {
    return item.name === this.cardSkinChange?.name;
  }

  isEffectSelected(item: CatalogItem | null): boolean {
    if (item === null) return this.matchEffectChange === null;
    return item.name === this.matchEffectChange?.name;
  }

  isTitleSelected(item: CatalogItem | null): boolean {
    if (item === null) return this.titleChange === null;
    return item.name === this.titleChange?.name;
  }

  private initializeInventoryItems(): void {
    this.customizationService.inventoryVm$
      .pipe(takeUntil(this.$destroyed))
      .subscribe((vm) => {
        this.cardSkinItems = vm.cardSkinItems;
        this.matchEffectItems = vm.matchEffectItems;
        this.titleItems = vm.titleItems;
      });
  }

  private hasCatalogItemChanged(current: CatalogItem | null, saved: CatalogItem | null): boolean {
    return (current?.name ?? null) !== (saved?.name ?? null);
  }
}
