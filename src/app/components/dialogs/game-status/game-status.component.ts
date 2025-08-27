import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EndGameDirectives, GameDifficulties, GameModes } from '../../../model/enum/game.enums';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-game-status',
  imports: [CommonModule, MatButtonModule],
  templateUrl: './game-status.component.html',
  styleUrls: ['./game-status.component.scss']
})
export class GameStatusComponent {

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

  playAgain(): void {
    this.dialogRef.close(EndGameDirectives.PLAY_AGAIN);
  }

  mainMenu(): void {
    this.dialogRef.close(EndGameDirectives.MAIN_MENU);
  }

  viewBoard(): void {
    this.dialogRef.close(EndGameDirectives.VIEW_BOARD);
  }

}
