import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { GameService } from '../../services/core/game.service';
import { AnalyticsService } from '../../services/analytics.service';
import { HowToComponent } from '../../components/dialogs/how-to/how-to.component';
import { GameModes, GameDifficulties } from '../../model/enum/game.enums';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserProfile } from '../../model/interfaces/user/user-profile';
import { UserService } from '../../services/user/user.service';
import { DrawerService } from '../../services/drawer.service';
import { LevelDisplayComponent } from '../../components/level-display/level-display.component';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, FormsModule, MatButtonModule, MatCardModule, MatDialogModule, MatFormFieldModule,
    MatIconModule, MatSelectModule, MatToolbarModule, LevelDisplayComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {

  currentUser$: Observable<UserProfile | null>;

  // form values
  selectedMode: string = '';
  selectedDifficulty: string = '';

  // element references
  dialogRef: any;

  constructor(
    private gameService: GameService,
    private analyticsService: AnalyticsService,
    private userService: UserService,
    private dialog: MatDialog,
    private router: Router,
    private drawerService: DrawerService
  ) {
    this.currentUser$ = this.userService.user$;
  }

  startGame() {
    // set game settings to default if not set by player
    this.selectedMode = this.selectedMode == '' ? GameModes.PAIRS : this.selectedMode;
    this.selectedDifficulty = this.selectedDifficulty == '' ? GameDifficulties.MEDIUM : this.selectedDifficulty;
    // update game service to match desired game settings
    this.gameService.setSelectedMode(this.selectedMode as GameModes);
    this.gameService.setDifficulty(this.selectedDifficulty as GameDifficulties);
    // setup the game with settings
    this.gameService.setGameSettings(this.gameService.getSelectedMode(), this.gameService.getDifficulty());
    // mark configuration done for this runtime
    this.gameService.setConfigured(true);
    // track game start event with selected settings
    this.analyticsService.trackGameModeStart(this.gameService.getSelectedMode(), { difficulty: this.selectedDifficulty as GameDifficulties });
    // route to the selected game
    this.router.navigate([this.gameService.getSelectedMode()]);
  }

  howToClicked() {
    this.dialogRef = this.dialog.open(HowToComponent, {
      height: 'auto',
      maxHeight: '90vh',
      width: '90%',
      maxWidth: '700px',
      disableClose: false,
    });
    this.analyticsService.howToPlayEvent();
  }

  handleGoogleSignIn(googleUser: any) {
    const profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId());
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail());
  }

  openDrawer(): void { this.drawerService.requestOpen(); }

}
