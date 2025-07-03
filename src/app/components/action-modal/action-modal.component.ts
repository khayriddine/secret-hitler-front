import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-action-modal',
  imports: [CommonModule],
  templateUrl: './action-modal.component.html',
  styleUrl: './action-modal.component.css',
})
export class ActionModalComponent {
  @Input() action: any;
  @Input() players: any[] = [];
  @Input() currentPlayerId: string = '';
  @Output() closeModal = new EventEmitter<void>();
}
