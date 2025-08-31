import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, Signal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { FlipCardComponent } from '../../components/flip-card/flip-card.component';
import { Observable, take } from 'rxjs';
import { card } from '../../model/interfaces/card';
import { FlipsReference } from '../../model/interfaces/flipsReference';
import { GameService } from '../../services/game.service';
import { IconService } from '../../services/icon.service';
import { GameStatusComponent } from '../../components/dialogs/game-status/game-status.component';
import { EndGameDirectives, GameDifficulties, GameModes } from '../../model/enum/game.enums';
import { MathService } from '../../services/math.service';
import { MathProblem } from '../../model/interfaces/mathProblem';
import { SolutionStatus } from '../../model/enum/solution-status.enum';
import { HowToComponent } from '../../components/dialogs/how-to/how-to.component';
import { QuiteGameComponent } from '../../components/dialogs/quite-game/quite-game.component';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-game',
  imports: [MatIconModule, MatButtonModule, MatDialogModule, MatToolbarModule, MatFormFieldModule, MatSelectModule,
    MatProgressBarModule, CommonModule, FlipCardComponent, FormsModule, RouterModule
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent {

  cards: card[] = [];

  selectedMode: string = '';
  selectedDifficulty: string = '';

  // game state
  gameTimeAvailable: number = 0;
  gameTimeRemaining: number = 0;
  gameTimeRemainingPercentage: number = 100;
  currentMathProblem: MathProblem = { display: '', solution: 0 };
  shouldSeeProblemDisplay: boolean = false;
  solutionModeStatusDisplay: SolutionStatus = SolutionStatus.MEMORIZE_PERIOD;
  pairsCount: number = 0;
  disableFlip: boolean = false;
  viewBoardMode: boolean = false;
  roundSuccess: boolean = false;
  isInReview: boolean = false;

  // observables
  matchFound$!: Observable<FlipsReference>;
  mismatch$!: Observable<FlipsReference>;
  solutionFound$!: Observable<number>;
  wrongSolution$!: Observable<number>;

  // signals
  gameStartedSignal: Signal<boolean> = signal<boolean>(false);
  cardTotalSignal: Signal<number> = signal<number>(0);
  flipSignal: Signal<number> = signal<number>(0);
  matchesSignal: Signal<number> = signal<number>(0);
  solvesSignal: Signal<number> = signal<number>(0);
  currentStreakSignal: Signal<number> = signal<number>(0);
  bestStreakSignal: Signal<number> = signal<number>(0);
  failsLeftSignal: Signal<number> = signal<number>(0);
  viewingBoard: Signal<boolean> = signal<boolean>(false);

  // element references
  dialogRef: any;

  // intervals to manage game timing
  private gameIntervalId: any;
  private intermissionIntervalId: any;
  private reviewIntervalId: any;

  constructor(
    private gameService: GameService,
    private iconService: IconService,
    private mathService: MathService,
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {
    this.gameStartedSignal = this.gameService.getGameStartedSignal();
    this.cardTotalSignal = this.gameService.getCardTotalSignal();
    this.flipSignal = this.gameService.getFlipsSignal();
    this.matchesSignal = this.gameService.getMatchesSignal();
    this.solvesSignal = this.gameService.getSolvesSignal();
    this.currentStreakSignal = this.gameService.getCurrentStreakSignal();
    this.bestStreakSignal = this.gameService.getBestStreakSignal();
    this.failsLeftSignal = this.gameService.getFailsLeftSignal();

    this.matchFound$ = this.gameService.getMatchMadeObservable();
    this.mismatch$ = this.gameService.getMismatchObservable();
    this.solutionFound$ = this.gameService.getSolutionFoundObservable();
    this.wrongSolution$ = this.gameService.getWrongSolutionObservable();
  }

  ngOnInit() {
    this.matchFound$.subscribe(match => {
      if (this.gameStartedSignal()) {
        this.cards[match.firstIndex].matched = true;
        this.cards[match.firstIndex].color = '#2acc89';
        this.cards[match.secondIndex].matched = true;
        this.cards[match.secondIndex].color = '#2acc89';
        if (this.matchesSignal() === this.pairsCount) {
          this.roundSuccess = true;
          clearInterval(this.gameIntervalId);
          this.dialogRef = this.dialog.open(GameStatusComponent, {
            height: 'auto',
            width: '90%',
            maxWidth: '600px',
            data: {
              success: this.roundSuccess,
              mode: this.selectedMode as GameModes,
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
          this.analyticsService.trackGameModeEnd(GameModes.PAIRS, {
            difficulty: this.selectedDifficulty as GameDifficulties,
            success: true,
            time_taken: this.gameTimeAvailable - this.gameTimeRemaining
          });
        }
      }
    });

    this.mismatch$.subscribe(mismatch => {
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

    this.solutionFound$.subscribe((index) => {
      this.solutionModeStatusDisplay = SolutionStatus.SOLUTION_FOUND;
      this.gameService.updateSolvesSignal(this.solvesSignal() + 1);
      this.gameService.updateCurrentStreakSignal(this.currentStreakSignal() + 1);
      if (this.currentStreakSignal() > this.bestStreakSignal()) {
        this.gameService.updateBestStreakSignal(this.currentStreakSignal());
      }
      this.handleSolutionRoundEnd(true, index);
    });

    this.wrongSolution$.subscribe((index) => {
      this.solutionModeStatusDisplay = SolutionStatus.SOLUTION_NOT_FOUND;
      this.gameService.updateFailsLeftSignal(this.failsLeftSignal() - 1);
      this.gameService.updateCurrentStreakSignal(0);
      this.handleSolutionRoundEnd(false, index);
    });
  }

  howToClicked() {
    this.dialogRef = this.dialog.open(HowToComponent, {
      height: 'auto',
      maxHeight: '90vh',
      width: '90%',
      maxWidth: '700px',
      disableClose: false,
    });
    this.analyticsService.howToPlayEvent();
  }

  flipCard(index: number) {
    this.cards[index].flipped = !this.cards[index].flipped;
    this.gameService.incrementFlips();
    if (this.gameService.getSelectedMode() === 'pairs') {
      this.gameService.processPairFlip(index, this.cards);
    } else {
      this.gameService.processSolutionFlip(index, this.cards, this.currentMathProblem);
    }
  }

  startGame() {
    // set game settings to default if not set by player
    this.selectedMode = this.selectedMode == '' ? GameModes.PAIRS : this.selectedMode;
    this.selectedDifficulty = this.selectedDifficulty == '' ? GameDifficulties.MEDIUM : this.selectedDifficulty;
    // update game settings to match desired game settings
    this.gameService.setSelectedMode(this.selectedMode as GameModes);
    this.gameService.setDifficulty(this.selectedDifficulty as GameDifficulties);
    // setup the game with settings
    this.gameService.setGameSettings(this.gameService.getSelectedMode(), this.gameService.getDifficulty());
    // generate cards for the game if game mode is pairs
    if (this.gameService.getSelectedMode() === GameModes.PAIRS) {
      this.generateCards();
    } else {
      this.generateSolutionCards();
    }
    // get time to solve based on game settings
    this.gameTimeAvailable = this.gameTimeRemaining = this.gameService.getTimeToSolve();
    // show the game board
    this.gameService.updateGameStartedSignal(true);

    this.analyticsService.trackGameModeStart(this.gameService.getSelectedMode(), { difficulty: this.selectedDifficulty as GameDifficulties });

    if (this.gameService.getSelectedMode() === GameModes.PAIRS) {
      this.startGameTimer();
    } else {
      this.startSolutionRound();
    }
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
        this.roundSuccess = false;
        this.dialogRef = this.dialog.open(GameStatusComponent, {
          height: 'auto',
          width: '90%',
          maxWidth: '600px',
          disableClose: true,
          data: {
            success: this.roundSuccess,
            mode: this.selectedMode as GameModes,
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
        this.analyticsService.trackGameModeEnd(GameModes.PAIRS, {
          difficulty: this.selectedDifficulty as GameDifficulties,
          success: false,
          time_taken: this.gameTimeAvailable
        });
      }
    }, 1000);
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
          mode: this.selectedMode as GameModes,
          difficulty: this.selectedDifficulty as GameDifficulties,
          solveCount: this.solvesSignal().toString(),
          bestStreak: this.bestStreakSignal().toString(),
        }
      });
      this.dialogRef.afterClosed().subscribe((directive: EndGameDirectives) => {
        this.handleDialogClose(directive);
      });
      this.analyticsService.trackGameModeEnd(this.selectedMode as GameModes, {
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

  /**
   * Quits the game and resets the game state.
   */
  quitGame() {
    clearInterval(this.gameIntervalId);
    clearInterval(this.intermissionIntervalId);
    clearInterval(this.reviewIntervalId);
    this.disableFlip = false;
    this.viewBoardMode = false;
    this.shouldSeeProblemDisplay = false;
    this.gameTimeRemainingPercentage = 100;
    this.solutionModeStatusDisplay = SolutionStatus.MEMORIZE_PERIOD;
    this.gameService.resetGame();
    this.gameService.updateGameStartedSignal(false);
    this.analyticsService.quitGameEvent(this.selectedMode as GameModes, {
      difficulty: this.selectedDifficulty as GameDifficulties
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

  startNewGame() {
    this.viewBoardMode = false;
    this.shouldSeeProblemDisplay = false;
    this.roundSuccess = false;
    this.solutionModeStatusDisplay = SolutionStatus.MEMORIZE_PERIOD;
    this.disableFlip = true;
    this.cards.forEach(card => {
      card.flipped = false;
      card.matched = false;
    });
    this.gameTimeRemaining = this.gameTimeAvailable;
    this.gameTimeRemainingPercentage = 100;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.disableFlip = false;
      this.gameService.resetGame();
      this.startGame();
    }, 1000);
  }

  openStatusDialog() {
    this.viewBoardMode = false;
    this.dialogRef = this.dialog.open(GameStatusComponent, {
      height: 'auto',
      width: '90%',
      maxWidth: '600px',
      disableClose: true,
      data: {
        success: this.roundSuccess,
        mode: this.selectedMode as GameModes,
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

  skipStep() {
    clearInterval(this.reviewIntervalId);
    this.isInReview = false;
    this.prepareNextSolution();
    this.cdr.detectChanges();
  }

  streakLevelClass = computed(() => {
    const v = this.currentStreakSignal();
    if (v >= 20) return 'streak--legend';
    if (v >= 15) return 'streak--onfire';
    if (v >= 10)  return 'streak--hot';
    if (v >= 5)  return 'streak--warm';
    return ''; // no special styling
  });
}
