import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-rep-counter-sheet',
  standalone: true,
  templateUrl: './rep-counter-sheet.component.html',
  styleUrl: './rep-counter-sheet.component.scss',
})
export class RepCounterSheetComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) detail!: string;
  @Input({ required: true }) total!: number;
  @Input({ required: true }) count!: number;

  @Output() increment = new EventEmitter<void>();
  @Output() undo = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  get isComplete(): boolean {
    return this.count >= this.total;
  }
}
