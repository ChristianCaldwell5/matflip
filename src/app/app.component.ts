import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Signal, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { FlipCardComponent } from './components/flip-card/flip-card.component';
import { GameService } from './services/game.service';
import { HttpClientModule } from '@angular/common/http';
import { card } from './model/interfaces/card';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { FlipsReference } from './model/interfaces/flipsReference';
import { GameDifficulties, GameModes } from './model/enum/game.enums';
import { IconService } from './services/icon.service';

@Component({
  selector: 'app-root',
  imports: [MatIconModule, MatButtonModule, MatDialogModule, MatToolbarModule, MatFormFieldModule, MatSelectModule,
    MatProgressBarModule, CommonModule, FlipCardComponent, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  title = 'matflip';
  private icons: string[] = [];
  cards: card[] = [];

  selectedMode: string = '';
  selectedDifficulty: string = '';

  // game state
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

  private gameIntervalId: any;

  constructor(
    private gameService: GameService,
    private iconService: IconService,
    private cdr: ChangeDetectorRef
  ) {
    this.gameStartedSignal = this.gameService.getGameStartedSignal();
    this.cardTotalSignal = this.gameService.getCardTotalSignal();
    this.flipSignal = this.gameService.getFlipsSignal();
    this.matchesSignal = this.gameService.getMatchesSignal();

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
          setTimeout(() => {
            alert('Congratulations! You have won the game.');
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

  generateCards() {
    const iconCount = Math.floor(this.cardTotalSignal()/2);
    this.pairsCount = iconCount;
    const selectedIcons = this.iconService.getIconListAndCycle(iconCount);

    for (let i = 0; i < iconCount; i++) {
      const color = this.getRandomColor();
      this.cards.push({
        icon: selectedIcons[i],
        color: color,
        flipped: false,
        matched: false
      });
      this.cards.push({
        icon: selectedIcons[i],
        color: color,
        flipped: false,
        matched: false
      });
    }

    this.cards = this.cards.sort(() => 0.5 - Math.random());
  }

  getRandomColor(): string {
    const colors = ['blue', 'green', 'red', 'yellow', 'purple'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  startGame() {
    if (this.selectedMode) {
      this.gameService.setSelectedMode(this.selectedMode as GameModes);
    } else {
      this.gameService.setSelectedMode(GameModes.PAIRS);
    }
    if (this.selectedDifficulty) {
      this.gameService.setDifficulty(this.selectedDifficulty as GameDifficulties);
    } else {
      this.gameService.setDifficulty(GameDifficulties.MEDIUM);
    }

    this.gameService.setGameSettings(this.gameService.getSelectedMode(), this.gameService.getDifficulty());
    this.generateCards();
    this.gameTimeRemaining = this.gameService.getTimeToSolve();
    this.gameService.updateGameStartedSignal(true);
    this.startGameTimer()
  }

  startGameTimer() {
    let secondsRemaining = this.gameTimeRemaining;
    this.gameIntervalId = setInterval(() => {
      if (secondsRemaining > 0) {
        secondsRemaining--;
        
        this.gameTimeRemaining = secondsRemaining;
        this.gameTimeRemainingPercentage = (secondsRemaining / this.gameService.getTimeToSolve()) * 100;
        this.cdr.detectChanges();
      } else {
        clearInterval(this.gameIntervalId);
        this.quitGame();
        alert('Time is up! Game over.');
      }
    }, 1000);
  }

  quitGame() {
    clearInterval(this.gameIntervalId);
    this.cards = [];
    this.gameService.updateGameStartedSignal(false);
  }
}
