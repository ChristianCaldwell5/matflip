import { Injectable } from '@angular/core';
import { FOOD_MAT_ICONS, HOME_MAT_ICONS, NATURE_MAT_ICONS, RANDOM_MAT_ICONS, RANDOM_MAT_ICONS_2, RANDOM_MAT_ICONS_3, SPORTS_MAT_ICONS, FUNZIES_MAT_SYM, RANDOM_MAT_SYM_1, RANDOM_MAT_SYM_2 } from '../model/constants/icons.lists';
import { GameIcon } from '../model/interfaces/game-icon';

@Injectable({
  providedIn: 'root'
})
export class IconService {
  private cycleIndex: number = 0;

  // Raw material icon name arrays (classic Material Icons set)
  private foodIcons: string[] = FOOD_MAT_ICONS;
  private homeIcons: string[] = HOME_MAT_ICONS;
  private sportsIcons: string[] = SPORTS_MAT_ICONS;
  private natureIcons: string[] = NATURE_MAT_ICONS;
  private randomIcons: string[] = RANDOM_MAT_ICONS;
  private randomIcons2: string[] = RANDOM_MAT_ICONS_2;
  private randomIcons3: string[] = RANDOM_MAT_ICONS_3;
  private funziesSymbols: GameIcon[] = FUNZIES_MAT_SYM;
  private randomSymbols1: GameIcon[] = RANDOM_MAT_SYM_1;
  private randomSymbols2: GameIcon[] = RANDOM_MAT_SYM_2;

  // Master list now stores arrays of GameIcon objects.
  private masterList: GameIcon[][] = [];

  constructor() {
    // Wrap classic Material Icons into GameIcon objects (kind = 'mi')
    const wrap = (arr: string[]): GameIcon[] => arr.map(name => ({ name, kind: 'mi' }));
    this.masterList = [
      wrap(this.foodIcons),
      wrap(this.homeIcons),
      wrap(this.sportsIcons),
      wrap(this.natureIcons),
      wrap(this.randomIcons),
      wrap(this.randomIcons2),
      wrap(this.randomIcons3),
      this.funziesSymbols,
      this.randomSymbols1,
      this.randomSymbols2
    ];
    this.cycleIndex = Math.floor(Math.random() * this.masterList.length);
  }

  // Shuffle an array using the Fisher-Yates algorithm
  private shuffleArray(array: GameIcon[]): GameIcon[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  getIconListAndCycle(count: number): GameIcon[] {
    const list = this.masterList[this.cycleIndex];
    // Create a shallow copy before shuffling to avoid reordering source arrays permanently.
    const shuffled = this.shuffleArray([...list]);
    this.cycleIndex = (this.cycleIndex + 1) % this.masterList.length;
    return shuffled.slice(0, count);
  }
}
