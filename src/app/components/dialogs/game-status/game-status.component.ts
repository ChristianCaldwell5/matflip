import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GameDifficulties, GameModes } from '../../../model/enum/game.enums';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-game-status',
  imports: [CommonModule, MatButtonModule],
  templateUrl: './game-status.component.html',
  styleUrls: ['./game-status.component.scss']
})
export class GameStatusComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      success: boolean,
      mode: GameModes,
      difficulty: GameDifficulties,
      totalTime?: number,
      timeRemaining?: number,
      pairsFound?: number,
      totalPairs?: number,
      flipCount?: number
      solveCount?: number,
      bestStreak?: number,
    },
    public dialogRef: MatDialogRef<GameStatusComponent>
  ) { }

  ngOnInit(): void {
    console.log('GameStatusComponent initialized with data:', this.data);
  }

  playAgain(): void {
    this.dialogRef.close(true);
  }

  mainMenu(): void {
    this.dialogRef.close(false);
  }

}
