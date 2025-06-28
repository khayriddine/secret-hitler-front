import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  standalone: false,
})
export class LandingComponent {
  username = '';
  lobbyCode = '';

  constructor(private router: Router) {}

  createGame(): void {
    if (this.username.trim()) {
      const newCode = Math.random().toString(36).substring(2, 6).toUpperCase();
      this.router.navigate(['/lobby', newCode], {
        queryParams: { username: this.username },
      });
    }
  }

  joinGame(): void {
    if (this.username.trim() && this.lobbyCode.trim()) {
      this.router.navigate(['/lobby', this.lobbyCode.toUpperCase()], {
        queryParams: { username: this.username },
      });
    }
  }
}
