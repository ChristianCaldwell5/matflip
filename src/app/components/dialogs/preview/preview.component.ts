import { CommonModule } from '@angular/common';
import { Component, Inject, Input, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CatalogItem, CatalogType, CurrentCustomizationSelects } from '../../../model/interfaces/customization';
import { UserService } from '../../../services/user/user.service';

interface PreviewDialogData {
  skinPreview?: CatalogItem;
  titlePreview?: CatalogItem;
  effectPreview?: CatalogItem;
  equippedSkinStyleRecipe?: string;
  playerFlipBucks?: number;
  playerDisplayName?: string;
  catalogName?: string;
}

@Component({
  selector: 'app-preview',
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './preview.component.html',
  styleUrl: './preview.component.scss'
})
export class PreviewComponent {

  @Input() skinPreview: CatalogItem | null = null;
  @Input() titlePreview: CatalogItem | null = null;
  @Input() effectPreview: CatalogItem | null = null;
  @Input() equippedSkinStyleRecipe = 'default-skin';
  @Input() playerFlipBucks = 0;
  @Input() playerDisplayName = 'Player';

  catalogName = 'default';
  purchasing = false;
  purchaseState: 'idle' | 'success' | 'error' = 'idle';
  purchasedItemName = '';
  flipBucksSpent = 0;
  equipping = false;
  equipError = false;
  equipped = false;

  firstEffectCardFlipped = false;
  secondEffectCardFlipped = false;
  effectActive = false;

  private cycleTimeout: ReturnType<typeof setTimeout> | null = null;
  private stepTimeouts: Array<ReturnType<typeof setTimeout>> = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PreviewDialogData,
    public dialogRef: MatDialogRef<PreviewComponent>,
    private userService: UserService
  ) {
    if (data?.skinPreview) {
      this.skinPreview = data.skinPreview;
    }
    if (data?.titlePreview) {
      this.titlePreview = data.titlePreview;
    }
    if (data?.effectPreview) {
      this.effectPreview = data.effectPreview;
      this.startEffectPreviewLoop();
    }
    if (data?.equippedSkinStyleRecipe) {
      this.equippedSkinStyleRecipe = data.equippedSkinStyleRecipe;
    }
    if (typeof data?.playerFlipBucks === 'number') {
      this.playerFlipBucks = data.playerFlipBucks;
    }
    if (data?.playerDisplayName) {
      this.playerDisplayName = data.playerDisplayName;
    }
    if (data?.catalogName) {
      this.catalogName = data.catalogName;
    }
  }

  get activePreviewItem(): CatalogItem | null {
    return this.skinPreview ?? this.titlePreview ?? this.effectPreview;
  }

  get canAfford(): boolean {
    const price = this.activePreviewItem?.flipBucksRequirement;
    if (!price) return false;
    return this.playerFlipBucks >= price;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  purchase(): void {
    const item = this.activePreviewItem;
    if (!item || this.purchasing) return;
    this.purchaseState = 'idle';
    this.purchasing = true;
    this.userService.purchaseItem(this.catalogName, item.name).subscribe({
      next: (res) => {
        this.purchasing = false;
        if (res) {
          this.purchaseState = 'success';
          this.purchasedItemName = res.purchasedItemName;
          this.flipBucksSpent = res.flipBucksSpent;
          this.playerFlipBucks = res.user.flipBucks;
          this.equipped = false;
          this.equipError = false;
          return;
        }
        this.purchaseState = 'error';
      },
      error: () => {
        this.purchasing = false;
        this.purchaseState = 'error';
      }
    });
  }

  equipNow(): void {
    if (this.purchaseState !== 'success' || this.equipping || this.equipped) return;

    const item = this.activePreviewItem;
    if (!item) return;

    const currentUser = this.userService.getCurrentUser();
    if (!currentUser) {
      this.equipError = true;
      return;
    }

    const currentSelects = currentUser.currentCustomizationSelects ?? {};
    const nextSelects: CurrentCustomizationSelects = {
      cardSkin: currentSelects.cardSkin ?? null,
      matchEffect: currentSelects.matchEffect ?? null,
      title: currentSelects.title ?? null,
    };

    if (item.type === CatalogType.CARD_SKIN) {
      nextSelects.cardSkin = item;
    } else if (item.type === CatalogType.MATCH_EFFECT) {
      nextSelects.matchEffect = item;
    } else if (item.type === CatalogType.TITLE) {
      nextSelects.title = item;
    }

    this.equipError = false;
    this.equipping = true;
    this.userService.updateUserCustomization(nextSelects).subscribe({
      next: (updatedUser) => {
        this.equipping = false;
        if (updatedUser) {
          this.equipped = true;
        } else {
          this.equipError = true;
        }
      },
      error: () => {
        this.equipping = false;
        this.equipError = true;
      }
    });
  }

  ngOnDestroy(): void {
    this.clearEffectPreviewTimers();
  }

  private startEffectPreviewLoop(): void {
    this.clearEffectPreviewTimers();
    this.runEffectCycle();
  }

  private runEffectCycle(): void {
    this.firstEffectCardFlipped = false;
    this.secondEffectCardFlipped = false;
    this.effectActive = false;

    const effectActivationDelay = this.getEffectActivationDelay();
    const effectResetDelay = this.getEffectResetDelay(effectActivationDelay);

    this.stepTimeouts.push(setTimeout(() => {
      this.firstEffectCardFlipped = true;
    }, 300));

    this.stepTimeouts.push(setTimeout(() => {
      this.secondEffectCardFlipped = true;
    }, 1000));

    this.stepTimeouts.push(setTimeout(() => {
      this.effectActive = true;
    }, effectActivationDelay));

    this.stepTimeouts.push(setTimeout(() => {
      this.effectActive = false;
    }, effectResetDelay));

    this.stepTimeouts.push(setTimeout(() => {
      this.firstEffectCardFlipped = false;
      this.secondEffectCardFlipped = false;
    }, effectResetDelay + 50));

    this.cycleTimeout = setTimeout(() => {
      this.runEffectCycle();
    }, 4600);
  }

  private getEffectActivationDelay(): number {
    if (this.effectPreview?.name === 'amethyst_crush') {
      return 1650;
    }
    return 1000;
  }

  private getEffectResetDelay(effectActivationDelay: number): number {
    if (this.effectPreview?.name === 'amethyst_crush') {
      return effectActivationDelay + 1350;
    }
    return 3000;
  }

  private clearEffectPreviewTimers(): void {
    if (this.cycleTimeout) {
      clearTimeout(this.cycleTimeout);
      this.cycleTimeout = null;
    }

    for (const timeoutRef of this.stepTimeouts) {
      clearTimeout(timeoutRef);
    }
    this.stepTimeouts = [];
  }
}
