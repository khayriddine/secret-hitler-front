import { inject, Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { API_URL } from '../../app.config';
import { Player } from '../../models/player.model';
import { Room } from '../../models/Room.model';
import { Game } from '../../models/game.model';
import { BehaviorSubject } from 'rxjs';
import { PolicyType } from '../../models/enums';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection: signalR.HubConnection;
  private apiUrl = inject(API_URL);
  private readonly USER_ID_KEY = 'signalr_user_id';
  public userId = this.getOrCreateUserId();
  private connectionEstablished = new BehaviorSubject(false);
  public connectionEstablished$ = this.connectionEstablished.asObservable();

  constructor() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.apiUrl + '/gamehub')
      .withAutomaticReconnect()
      .build();

    this.startConnection();
  }

  public getOrCreateUserId(): string {
    let userId = sessionStorage.getItem(this.USER_ID_KEY);
    if (!userId) {
      userId = crypto.randomUUID(); // or generate a GUID
      sessionStorage.setItem(this.USER_ID_KEY, userId);
    }
    return userId;
  }

  startConnection() {
    return this.hubConnection.start().then(() => {
      this.connectionEstablished.next(true);
      const userId = this.userId;
      this.hubConnection.invoke('ConnectUser', userId);
    });
  }

  createRoom(roomId: string, playerName: string) {
    return this.hubConnection.invoke(
      'CreateRoom',
      roomId,
      this.userId,
      playerName
    );
  }

  joinRoom(roomId: string, playerName: string) {
    return this.hubConnection.invoke(
      'JoinRoom',
      roomId,
      this.userId,
      playerName
    );
  }

  leaveRoom(roomId: string) {
    return this.hubConnection.invoke('LeaveRoom', roomId, this.userId);
  }

  kickFromRoom(roomId: string, userId: string) {
    return this.hubConnection.invoke('KickFromRoom', roomId, userId);
  }

  getRoomUpdates(roomId: string) {
    return this.hubConnection.invoke('GetRoomUpdates', roomId);
  }

  sendReconnectInfo() {
    const roomId = sessionStorage.getItem('roomId');
    const userId = this.getOrCreateUserId();
    if (roomId && userId) {
      this.hubConnection.invoke('ReconnectPlayer', roomId, userId);
    }
  }

  onRoomUpdated(callback: (room: Room) => void) {
    this.hubConnection.on('RoomUpdated', callback);
  }

  onUserConnected(callback: () => void) {
    this.hubConnection.on('UserConnected', callback);
  }

  onUserDisconnected(callback: (userId: string) => void) {
    this.hubConnection.on('UserDisconnected', callback);
  }

  startGame(roomId: string) {
    this.hubConnection.invoke('StartGame', roomId);
  }

  getGameUpdates(roomId: string) {
    return this.hubConnection.invoke('GetGameUpdates', roomId);
  }

  public nominateChancellor(roomId: string, nomineeId: string) {
    return this.hubConnection.invoke('NominateChancellor', roomId, nomineeId);
  }

  public castVote(roomId: string, playerId: string, vote: boolean) {
    return this.hubConnection.invoke('CastVote', roomId, playerId, vote);
  }

  public presidentDiscardsOne(roomId: string, discarded: PolicyType) {
    return this.hubConnection.invoke('PresidentDiscardsOne', roomId, discarded);
  }

  public chancellorEnactsPolicy(roomId: string, policy: PolicyType) {
    return this.hubConnection.invoke('ChancellorEnactsPolicy', roomId, policy);
  }

  public executePlayer(roomId: string, targetUserId: string) {
    return this.hubConnection.invoke('ExecutePlayer', roomId, targetUserId);
  }

  public investigateLoyalty(roomId: string, targetUserId: string) {
    return this.hubConnection.invoke(
      'InvestigateLoyalty',
      roomId,
      targetUserId
    );
  }

  public setSpecialElectionPresident(roomId: string, chosenUserId: string) {
    return this.hubConnection.invoke(
      'SetSpecialElectionPresident',
      roomId,
      chosenUserId
    );
  }

  public completeExecutiveAction(roomId: string) {
    return this.hubConnection.invoke('CompleteExcutionAction', roomId);
  }
  public proposeVeto(roomId: string) {
    return this.hubConnection.invoke('ProposeVeto', roomId);
  }

  public handleVetoResponse(roomId: string, approved: boolean) {
    return this.hubConnection.invoke('HandleVetoResponse', roomId, approved);
  }

  // 🔁 Game Listener registration

  onGameStarted(callback: () => void) {
    this.hubConnection.on('GameStarted', callback);
  }

  onGameUpdated(callback: (game: Game) => void) {
    this.hubConnection.on('GameUpdated', callback);
  }
  onGameOver(callback: (game: Game) => void) {
    this.hubConnection.on('GameOver', callback);
  }
}
