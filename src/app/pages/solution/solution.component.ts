import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, computed, OnDestroy, OnInit, Signal, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CardRegionComponent } from '../../components/card-region/card-region.component';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { card } from '../../model/interfaces/card';
import { SolutionStatus } from '../../model/enum/solution-status.enum';
import { MathProblem } from '../../model/interfaces/mathProblem';
import { IconService } from '../../services/icon.service';
import { MatDialog } from '@angular/material/dialog';
import { AnalyticsService } from '../../services/analytics.service';
import { GameService } from '../../services/game.service';
import { MathService } from '../../services/math.service';
import { EndGameDirectives, GameDifficulties, GameModes } from '../../model/enum/game.enums';
import { GameStatusComponent } from '../../components/dialogs/game-status/game-status.component';
import { Router } from '@angular/router';
import { QuiteGameComponent } from '../../components/dialogs/quite-game/quite-game.component';

@Component({
  selector: 'app-solution',
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressBarModule, CardRegionComponent],
  templateUrl: './solution.component.html',
  styleUrl: './solution.component.scss'
})
export class SolutionComponent implements OnInit, OnDestroy {

  cards: card[] = [];

  // game state
  gameTimeAvailable: number = 0;
  gameTimeRemaining: number = 0;
  gameTimeRemainingPercentage: number = 100;
  currentMathProblem: MathProblem = { display: '', solution: 0 };
  shouldSeeProblemDisplay: boolean = false;
  solutionModeStatusDisplay: SolutionStatus = SolutionStatus.MEMORIZE_PERIOD;
  disableFlip: boolean = false;
  selectedDifficulty: string = '';
  roundSuccess: boolean = false;
  isInReview: boolean = false;

  // observables
  solutionFound$!: Observable<number>;
  wrongSolution$!: Observable<number>;

  // signals
  cardTotalSignal: Signal<number> = signal<number>(0);
  solvesSignal: Signal<number> = signal<number>(0);
  currentStreakSignal: Signal<number> = signal<number>(0);
  bestStreakSignal: Signal<number> = signal<number>(0);
  failsLeftSignal: Signal<number> = signal<number>(0);

  // element references
  dialogRef: any;

  // intervals to manage game timing
  private gameIntervalId: any;
  private intermissionIntervalId: any;
  private reviewIntervalId: any;

  // teardown notifier for subscriptions
  private destroyed$ = new Subject<void>();

  constructor(
    private gameService: GameService,
    private mathService: MathService,
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.solvesSignal = this.gameService.getSolvesSignal();
    this.currentStreakSignal = this.gameService.getCurrentStreakSignal();
    this.bestStreakSignal = this.gameService.getBestStreakSignal();
    this.failsLeftSignal = this.gameService.getFailsLeftSignal();
    this.cardTotalSignal = this.gameService.getCardTotalSignal();

    this.solutionFound$ = this.gameService.getSolutionFoundObservable();
    this.wrongSolution$ = this.gameService.getWrongSolutionObservable();
  }

  ngOnInit(): void {
    this.selectedDifficulty = this.gameService.getDifficulty();
    this.startNewGame();

    this.solutionFound$.pipe(takeUntil(this.destroyed$)).subscribe((index) => {
      this.solutionModeStatusDisplay = SolutionStatus.SOLUTION_FOUND;
      this.gameService.updateSolvesSignal(this.solvesSignal() + 1);
      this.gameService.updateCurrentStreakSignal(this.currentStreakSignal() + 1);
      if (this.currentStreakSignal() > this.bestStreakSignal()) {
        this.gameService.updateBestStreakSignal(this.currentStreakSignal());
      }
      this.handleSolutionRoundEnd(true, index);
    });

    this.wrongSolution$.pipe(takeUntil(this.destroyed$)).subscribe((index) => {
      this.solutionModeStatusDisplay = SolutionStatus.SOLUTION_NOT_FOUND;
      this.gameService.updateFailsLeftSignal(this.failsLeftSignal() - 1);
      this.gameService.updateCurrentStreakSignal(0);
      this.handleSolutionRoundEnd(false, index);
    });
  }

  ngOnDestroy(): void {
    // stop game interval timer if running
    if (this.gameIntervalId) {
      clearInterval(this.gameIntervalId);
      this.gameIntervalId = null;
    }
    // stop intermission timer if running
    if (this.intermissionIntervalId) {
      clearInterval(this.intermissionIntervalId);
      this.intermissionIntervalId = null;
    }
    // stop review timer if running
    if (this.reviewIntervalId) {
      clearInterval(this.reviewIntervalId);
      this.reviewIntervalId = null;
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
    this.generateSolutionCards();
    // signal game is starting
    this.gameService.updateGameStartedSignal(true);
    // start game interval timer
    this.startSolutionRound();
  }

  playAgain() {
    this.disableFlip = true;
    this.shouldSeeProblemDisplay = false;
    this.solutionModeStatusDisplay = SolutionStatus.MEMORIZE_PERIOD;
    this.cards.forEach(card => {
      card.flipped = false;
      card.matched = false;
    });
    this.gameTimeRemaining = this.gameTimeAvailable;
    this.gameTimeRemainingPercentage = 100;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.disableFlip = false;
      this.gameService.resetSolutionGame();
      this.startNewGame();
    }, 1000);
  }

  onCardFlipped(index: number) {
    this.cards[index].flipped = !this.cards[index].flipped;
    this.gameService.processSolutionFlip(index, this.cards, this.currentMathProblem);
  }

  skipStep() {
    clearInterval(this.reviewIntervalId);
    this.isInReview = false;
    this.prepareNextSolution();
    this.cdr.detectChanges();
  }

  quitGame() {
    clearInterval(this.gameIntervalId);
    clearInterval(this.intermissionIntervalId);
    clearInterval(this.reviewIntervalId);
    // if the game is started track abandonment
    if (this.gameService.getGameStartedSignal()() === true) {
      this.analyticsService.quitGameEvent(GameModes.SOLUTION, {
        difficulty: this.selectedDifficulty as GameDifficulties
      });
    }
    this.disableFlip = false;
    this.shouldSeeProblemDisplay = false;
    this.solutionModeStatusDisplay = SolutionStatus.MEMORIZE_PERIOD;
    this.gameTimeRemainingPercentage = 100;
    this.gameService.resetPairsGame();
    this.gameService.updateGameStartedSignal(false);
    this.router.navigate(['']);
  }

  streakLevelClass = computed(() => {
    const v = this.currentStreakSignal();
    if (v >= 20) return 'streak--legend';
    if (v >= 15) return 'streak--onfire';
    if (v >= 10)  return 'streak--hot';
    if (v >= 5)  return 'streak--warm';
    return ''; // no special styling
  });

  private generateSolutionCards() {
    this.cards = [];
    const cardCount = this.cardTotalSignal();

    this.currentMathProblem = this.mathService.generateMathProblem(this.selectedDifficulty);
    const isDecimal = this.currentMathProblem.solution % 1 !== 0;
    this.cards.push({
      displayText: isDecimal ? this.currentMathProblem.solution.toFixed(2) : this.currentMathProblem.solution.toString(),
      color: '',
      flipped: true,
      matched: false
    });

    let wrongAnswers = this.mathService.generateWrongSolutions(this.currentMathProblem.solution, this.selectedDifficulty, cardCount - 1);
    console.log('Wrong answers generated:', wrongAnswers);

    for (let i = 0; i < wrongAnswers.length; i++) {
      this.cards.push({
        displayText: wrongAnswers[i],
        color: '',
        flipped: true,
        matched: false
      });
    }

    this.cards = this.cards.sort(() => 0.5 - Math.random());
  }

  private startSolutionRound() {
    let intermissionTimeRemaining = 5;
    this.gameTimeRemaining = intermissionTimeRemaining;
    this.gameTimeRemainingPercentage = 100;
    this.intermissionIntervalId = setInterval(() => {
      if (intermissionTimeRemaining > 0) {
        intermissionTimeRemaining--;

        this.gameTimeRemaining = intermissionTimeRemaining;
        this.gameTimeRemainingPercentage = (intermissionTimeRemaining / 5) * 100;
        this.cdr.detectChanges();
      } else {
        clearInterval(this.intermissionIntervalId);
        this.solutionModeStatusDisplay = SolutionStatus.SOLVE_PERIOD;
        this.cards.forEach(card => {
          card.flipped = false;
          card.matched = false;
        });
        this.disableFlip = false;
        this.shouldSeeProblemDisplay = true;
        let secondsRemaining = this.gameTimeAvailable;
        this.gameTimeRemaining = secondsRemaining;
        this.gameTimeRemainingPercentage = 100;
        this.cdr.detectChanges();
        this.gameIntervalId = setInterval(() => {
          if (secondsRemaining > 0) {
            secondsRemaining--;

            this.gameTimeRemaining = secondsRemaining;
            this.gameTimeRemainingPercentage = (secondsRemaining / this.gameService.getTimeToSolve()) * 100;
            this.cdr.detectChanges();
          } else {
            this.solutionModeStatusDisplay = SolutionStatus.SOLUTION_NOT_SELECTED;
            this.gameService.updateFailsLeftSignal(this.failsLeftSignal() - 1);
            this.handleSolutionRoundEnd(false, -1);
          }
        }, 1000);
      }
    }, 1000);
  }

  private handleSolutionRoundEnd(success: boolean, index: number) {
    clearInterval(this.gameIntervalId);
    this.disableFlip = true;
    for(let i = 0; i < this.cards.length; i++) {
      this.cards[i].flipped = true;
      if (Number(this.cards[i].displayText) == this.currentMathProblem.solution) {
        this.cards[i].matched = true;
      }
    }
    if (!success && index >= 0) {
      this.cards[index].color = 'red';
    }
    if (!this.checkSolutionGameOver()) {
      // provide a 5 second review period if the game is not over
      let reviewTimeRemaining = 5;
      this.gameTimeRemaining = reviewTimeRemaining;
      this.gameTimeRemainingPercentage = 100;
      this.isInReview = true;
      this.reviewIntervalId = setInterval(() => {
        if (reviewTimeRemaining > 0) {
          reviewTimeRemaining--;

          this.gameTimeRemaining = reviewTimeRemaining;
          this.gameTimeRemainingPercentage = (reviewTimeRemaining / 5) * 100;
          this.cdr.detectChanges();
        } else {
          this.isInReview = false;
          clearInterval(this.reviewIntervalId);
          this.prepareNextSolution();
          this.cdr.detectChanges();
        }
      }, 1000);
    }
  }

  private checkSolutionGameOver(): boolean {
    if (this.failsLeftSignal() <= 0) {
      clearInterval(this.gameIntervalId);
      this.roundSuccess = false;
      this.dialogRef = this.dialog.open(GameStatusComponent, {
        height: 'auto',
        width: '90%',
        maxWidth: '600px',
        disableClose: true,
        data: {
          success: this.roundSuccess,
          mode: GameModes.SOLUTION,
          difficulty: this.selectedDifficulty as GameDifficulties,
          solveCount: this.solvesSignal().toString(),
          bestStreak: this.bestStreakSignal().toString(),
        }
      });
      this.dialogRef.afterClosed().subscribe((directive: EndGameDirectives) => {
        this.handleDialogClose(directive);
      });
      this.analyticsService.trackGameModeEnd(GameModes.SOLUTION, {
        difficulty: this.selectedDifficulty as GameDifficulties,
        success: this.roundSuccess,
        solves: this.solvesSignal(),
        streak: this.bestStreakSignal(),
        time_taken: this.gameTimeAvailable
      });
      return true;
    }
    return false;
  }

  private prepareNextSolution() {
    this.shouldSeeProblemDisplay = false;
    this.gameTimeAvailable = this.gameTimeRemaining = this.gameService.getTimeToSolve();
    this.solutionModeStatusDisplay = SolutionStatus.MEMORIZE_PERIOD;
    this.generateSolutionCards();
    this.startSolutionRound();
  }
  /** GAME LOGIC RELATED OPERATIONS - END */

  /** DIALOG RELATED OPERATIONS - START */
  private handleDialogClose(directive: EndGameDirectives) {
    if (directive === EndGameDirectives.PLAY_AGAIN) {
      this.playAgain();
    } else if (directive === EndGameDirectives.MAIN_MENU) {
      this.quitGame();
    }
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
}
