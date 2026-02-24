import { Component, Input, OnInit } from '@angular/core';
import { LevelInfo } from '../../model/interfaces/user/level-info';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-level-display',
  imports: [CommonModule, MatProgressBarModule, MatIconModule],
  templateUrl: './level-display.component.html',
  styleUrls: ['./level-display.component.scss']
})
export class LevelDisplayComponent implements OnInit {

  xpProgressPercentage: number | null = null;
  private _levelInfo: LevelInfo | undefined = undefined;

  @Input()
  set levelInfo(value: LevelInfo | undefined) {
    this._levelInfo = value;
    if (value) {
      this.xpProgressPercentage = (value.currentXp / value.xpToNextLevel) * 100;
    } else {
      this.xpProgressPercentage = null;
    }
  }
  get levelInfo(): LevelInfo | undefined {
    return this._levelInfo;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
