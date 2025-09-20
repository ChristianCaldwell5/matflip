import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Signal, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CardRegionComponent } from "../../components/card-region/card-region.component";
import { card } from '../../model/interfaces/card';
import { GameService } from '../../services/game.service';
import { MatDialog } from '@angular/material/dialog';
import { GameStatusComponent } from '../../components/dialogs/game-status/game-status.component';
import { EndGameDirectives, GameDifficulties, GameModes } from '../../model/enum/game.enums';
import { QuiteGameComponent } from '../../components/dialogs/quite-game/quite-game.component';
import { take } from 'rxjs';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-pairs',
  imports: [CommonModule, MatIconModule, MatProgressBarModule, CardRegionComponent],
  templateUrl: './pairs.component.html',
  styleUrl: './pairs.component.scss'
})
export class PairsComponent {

  cards: card[] = [];

  // game state
  gameTimeAvailable: number = 0;
  gameTimeRemaining: number = 0;
  gameTimeRemainingPercentage: number = 100;
  disableFlip: boolean = false;
  pairsCount: number = 0;
  viewBoardMode: boolean = false;
  selectedDifficulty: string = '';
  roundSuccess: boolean = false;

  // signals
  matchesSignal: Signal<number> = signal<number>(0);
  flipSignal: Signal<number> = signal<number>(0);

  // element references
  dialogRef: any;

  // interval to manage game timing
  private gameIntervalId: any;

  constructor(
    private gameService: GameService,
    private analyticsService: AnalyticsService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) {}

  /** GAME LOGIC RELATED OPERATIONS - START */
  startNewGame() {}

  playAgain() {}

  onCardFlipped(index: number) {
    this.cards[index].flipped = !this.cards[index].flipped;
    this.gameService.incrementFlips();
    this.gameService.processPairFlip(index, this.cards);
  }

  quitGame() {
    clearInterval(this.gameIntervalId);
    this.disableFlip = false;
    this.viewBoardMode = false;
    this.gameTimeRemainingPercentage = 100;
    this.gameService.resetGame();
    this.gameService.updateGameStartedSignal(false);
    this.analyticsService.quitGameEvent(GameModes.PAIRS, {
      difficulty: this.selectedDifficulty as GameDifficulties
    });
  }
  /** GAME LOGIC RELATED OPERATIONS - END */

  /** DIALOG RELATED OPERATIONS - START */
  openStatusDialog() {
    this.viewBoardMode = false;
    this.dialogRef = this.dialog.open(GameStatusComponent, {
      height: 'auto',
      width: '90%',
      maxWidth: '600px',
      disableClose: true,
      data: {
        success: this.roundSuccess,
        mode: GameModes.PAIRS,
        difficulty: this.selectedDifficulty as GameDifficulties,
        pairsFound: this.matchesSignal().toString(),
        totalPairs: this.pairsCount.toString(),
        flipCount: this.flipSignal().toString(),
        totalTime: this.gameTimeAvailable,
        timeRemaining: this.gameTimeRemaining,
      }
    });
    this.dialogRef.afterClosed().subscribe((directive: EndGameDirectives) => {
      this.handleDialogClose(directive);
    });
  }

  openQuitDialog() {
    const dialogRef = this.dialog.open(QuiteGameComponent, {
      height: 'auto',
      width: '90%',
      maxWidth: '600px',
      disableClose: false
    });

    dialogRef.componentInstance.confirmQuit.pipe(take(1)).subscribe(() => {
      this.quitGame();
      dialogRef.close();
    });
  }

  private handleDialogClose(directive: EndGameDirectives) {
    if (directive === EndGameDirectives.PLAY_AGAIN) {
      this.startNewGame();
    } else if (directive === EndGameDirectives.MAIN_MENU) {
      this.quitGame();
    } else if (directive === EndGameDirectives.VIEW_BOARD) {
      this.viewBoardMode = true;
      this.disableFlip = true;
      for (let card of this.cards) {
        card.flipped = true;
      }
      this.cdr.detectChanges();
    }
  }
  /** DIALOG RELATED OPERATIONS - END */

}
