import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EndGameDirectives, GameDifficulties, GameModes } from '../../../model/enum/game.enums';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { UserProfile } from '../../../model/interfaces/user/user-profile';
import { LevelDisplayComponent } from "../../level-display/level-display.component";
import { Observable } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-game-status',
  imports: [CommonModule, MatButtonModule, MatIconModule, LevelDisplayComponent],
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
      currentUser?: Observable<UserProfile | null>,
      userLoading?: Observable<boolean>,
      userPostGameBreakdowns?: Observable<string[]>
    },
    public dialogRef: MatDialogRef<GameStatusComponent>
  ) {}

  playAgain(): void {
    this.dialogRef.close(EndGameDirectives.PLAY_AGAIN);
  }

  mainMenu(): void {
    this.dialogRef.close(EndGameDirectives.MAIN_MENU);
  }

  viewBoard(): void {
    console.log("VIEW_BOARD from game status");
    this.dialogRef.close(EndGameDirectives.VIEW_BOARD);
  }

  signIn(): void {
    console.log("SIGN_IN from game status");
    this.dialogRef.close(EndGameDirectives.SIGN_IN);
  }

}
