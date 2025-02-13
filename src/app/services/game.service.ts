import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { signal, Signal } from '@angular/core';
import { FlipsReference } from '../model/interfaces/flipsReference';
import { GameDifficulties, GameModes } from '../model/enum/game.enums';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  // game settings
  private selectedMode: GameModes = GameModes.PAIRS;
  private timeToSolve: number = 60;
  private difficulty: GameDifficulties = GameDifficulties.EASY;

  // active game state
  private firstFlipIndex: number = -1;
  private secondFlipIndex: number = -1;
  private matches: number = 0;
  private flips: number = 0;

  // subjects for game state
  private matchMadeSubject = new Subject<FlipsReference>();
  private mismatchSubject = new Subject<FlipsReference>();

  // signals for game information
  private gameStartedSignal = signal(false);
  private cardTotalSignal = signal(8);
  private flipsSignal = signal(0);
  private matchesSignal = signal(0);

  constructor() { 
  }

  getSelectedMode(): GameModes {
    return this.selectedMode;
  }

  setSelectedMode(selectedMode: GameModes): void {
    this.selectedMode = selectedMode;
  }

  getTimeToSolve(): number {
    return this.timeToSolve;
  }

  setTimeToSolve(timeToSolve: number): void {
    this.timeToSolve = timeToSolve;
  }

  getDifficulty(): GameDifficulties {
    return this.difficulty;
  }
  
  setDifficulty(difficulty: GameDifficulties): void {
    this.difficulty = difficulty;
  }

  getCardTotalSignal(): Signal<number> {
    return this.cardTotalSignal;
  }

  updateCardTotalSignal(cardTotal: number): void {
    this.cardTotalSignal.set(cardTotal);
  }

  getGameStartedSignal(): Signal<boolean> {
    return this.gameStartedSignal;
  }

  updateGameStartedSignal(gameStarted: boolean): void {
    this.gameStartedSignal.set(gameStarted);
  }

  // get matches signal
  getMatchesSignal(): Signal<number> {
    return this.matchesSignal;
  }

  // update matches signal
  updateMatchesSignal(matches: number): void {
    this.matchesSignal.set(matches);
  }

  // get flips signal
  getFlipsSignal(): Signal<number> {
    return this.flipsSignal;
  }

  // update flip signal
  updateFlipsSignal(flips: number): void {
    this.flipsSignal.set(flips);
  }

  getFirstFlipIndex(): number {
    return this.firstFlipIndex;
  }

  setFirstFlipIndex(firstFlipIndex: number): void {
    this.firstFlipIndex = firstFlipIndex;
  }

  getSecondFlipIndex(): number {
    return this.secondFlipIndex;
  }

  setSecondFlipIndex(secondFlipIndex: number): void {
    this.secondFlipIndex = secondFlipIndex;
  }

  getMatchMadeObservable(): Observable<FlipsReference> {
    return this.matchMadeSubject.asObservable();
  }

  getMismatchObservable(): Observable<FlipsReference> {
    return this.mismatchSubject.asObservable();
  }

  incrementFlips(): void {
    this.flips++;
    this.flipsSignal.set(this.flips);
  }

  setGameSettings(mode: GameModes, difficulty: GameDifficulties): void {
    switch (mode) {
      case GameModes.PAIRS:
        this.setPairGameSettings(difficulty);
        break;
      case GameModes.SOLUTION:
        break;
      default:
        this.setPairGameSettings(difficulty);
    }
  }

  private setPairGameSettings(difficulty: GameDifficulties): void {
    switch (difficulty) {
      case 'easy':
        this.updateCardTotalSignal(10);
        this.timeToSolve = 40;
        break;
      case 'medium':
        this.updateCardTotalSignal(12);
        this.timeToSolve = 60;
        break;
      case 'hard':
        this.updateCardTotalSignal(16);
        this.timeToSolve = 90;
        break;
      case 'mastery':
        this.updateCardTotalSignal(20);
        this.timeToSolve = 120;
        break;
    }
  }

  processPairFlip(index: number, cards: any[]): void {
    if (this.firstFlipIndex === -1) {
      this.firstFlipIndex = index;
    } else {
      this.secondFlipIndex = index;
      if (this.checkMatch(cards)) {
        this.matches++;
        this.updateMatchesSignal(this.matches);
        this.matchMadeSubject.next({firstIndex: this.firstFlipIndex, secondIndex: this.secondFlipIndex});
      } else {
        this.mismatchSubject.next({firstIndex: this.firstFlipIndex, secondIndex: this.secondFlipIndex});
      }
      this.firstFlipIndex = -1;
      this.secondFlipIndex = -1;
    }
  }

  checkMatch(cards: any[]): boolean {
    return (cards[this.firstFlipIndex].icon === cards[this.secondFlipIndex].icon) &&
      (this.firstFlipIndex !== this.secondFlipIndex);
  }

  resetGame(): void {
    this.firstFlipIndex = -1;
    this.secondFlipIndex = -1;
    this.matches = 0;
    this.flips = 0;
    this.updateMatchesSignal(this.matches);
    this.updateFlipsSignal(this.flips);
  }

}
