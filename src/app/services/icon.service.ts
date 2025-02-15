import { Injectable } from '@angular/core';
import { FOOD_MAT_ICONS, HOME_MAT_ICONS, NATURE_MAT_ICONS, RANDOM_MAT_ICONS, SPORTS_MAT_ICONS } from '../model/constants/icons.lists';

@Injectable({
  providedIn: 'root'
})
export class IconService {

  private cycleIndex: number = 0;

  private foodIcons: string[] = FOOD_MAT_ICONS;
  private homeIcons: string[] = HOME_MAT_ICONS;
  private sportsIcons: string[] = SPORTS_MAT_ICONS;
  private natureIcons: string[] = NATURE_MAT_ICONS;
  private randomIcons: string[] = RANDOM_MAT_ICONS;

  private masterList: string[][] = [];

  constructor() {
    this.masterList = [this.foodIcons, this.homeIcons, this.sportsIcons, this.natureIcons, this.randomIcons];
    this.cycleIndex = Math.floor(Math.random() * this.masterList.length);
  }

  getIconListAndCycle(count: number): string[] {
    console.log("Index: " + this.cycleIndex);
    let list = this.masterList[this.cycleIndex];
    const shuffled = list.sort(() => 0.5 - Math.random());
    this.cycleIndex = (this.cycleIndex + 1) % this.masterList.length;
    return shuffled.slice(0, count);
  }
}
