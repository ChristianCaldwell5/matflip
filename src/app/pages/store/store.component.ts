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
import { CatalogItem } from '../../model/interfaces/customization';
import { CatalogSortMode } from '../../services/catalog.service';
import { UserService } from '../../services/user/user.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { UserProfile } from '../../model/interfaces/user/user-profile';
import { PreviewComponent } from '../../components/dialogs/preview/preview.component';
import { StoreService } from '../../services/store.service';

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

  skinItems: CatalogItem[] = [];
  effectItems: CatalogItem[] = [];
  titleItems: CatalogItem[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private userService: UserService,
    private storeService: StoreService,
    private dialog: MatDialog
  ) {
    this.currentUser$ = this.userService.user$;
    this.initializeStoreItemsFromService();
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

  private initializeStoreItemsFromService(): void {
    this.storeService.storeItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ skinItems, effectItems, titleItems }) => {
        this.skinItems = skinItems;
        this.effectItems = effectItems;
        this.titleItems = titleItems;
      });
  }

  setSortMode(mode: CatalogSortMode): void {
    if (this.sortMode === mode) return;
    this.sortMode = mode;
    this.storeService.setSortMode(mode);
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

}
