import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-news',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './news.component.html',
  styleUrl: './news.component.scss'
})
export class NewsComponent {
  constructor(
    public dialogRef: MatDialogRef<NewsComponent>
  ) { }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
