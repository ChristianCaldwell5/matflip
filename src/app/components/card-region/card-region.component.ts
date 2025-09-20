import { Component, EventEmitter, Input, Output } from '@angular/core';
import { card } from '../../model/interfaces/card';
import { FlipCardComponent } from '../flip-card/flip-card.component';

@Component({
  selector: 'app-card-region',
  imports: [FlipCardComponent],
  templateUrl: './card-region.component.html',
  styleUrl: './card-region.component.scss'
})
export class CardRegionComponent {

  @Input() cards: card[] = [];
  @Input() disableFlip: boolean = false;

  @Output() cardFlipped = new EventEmitter<number>();

  flipCard(index: number) {
    this.cardFlipped.emit(index);
  }

}
