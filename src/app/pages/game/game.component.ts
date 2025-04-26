import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Signal, signal } from '@angular/core';
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
import { Observable } from 'rxjs';
import { card } from '../../model/interfaces/card';
import { FlipsReference } from '../../model/interfaces/flipsReference';
import { GameService } from '../../services/game.service';
import { IconService } from '../../services/icon.service';
import { GameStatusComponent } from '../../components/dialogs/game-status/game-status.component';
import { GameDifficulties, GameModes } from '../../model/enum/game.enums';
import { MathService } from '../../services/math.service';
import { MathProblem } from '../../model/interfaces/mathProblem';

@Component({
  selector: 'app-game',
  imports: [MatIconModule, MatButtonModule, MatDialogModule, MatToolbarModule, MatFormFieldModule, MatSelectModule,
    MatProgressBarModule, CommonModule, FlipCardComponent, FormsModule, HttpClientModule, RouterModule
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
  pairsCount: number = 0;
  disableFlip: boolean = false;

  // observables
  matchFound$!: Observable<FlipsReference>;
  mismatch$!: Observable<FlipsReference>;

  // signal
  gameStartedSignal: Signal<boolean> = signal<boolean>(false);
  cardTotalSignal: Signal<number> = signal<number>(0);
  flipSignal: Signal<number> = signal<number>(0);
  matchesSignal: Signal<number> = signal<number>(0);
  solvesSignal: Signal<number> = signal<number>(0);
  failsLeftSignal: Signal<number> = signal<number>(0);

  // element reference
  dialogRef: any;

  private gameIntervalId: any;

  constructor(
    private gameService: GameService,
    private iconService: IconService,
    private mathService: MathService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {
    this.gameStartedSignal = this.gameService.getGameStartedSignal();
    this.cardTotalSignal = this.gameService.getCardTotalSignal();
    this.flipSignal = this.gameService.getFlipsSignal();
    this.matchesSignal = this.gameService.getMatchesSignal();
    this.solvesSignal = this.gameService.getSolvesSignal();
    this.failsLeftSignal = this.gameService.getFailsLeftSignal();

    this.matchFound$ = this.gameService.getMatchMadeObservable();
    this.mismatch$ = this.gameService.getMismatchObservable();
  }

  ngOnInit() {
    this.matchFound$.subscribe(match => {
      if (this.gameStartedSignal()) {
        this.cards[match.firstIndex].matched = true;
        this.cards[match.firstIndex].color = 'green';
        this.cards[match.secondIndex].matched = true;
        this.cards[match.secondIndex].color = 'green';
        if (this.matchesSignal() === this.pairsCount) {
          clearInterval(this.gameIntervalId);
          this.dialogRef = this.dialog.open(GameStatusComponent, {
            height: 'auto',
            width: '90%',
            maxWidth: '600px',
            data: {
              success: true,
              difficulty: this.selectedDifficulty as GameDifficulties,
              pairsFound: this.matchesSignal().toString(),
              totalPairs: this.pairsCount.toString(),
              flipCount: this.flipSignal().toString(),
              totalTime: this.gameTimeAvailable,
              timeRemaining: this.gameTimeRemaining,
            }
          });
          this.dialogRef.afterClosed().subscribe((playAgain: boolean) => {
            this.handleDialogClose(playAgain);
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

  }

  flipCard(index: number) {
    this.cards[index].flipped = !this.cards[index].flipped;
    this.gameService.incrementFlips();
    if (this.gameService.getSelectedMode() === 'pairs') {
      this.gameService.processPairFlip(index, this.cards);
    } else {
      //this.gameService.processSolutionFlip(index, this.cards);
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
    // start the game timer
    this.startGameTimer()
  }

  private generateCards() {
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
    const cardCount = this.cardTotalSignal();

    let problem: MathProblem = this.mathService.generateMathProblem(this.selectedDifficulty);

    this.cards.push({
      displayText: problem.display,
      color: '',
      flipped: false,
      matched: false
    });
    
    for (let i = 1; i < cardCount; i++) {
      this.cards.push({
        displayText: this.generateWrongSolution(problem.display),
        color: '',
        flipped: false,
        matched: false
      });
    }

    this.cards = this.cards.sort(() => 0.5 - Math.random());
  }

  private generateWrongSolution(correctSolution: string): string {
    let wrongSolution = correctSolution;
    const randomNumber = Math.floor(Math.random() * 20) + 1; // Random number between 1 and 20
    const operator = Math.random() < 0.5 ? '+' : '-'; // Randomly choose between addition and subtraction

    if (operator === '+') {
      wrongSolution = `${correctSolution} + ${randomNumber}`;
    } else {
      wrongSolution = `${correctSolution} - ${randomNumber}`;
    }

    return wrongSolution;
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
        this.dialogRef = this.dialog.open(GameStatusComponent, {
          height: 'auto',
          width: '90%',
          maxWidth: '600px',
          disableClose: true,
          data: {
            success: false,
            difficulty: this.selectedDifficulty as GameDifficulties,
            pairsFound: this.matchesSignal().toString(),
            totalPairs: this.pairsCount.toString(),
            flipCount: this.flipSignal().toString(),
            totalTime: this.gameTimeAvailable,
            timeRemaining: this.gameTimeRemaining,
          }
        });
        this.dialogRef.afterClosed().subscribe((playAgain: boolean) => {
          this.handleDialogClose(playAgain);
        });
      }
    }, 1000);
  }

  quitGame() {
    clearInterval(this.gameIntervalId);
    this.gameTimeRemainingPercentage = 100;
    this.cards = [];
    this.gameService.resetGame();
    this.gameService.updateGameStartedSignal(false);
  }

  private handleDialogClose(playAgain: boolean) {
    if (playAgain) {
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
        this.cards = [];
        this.gameService.resetGame();
        this.startGame();
      }, 1000);
    } else {
      this.quitGame();
    }
  }
}

