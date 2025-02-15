import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GameDifficulties } from '../../../model/enum/game.enums';
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
      difficulty: GameDifficulties,
      totalTime?: number,
      timeRemaining?: number,
      pairsFound?: number,
      totalPairs?: number,
      flipCount?: number,
      streak?: number
    },
    public dialogRef: MatDialogRef<GameStatusComponent>
  ) { }

  ngOnInit(): void {
  }

  playAgain(): void {
    this.dialogRef.close(true);
  }

  mainMenu(): void {
    this.dialogRef.close(false);
  }

}
