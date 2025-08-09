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

  @Input() icon?: string;
  @Input() color: string = '';
  @Input() flipped: boolean = false;
  @Input() matched: boolean = false;
  @Input() displayText?: string;
  @Input() index?: number;

  constructor() { }

  ngOnInit(): void {
  }

}
