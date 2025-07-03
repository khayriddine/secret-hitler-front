import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SignalRService } from '../../core/services/signal-r.service';
import { RoomMember } from '../../models/member.model';
import { Room } from '../../models/Room.model';

@Component({
  selector: 'app-lobby',
  imports: [CommonModule],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.css',
})
export class LobbyComponent implements OnInit {
  roomId = '';
  room: Room | undefined = undefined;
  currentUsername = '';
  isLoading = true;
  disconnectedPlayers: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private signalr: SignalRService
  ) {
    this.roomId = this.route.snapshot.paramMap.get('code') || '';
    this.currentUsername =
      this.route.snapshot.queryParamMap.get('username') || '';
  }

  get isHost(): boolean {
    return this.currentUsername == this.room?.createdBy;
  }
  ngOnInit(): void {
    //on new friend join add him
    this.signalr.onRoomUpdated((room: Room) => {
      console.log(room);
      this.room = room;
    });
    this.signalr.onUserConnected(() => {
      this.signalr.sendReconnectInfo();
    });
    this.signalr.onUserDisconnected((userId: string) => {
      this.disconnectedPlayers.push(userId);
    });

    this.signalr.onGameStarted(() =>
      this.router.navigate(['/game', this.roomId])
    );
    this.signalr.connectionEstablished$.subscribe((b) => {
      console.log(b);
      if (b === true) {
        //get list friends
        this.signalr.getRoomUpdates(this.roomId);
      }
    });
  }

  startGame(): void {
    console.log('Game Started');
    this.signalr.startGame(this.roomId);
  }

  leaveLobby(): void {
    this.signalr.leaveRoom(this.roomId);
    this.router.navigate(['/']);
  }

  copyCode(): void {
    navigator.clipboard.writeText(this.roomId);
  }

  kickFromRoom(member: RoomMember): void {
    this.signalr.kickFromRoom(this.roomId, member.userId);
  }

  get actionsList(): string[] {
    const count = this.room?.members?.length || 0;
    if (count < 5) return [];

    const base = ['Nominate Chancellor', 'Vote Government', 'Enact Policy'];

    if (count >= 7) base.push('Policy Peek', 'Execution');
    else if (count >= 5) base.push('Investigate Loyalty');

    return base;
  }
}
