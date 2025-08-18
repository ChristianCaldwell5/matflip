import { CommonModule } from '@angular/common';
import { Component, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-quite-game',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './quite-game.component.html',
  styleUrl: './quite-game.component.scss'
})
export class QuiteGameComponent {

  @Output() confirmQuit = new Subject<void>();
  
  constructor(
    public dialogRef: MatDialogRef<QuiteGameComponent>
  ) { }

  confirmQuitClicked(): void {
    this.confirmQuit.next();
    this.dialogRef.close();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
