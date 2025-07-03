import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SignalRService } from '../../core/services/signal-r.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  imports: [FormsModule, CommonModule],
})
export class LandingComponent implements OnInit {
  username = '';
  roomId = '';
  isLoading = true;

  constructor(private router: Router, private signalr: SignalRService) {}

  ngOnInit() {
    this.signalr.connectionEstablished$.subscribe((b) => (this.isLoading = b));

    // Load from session storage
    const savedAvatar = sessionStorage.getItem('selectedAvatar');
    const savedName = sessionStorage.getItem('username');

    if (savedAvatar) {
      this.selectedAvatarIndex = this.avatars.indexOf(savedAvatar);
    }

    if (savedName) {
      this.username = savedName;
    }
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

  avatars = [
    '/images/avatars/1d53efdf-f3d9-4a26-909f-b8325e189ca5.jpg',
    '/images/avatars/1dc4d246-977e-4672-8d7b-710392f1e023.jpg',
    '/images/avatars/2cc69406-59b3-4506-b1a0-721ef998d11f.jpg',
    '/images/avatars/5fbbbe9a-d09a-4e86-95ce-345a9f77b1eb.jpg',
    '/images/avatars/11b8cfc4-faa6-4720-8cc2-41eeff2aefca.jpg',
    '/images/avatars/47d08447-1720-4fb-e-a42d-cf608f7ea9cb.jpg',
    '/images/avatars/48dfa81a-39da-4f9b-bc1d-ceaa01e27846.jpg',
    '/images/avatars/59e46fff-b025-4ff8-94f8-fa38b0f95697.jpg',
    '/images/avatars/70cac38d-a190-43ff-b5aa-d774fca50173.jpg',
    '/images/avatars/89ae1c80-202b-405d-a0e3-429f22c8b9c3.jpg',
    '/images/avatars/1185a039-aea1-4392-a2b5-68aec2e69b00.jpg',
    '/images/avatars/2038d24a-79e1-49ca-ab8c-2cb17b1a5cea.jpg',
    '/images/avatars/41430a20-b189-46e8-8e9c-9778d747113a.jpg',
    '/images/avatars/52811b36-e8f0-4498-bcce-9b1d5e1abe62.jpg',
    '/images/avatars/a624ae5d-2eda-4c17-a214-0353f77c3a84.jpg',
    '/images/avatars/c6253e61-c696-4119-ba3a-4b0ffb1f8a16.jpg',
    '/images/avatars/c3596879-e8be-4d65-b01a-dc440bcfe888.jpg',
    '/images/avatars/da77cc23-13c2-4605-8cba-149f80b3801b.jpg',
    '/images/avatars/e07b3762-c577-4a3e-b938-b4d901c2f3e3.jpg',
    '/images/avatars/f5ee8bd7-6ec9-42cc-a873-fee17b81a0e2.jpg',
  ];

  selectedAvatarIndex = 0;

  selectAvatar(index: number) {
    this.selectedAvatarIndex = index;
    sessionStorage.setItem('selectedAvatar', this.avatars[index]);
  }

  scrollCarousel(direction: number) {
    const container = document.querySelector('.flex.overflow-x-auto');
    if (container) {
      container.scrollBy({ left: 100 * direction, behavior: 'smooth' });
    }
  }
}
