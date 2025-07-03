import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-policy-modal',
  imports: [CommonModule],
  templateUrl: './policy-modal.component.html',
  styleUrl: './policy-modal.component.css',
})
export class PolicyModalComponent {
  @Input() visible = false;
  @Input() cards: string[] = [];
  @Input() title = '';
  @Input() instruction = '';
  @Input() onSelect: (index: number) => void = () => {};

  selectCard(index: number) {
    if (this.onSelect) {
      this.onSelect(index);
    }
  }
}
