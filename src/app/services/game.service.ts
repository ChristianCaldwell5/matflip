import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { signal, Signal } from '@angular/core';
import { FlipsReference } from '../model/interfaces/flipsReference';
import { GameDifficulties, GameModes } from '../model/enum/game.enums';
import { MathService } from './math.service';
import { MathProblem } from '../model/interfaces/mathProblem';
import { card } from '../model/interfaces/card';

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
  private solutionFoundSubject = new Subject<number>();
  private wrongSolutionSubject = new Subject<number>();

  // signals for game information
  private gameStartedSignal = signal(false);
  private cardTotalSignal = signal(8);
  private flipsSignal = signal(0);
  private matchesSignal = signal(0);
  private solvesSignal = signal(0);
  private currentStreakSignal = signal(0);
  private bestStreakSignal = signal(0);
  private failsLeftSignal = signal(0);
  // transient flag set when menu applies configuration; used by route guards
  private configured = false;
  

  constructor(
    private mathService: MathService,
  ) { 
  }

  // indicate if the user has configured the game via menu in this runtime
  isConfigured(): boolean {
    return this.configured;
  }

  setConfigured(value: boolean): void {
    this.configured = value;
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

  // get solves signal
  getSolvesSignal(): Signal<number> {
    return this.solvesSignal;
  }

  // update solves signal
  updateSolvesSignal(solves: number): void {
    this.solvesSignal.set(solves);
  }

  getCurrentStreakSignal(): Signal<number> {
    return this.currentStreakSignal;
  }

  updateCurrentStreakSignal(currentStreak: number): void {
    this.currentStreakSignal.set(currentStreak);
  }

  getBestStreakSignal(): Signal<number> {
    return this.bestStreakSignal;
  }

  updateBestStreakSignal(bestStreak: number): void {
    this.bestStreakSignal.set(bestStreak);
  }

  getFailsLeftSignal(): Signal<number> {
    return this.failsLeftSignal;
  }

  updateFailsLeftSignal(fails: number): void {
    this.failsLeftSignal.set(fails);
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

  getSolutionFoundObservable(): Observable<number> {
    return this.solutionFoundSubject.asObservable();
  }

  getWrongSolutionObservable(): Observable<number> {
    return this.wrongSolutionSubject.asObservable();
  }

  incrementFlips(): void {
    this.flips++;
    this.flipsSignal.set(this.flips);
  }

  decrementFails(): void {
    this.updateFailsLeftSignal(this.failsLeftSignal() - 1);
  }

  setGameSettings(mode: GameModes, difficulty: GameDifficulties): void {
    switch (mode) {
      case GameModes.PAIRS:
        this.setPairGameSettings(difficulty);
        break;
      case GameModes.SOLUTION:
        this.setSolutionGameSettings(difficulty);
        break;
      default:
        this.setPairGameSettings(difficulty);
    }
  }

  private setPairGameSettings(difficulty: GameDifficulties): void {
    this.updateFailsLeftSignal(0);
    switch (difficulty) {
      case 'easy':
        this.updateCardTotalSignal(10);
        this.timeToSolve = 30;
        break;
      case 'medium':
        this.updateCardTotalSignal(12);
        this.timeToSolve = 40;
        break;
      case 'hard':
        this.updateCardTotalSignal(16);
        this.timeToSolve = 50;
        break;
      case 'expert':
        this.updateCardTotalSignal(20);
        this.timeToSolve = 60;
        break;
      case 'master':
        this.updateCardTotalSignal(24);
        this.timeToSolve = 60;
        break;
    }
  }

  private setSolutionGameSettings(difficulty: GameDifficulties): void {
    switch (difficulty) {
      case 'easy':
        this.updateCardTotalSignal(3);
        this.updateFailsLeftSignal(4);
        this.timeToSolve = 20;
        break;
      case 'medium':
        this.updateCardTotalSignal(4);
        this.updateFailsLeftSignal(4);
        this.timeToSolve = 20;
        break;
      case 'hard':
        this.updateCardTotalSignal(4);
        this.updateFailsLeftSignal(3);
        this.timeToSolve = 15;
        break;
      case 'expert':
        this.updateCardTotalSignal(5);
        this.updateFailsLeftSignal(3);
        this.timeToSolve = 10;
        break;
    }
  }

  processPairFlip(index: number, cards: any[]): void {
    if (this.firstFlipIndex === -1) {
      this.firstFlipIndex = index;
      console.log('First flip index set to:', this.firstFlipIndex);
    } else {
      this.secondFlipIndex = index;
      console.log('Second flip index set to:', this.secondFlipIndex);
      if (this.checkMatch(cards)) {
        console.log('Match found!');
        this.matches++;
        this.updateMatchesSignal(this.matches);
        this.matchMadeSubject.next({firstIndex: this.firstFlipIndex, secondIndex: this.secondFlipIndex});
      } else {
        console.log('No match.', this.firstFlipIndex, this.secondFlipIndex);
        this.mismatchSubject.next({firstIndex: this.firstFlipIndex, secondIndex: this.secondFlipIndex});
      }
      this.firstFlipIndex = -1;
      this.secondFlipIndex = -1;
    }
  }

  processSolutionFlip(index: number, cards: card[], problem: MathProblem): void {
    if (Number(cards[index]!.displayText) === problem.solution) {
      this.matches++;
      this.updateMatchesSignal(this.matches);
      this.solutionFoundSubject.next(index);
    } else {
      this.wrongSolutionSubject.next(index);
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
    this.updateFailsLeftSignal(0);
    this.updateSolvesSignal(0);
    this.updateCurrentStreakSignal(0);
    this.updateBestStreakSignal(0);
  }

  resetPairsGame(): void {
    this.firstFlipIndex = -1;
    this.secondFlipIndex = -1;
    this.matches = 0;
    this.flips = 0;
    this.updateMatchesSignal(this.matches);
    this.updateFlipsSignal(this.flips);
  }

  resetSolutionGame(): void {
    this.updateFailsLeftSignal(0);
    this.updateSolvesSignal(0);
    this.updateCurrentStreakSignal(0);
    this.updateBestStreakSignal(0);
  }
}
