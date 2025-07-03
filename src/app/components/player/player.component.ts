import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Player } from '../../models/player.model';
import { CommonModule } from '@angular/common';
import { Role } from '../../models/enums';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css'],
})
export class PlayerComponent {
  @Input() player!: Player;
  @Input() currentPlayer!: Player;
  @Input() roleRevealMode = false;
  @Input() isCurrentUser = false;
  @Input() isCurrentPresident = false;
  @Input() isCurrentChancellor = false;
  @Input() isPreviousPresident = false;
  @Input() isPreviousChancellor = false;
  @Input() isDead = false;

  @Output() toggle = new EventEmitter<string>();

  get visibleRole(): string | null {
    if (!this.roleRevealMode) return null;

    if (this.player.userId === this.currentPlayer.userId) {
      return this.roleToString(this.player.role);
    }

    if (this.currentPlayer.role === Role.Fascist) {
      // Fascist can see all fascists, hitler and liberals
      return this.roleToString(this.player.role);
    }

    // Liberals and Hitler can't see other roles
    return null;
  }

  getAvatarClasses(): string {
    let classes = 'w-12 h-12 rounded-full border-4 transition-all';

    // Base border color
    if (!this.player.isAlive) {
      classes += ' border-gray-500 opacity-70';
    } else if (this.roleRevealMode && this.visibleRole) {
      classes += ' border-red-500';
    } else {
      classes += ' border-gray-700';
    }

    // Pulsing animation for current president/chancellor
    if (this.isCurrentPresident || this.isCurrentChancellor) {
      classes += ' animate-pulse';
    }

    return classes;
  }
  onClick() {
    this.toggle.emit(this.player.userId);
  }

  public roleToString(role: Role): string {
    switch (role) {
      case Role.Fascist:
        return 'fascist';
      case Role.Hitler:
        return 'hitler';
      case Role.Liberal:
        return 'liberal';
    }
  }
}
