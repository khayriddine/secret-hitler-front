import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SignalRService } from '../../core/services/signal-r.service';
@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  imports: [FormsModule],
})
export class LandingComponent implements OnInit {
  username = '';
  roomId = '';
  isLoading = true;

  constructor(private router: Router, private signalr: SignalRService) {}
  ngOnInit(): void {
    this.signalr.connectionEstablished$.subscribe((b) => (this.isLoading = b));
  }

  createGame(): void {
    if (this.username.trim()) {
      const newCode = Math.random().toString(36).substring(2, 6).toUpperCase();
      sessionStorage.setItem('roomId', newCode);
      sessionStorage.setItem('playerName', this.username);
      this.signalr.createRoom(newCode, this.username);
      this.router.navigate(['/lobby', newCode], {
        queryParams: { username: this.username },
      });
    }
  }

  joinGame(): void {
    if (this.username.trim() && this.roomId.trim()) {
      sessionStorage.setItem('roomId', this.roomId);
      sessionStorage.setItem('playerName', this.username);
      this.signalr.joinRoom(this.roomId, this.username);
      this.router.navigate(['/lobby', this.roomId.toUpperCase()], {
        queryParams: { username: this.username },
      });
    }
  }
}
