import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-flip-card',
  imports: [MatIconModule, MatCardModule, MatButtonModule, CommonModule],
  templateUrl: './flip-card.component.html',
  styleUrls: ['./flip-card.component.scss']
})
export class FlipCardComponent implements OnInit {

  @Input() icon?: any; // GameIcon (preferred) or legacy string (backward compat if any remain)
  @Input() color: string = '';
  @Input() flipped: boolean = false;
  @Input() matched: boolean = false;
  @Input() displayText?: string;
  @Input() styleRecipe?: string;
  @Input() index?: number;

  constructor() { }

  ngOnInit(): void {
  }

  getLetter(index: number): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return letters[index % letters.length];
  }

  isGameIcon(obj: any): boolean {
    return !!obj && typeof obj === 'object' && 'name' in obj && 'kind' in obj;
  }

  fontSet(): string {
    if (!this.icon) return 'material-icons';
    if (this.isGameIcon(this.icon)) {
      switch (this.icon.kind) {
        case 'sym-outlined': return 'material-symbols-outlined';
        case 'sym-rounded': return 'material-symbols-rounded';
        case 'sym-sharp': return 'material-symbols-sharp';
        case 'mi':
        default:
          return 'material-icons';
      }
    }
    return 'material-icons';
  }

  iconName(): string {
    if (!this.icon) return '';
    return this.isGameIcon(this.icon) ? this.icon.name : this.icon;
  }

}
