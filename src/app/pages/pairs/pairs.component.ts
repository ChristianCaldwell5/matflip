import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, Signal, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CardRegionComponent } from "../../components/card-region/card-region.component";
import { card } from '../../model/interfaces/card';
import { GameService } from '../../services/game.service';
import { MatDialog } from '@angular/material/dialog';
import { GameStatusComponent } from '../../components/dialogs/game-status/game-status.component';
import { EndGameDirectives, GameDifficulties, GameModes } from '../../model/enum/game.enums';
import { QuiteGameComponent } from '../../components/dialogs/quite-game/quite-game.component';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { AnalyticsService } from '../../services/analytics.service';
import { IconService } from '../../services/icon.service';
import { FlipsReference } from '../../model/interfaces/flipsReference';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pairs',
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressBarModule, CardRegionComponent],
  templateUrl: './pairs.component.html',
  styleUrl: './pairs.component.scss'
})
export class PairsComponent implements OnInit, OnDestroy {

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

  // observables
  matchFound$!: Observable<FlipsReference>;
  mismatch$!: Observable<FlipsReference>;

  // signals
  gameStartedSignal: Signal<boolean> = signal<boolean>(false);
  cardTotalSignal: Signal<number> = signal<number>(0);
  matchesSignal: Signal<number> = signal<number>(0);
  flipSignal: Signal<number> = signal<number>(0);

  // element references
  dialogRef: any;

  // interval to manage game timing
  private gameIntervalId: any;
  // teardown notifier for subscriptions
  private destroyed$ = new Subject<void>();

  constructor(
    private gameService: GameService,
    private iconService: IconService,
    private analyticsService: AnalyticsService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.gameStartedSignal = this.gameService.getGameStartedSignal();
    this.cardTotalSignal = this.gameService.getCardTotalSignal();
    this.flipSignal = this.gameService.getFlipsSignal();
    this.matchesSignal = this.gameService.getMatchesSignal();
    this.matchFound$ = this.gameService.getMatchMadeObservable();
    this.mismatch$ = this.gameService.getMismatchObservable();
  }

  ngOnInit() {
    this.selectedDifficulty = this.gameService.getDifficulty();
    this.startNewGame();

    this.matchFound$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(match => {
      if (this.gameStartedSignal()) {
        this.cards[match.firstIndex].matched = true;
        this.cards[match.firstIndex].color = '#2acc89';
        this.cards[match.secondIndex].matched = true;
        this.cards[match.secondIndex].color = '#2acc89';
        if (this.matchesSignal() === this.pairsCount) {
          clearInterval(this.gameIntervalId);
          this.gameService.updateGameStartedSignal(false);
          this.roundSuccess = true;
          this.dialogRef = this.dialog.open(GameStatusComponent, {
            height: 'auto',
            width: '90%',
            maxWidth: '600px',
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
          this.dialogRef.afterClosed().pipe(takeUntil(this.destroyed$)).subscribe((directive: EndGameDirectives) => {
            this.handleDialogClose(directive);
          });
          this.analyticsService.trackGameModeEnd(GameModes.PAIRS, {
            difficulty: this.selectedDifficulty as GameDifficulties,
            success: true,
            time_taken: this.gameTimeAvailable - this.gameTimeRemaining
          });
        }
      }
    });

    this.mismatch$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(mismatch => {
      this.disableFlip = true;
      if (this.gameStartedSignal()) {
        setTimeout(() => {
          this.disableFlip = false;
          this.cards[mismatch.firstIndex].flipped = false;
          this.cards[mismatch.secondIndex].flipped = false;
          this.cdr.detectChanges();
        }, 1000);
      }
    });
  }

  ngOnDestroy(): void {
    // stop interval timer if running
    if (this.gameIntervalId) {
      clearInterval(this.gameIntervalId);
      this.gameIntervalId = null;
    }
    // notify and complete all subscriptions
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  /** GAME LOGIC RELATED OPERATIONS - START */
  startNewGame() {
    // get time to solve based on game settings
    this.gameTimeAvailable = this.gameTimeRemaining = this.gameService.getTimeToSolve();
    this.gameTimeRemainingPercentage = 100;
    this.cdr.detectChanges();
    // generate cards for this round
    this.generateCards();
    // signal game is starting
    this.gameService.updateGameStartedSignal(true);
    // start game interval timer
    this.startGameTimer();
  }

  playAgain() {
    this.viewBoardMode = false;
    this.roundSuccess = false;
    this.disableFlip = true;
    this.cards.forEach(card => {
      card.flipped = false;
      card.matched = false;
    });
    this.cdr.detectChanges();
    setTimeout(() => {
      this.disableFlip = false;
      this.gameService.resetPairsGame();
      this.startNewGame();
    }, 1000);
  }

  onCardFlipped(index: number) {
    this.cards[index].flipped = !this.cards[index].flipped;
    this.gameService.incrementFlips();
    this.gameService.processPairFlip(index, this.cards);
  }

  quitGame() {
    clearInterval(this.gameIntervalId);
    // if the game is started track abandonment
    if (this.gameService.getGameStartedSignal()() === true) {
      this.analyticsService.quitGameEvent(GameModes.PAIRS, {
        difficulty: this.selectedDifficulty as GameDifficulties
      });
    }
    this.disableFlip = false;
    this.viewBoardMode = false;
    this.gameTimeRemainingPercentage = 100;
    this.gameService.resetPairsGame();
    this.gameService.updateGameStartedSignal(false);
    this.router.navigate(['']);
  }

  private generateCards() {
    this.cards = [];
    const iconCount = Math.floor(this.cardTotalSignal() / 2);
    this.pairsCount = iconCount;
    const selectedIcons = this.iconService.getIconListAndCycle(iconCount);

    for (let i = 0; i < iconCount; i++) {
      this.cards.push({
        icon: selectedIcons[i],
        color: '',
        flipped: false,
        matched: false
      });
      this.cards.push({
        icon: selectedIcons[i],
        color: '',
        flipped: false,
        matched: false
      });
    }

    this.cards = this.cards.sort(() => 0.5 - Math.random());
  }

  private startGameTimer() {
    let secondsRemaining = this.gameTimeAvailable;
    this.gameIntervalId = setInterval(() => {
      if (secondsRemaining > 0) {
        secondsRemaining--;

        this.gameTimeRemaining = secondsRemaining;
        this.gameTimeRemainingPercentage = (secondsRemaining / this.gameService.getTimeToSolve()) * 100;
        this.cdr.detectChanges();
      } else {
        clearInterval(this.gameIntervalId);
        this.gameService.updateGameStartedSignal(false);
        this.roundSuccess = false;
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
        this.dialogRef.afterClosed().pipe(takeUntil(this.destroyed$)).subscribe((directive: EndGameDirectives) => {
          this.handleDialogClose(directive);
        });
        this.analyticsService.trackGameModeEnd(GameModes.PAIRS, {
          difficulty: this.selectedDifficulty as GameDifficulties,
          success: false,
          time_taken: this.gameTimeAvailable
        });
      }
    }, 1000);
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
    this.dialogRef.afterClosed().pipe(takeUntil(this.destroyed$)).subscribe((directive: EndGameDirectives) => {
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

    dialogRef.componentInstance.confirmQuit.pipe(takeUntil(this.destroyed$), take(1)).subscribe(() => {
      this.quitGame();
      dialogRef.close();
    });
  }

  private handleDialogClose(directive: EndGameDirectives) {
    if (directive === EndGameDirectives.PLAY_AGAIN) {
      this.playAgain();
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
