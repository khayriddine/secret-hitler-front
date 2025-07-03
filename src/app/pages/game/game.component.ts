import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerComponent } from '../../components/player/player.component';
import { Player } from '../../models/player.model';
import {
  ExecutiveAction,
  GamePhase,
  PolicyType,
  Role,
} from '../../models/enums';
import { SignalRService } from '../../core/services/signal-r.service';
import { Game } from '../../models/game.model';
import { VoteModalComponent } from '../../components/vote-modal/vote-modal.component';
import { ActionModalComponent } from '../../components/action-modal/action-modal.component';
import { PolicyModalComponent } from '../../components/policy-modal/policy-modal.component';
@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    CommonModule,
    PlayerComponent,
    VoteModalComponent,
    ActionModalComponent,
    PolicyModalComponent,
  ],
  templateUrl: './game.component.html',
})
export class GameComponent implements OnInit {
  currentUserId: string | null;
  roomId: string | null;
  game: Game | undefined;
  openedPlayerId: number | null = null;
  roleRevealMode = false;
  isVoteModalOpen = false;
  isDrawing = false;
  PolicyType = PolicyType;
  ExecutiveAction = ExecutiveAction;

  policyModalConfig: PolicyModalConfig = {
    visible: false,
    cards: [],
    onSelect: () => {},
    title: '',
    instruction: '',
  };
  specialElectionVisible: boolean = false;
  actionPromptVisible: boolean = false;
  get currentPlayer(): Player {
    return this.game?.players?.find((p) => p.userId === this.currentUserId)!;
  }

  get tableLayout() {
    if (!this.game) return;

    const players = [...this.game.players];
    const currentIndex = players.findIndex(
      (p) => p.userId === this.currentUserId
    );
    if (currentIndex === -1) return;

    const current = players[currentIndex];

    // Step 1: Rotate players so the current player is last
    const rotated = [
      ...players.slice(currentIndex + 1),
      ...players.slice(0, currentIndex),
    ];

    // Step 2: Get layout distribution
    const layout = this.getLayoutDistribution(players.length);

    // Step 3: Slice clockwise in order: right → top → left → bottom-before
    const right = rotated.splice(0, layout.right).reverse();
    const top = rotated.splice(0, layout.top).reverse();
    const left = rotated.splice(0, layout.left);
    const bottomBefore = rotated.splice(0, layout.bottom - 1);

    // Final bottom row (before + current player in middle)
    const mid = Math.floor(bottomBefore.length / 2);
    const bottom = [
      ...bottomBefore.slice(0, mid),
      current,
      ...bottomBefore.slice(mid),
    ];

    return { top, left, right, bottom };
  }

  get liberalBoardImage(): string {
    return 'images/boards/liberal_board.png';
  }

  get fascistBoardImage(): string {
    const count = this.game?.players?.length || 0;

    if (count <= 6) return 'images/boards/fascist_board1.png';
    if (count <= 8) return 'images/boards/fascist_board2.png';
    return 'images/boards/fascist_board3.png';
  }
  infoVisible = false;

  constructor(private signalr: SignalRService) {
    this.currentUserId = this.signalr.getOrCreateUserId();
    this.roomId = sessionStorage.getItem('roomId');
  }
  ngOnInit(): void {
    this.signalr.onGameUpdated((game: Game) => {
      this.game = game;
      this.handleGame(game);
    });

    this.signalr.onUserConnected(() => {
      this.signalr.sendReconnectInfo();
    });

    this.signalr.onGameStarted(() => {
      if (this.roomId) this.signalr.getGameUpdates(this.roomId);
      this.signalr.setAvatar(
        this.roomId!,
        this.currentUserId!,
        sessionStorage.getItem('selectedAvatar')!
      );
    });

    this.signalr.connectionEstablished$.subscribe((b) => {
      if (b === true) {
        if (this.roomId) this.signalr.getGameUpdates(this.roomId);
      }
    });
  }

  createArray(n: number): any[] {
    return new Array(n);
  }

  toggleInfo() {
    this.infoVisible = !this.infoVisible;
  }
  getLayoutDistribution(count: number) {
    switch (count) {
      case 5:
        return { top: 2, left: 1, right: 1, bottom: 1 };
      case 6:
        return { top: 3, left: 1, right: 1, bottom: 1 };
      case 7:
        return { top: 2, left: 1, right: 1, bottom: 3 };
      case 8:
        return { top: 3, left: 1, right: 1, bottom: 3 };
      case 9:
        return { top: 4, left: 1, right: 1, bottom: 3 };
      case 10:
        return { top: 3, left: 2, right: 2, bottom: 3 };
      default:
        const top = Math.min(3, count - 1);
        const sides = Math.floor((count - top - 1) / 2);
        const bottom = count - top - 2 * sides;
        return { top, left: sides, right: sides, bottom };
    }
  }

  togglePlayerInfo(id: number) {
    this.openedPlayerId = this.openedPlayerId === id ? null : id;
  }

  onPlayerClick(playerId: string) {
    const game = this.game;
    const targetPlayer = game?.players.find((p) => p.userId === playerId);
    const youArePresident = this.currentUserId === game?.presidentId;

    if (!game || !targetPlayer || !targetPlayer.isAlive) return;

    // 👉 Self click = toggle role reveal
    if (playerId === this.currentUserId) {
      this.toggleRoleReveal();
      return;
    }

    // 👉 Handle other clicks based on game phase
    switch (game.phase) {
      case GamePhase.Nomination:
        if (
          youArePresident &&
          playerId !== this.currentUserId &&
          playerId !== game.previousChancellorId
        ) {
          this.signalr.nominateChancellor(game.roomId, playerId);
        }
        break;

      case GamePhase.Executive:
        if (!youArePresident) return;

        switch (game.currentExecutiveAction) {
          case ExecutiveAction.Execution:
            this.signalr.executePlayer(game.roomId, playerId);
            break;

          case ExecutiveAction.InvestigateLoyalty:
            this.signalr.investigateLoyalty(game.roomId, playerId);
            break;

          case ExecutiveAction.SpecialElection:
            if (playerId !== this.currentUserId) {
              this.signalr.setSpecialElectionPresident(game.roomId, playerId);
            }
            break;
        }
        break;
    }
  }

  toggleRoleReveal() {
    this.roleRevealMode = !this.roleRevealMode;
  }
  restartGame() {
    this.signalr.startGame(this.roomId || '');
  }
  handleGame(game: Game) {
    switch (game.phase) {
      case GamePhase.Voting:
        if (this.shouldVote(game)) {
          this.showVoteDialog(); // open vote modal
        }
        break;

      case GamePhase.LegislativePresident:
        if (this.isCurrentUserPresident(game)) {
          this.policyModalConfig = {
            visible: true,
            cards: game.presidentHand,
            onSelect: (index) => this.discardCard(index),
            title: 'Draw 3 Policy Cards',
            instruction: 'Select one card to discard:',
          };
        }
        break;

      case GamePhase.LegislativeChancellor:
        if (this.isCurrentUserChancellor(game)) {
          this.policyModalConfig = {
            visible: true,
            cards: game.chancellorHand,
            onSelect: (index) => this.enactPolicy(index),
            title: 'Choose a Policy to Enact',
            instruction: 'Select one card to enact:',
          };
        }
        break;

      case GamePhase.Executive:
        if (this.isCurrentUserPresident(game)) {
          switch (game.currentExecutiveAction) {
            case ExecutiveAction.Execution:
              this.actionPromptVisible = true;
              break;

            case ExecutiveAction.InvestigateLoyalty:
              this.actionPromptVisible = true;
              break;

            case ExecutiveAction.SpecialElection:
              this.actionPromptVisible = true;
              break;
          }
        }
        break;

      // case GamePhase.VetoPending:
      //   if (this.isCurrentUserPresident(game)) {
      //     this.showVetoDecision();
      //   }
      //   break;

      // case GamePhase.GameOver:
      //   this.showWinnerBanner(game.winningTeam);
      //   break;
    }
  }
  shouldVote(game: Game): boolean {
    return (
      !!this.currentUserId &&
      this.currentPlayer.isAlive &&
      game.votes[this.currentUserId] === undefined
    );
  }

  showVoteDialog() {
    // Set some state to open a modal
    this.isVoteModalOpen = true;
  }

  isCurrentUserPresident(game: Game): boolean {
    return game.presidentId === this.currentUserId;
  }

  isCurrentUserChancellor(game: Game): boolean {
    return game.chancellorId === this.currentUserId;
  }

  get presidentName(): string {
    return (
      this.game?.players.find((p) => p.userId === this.game?.presidentId)
        ?.name || 'President'
    );
  }

  get lastPresidentName(): string {
    return (
      this.game?.players.find(
        (p) => p.userId === this.game?.previousPresidentId
      )?.name || 'Last President'
    );
  }

  get chancellorName(): string {
    return (
      this.game?.players.find((p) => p.userId === this.game?.chancellorId)
        ?.name || 'Chancellor'
    );
  }

  get lastChancellorName(): string {
    return (
      this.game?.players.find((p) => p.userId === this.game?.chancellorId)
        ?.name || 'Last Chancellor'
    );
  }

  castVote(vote: boolean) {
    this.signalr.castVote(
      this.game?.roomId || '',
      this.currentUserId || '',
      vote
    );
    this.isVoteModalOpen = false;
  }

  showCardDrawUI() {
    this.isDrawing = true; // Show card draw UI components
  }

  discardCard(index: number) {
    if (!this.game) return;
    const discardedCard = this.game.presidentHand[index];
    // Send to backend
    this.signalr.presidentDiscardsOne(this.game.roomId, discardedCard);
    this.policyModalConfig.visible = false;
  }

  enactPolicy(index: number) {
    if (!this.game) return;
    // Your enact policy logic here...
    this.policyModalConfig.visible = false;
    const chosenCard = this.game.presidentHand[index];
    // Send to backend
    this.signalr.chancellorEnactsPolicy(this.game.roomId, chosenCard);
    this.policyModalConfig.visible = false;
  }

  selectSpecialElectionPresident(player: Player) {
    if (!this.game) return;
    this.specialElectionVisible = false;
    this.signalr.setSpecialElectionPresident(this.game.roomId, player.userId);
  }

  getPhaseName(phase: number): string {
    const phases = [
      'Lobby',
      'President Selection',
      'Chancellor Selection',
      'Voting',
      'Legislative Session',
      'Executive Action',
      'Special Election',
    ];
    return phases[phase] || 'Unknown Phase';
  }

  getExecutiveActionName(action: number): string {
    const actions = [
      '',
      'Investigation',
      'Special Election',
      'Policy Peek',
      'Execution',
    ];
    return actions[action] || '';
  }

  getActionTitle(action: ExecutiveAction): string {
    switch (action) {
      case ExecutiveAction.Execution:
        return 'EXECUTION ORDER';
      case ExecutiveAction.InvestigateLoyalty:
        return 'INVESTIGATE LOYALTY';
      case ExecutiveAction.SpecialElection:
        return 'SPECIAL ELECTION';
      case ExecutiveAction.PolicyPeek:
        return 'POLICY PEEK';
      default:
        return 'PRESIDENTIAL ACTION';
    }
  }

  getActionSubtitle(action: ExecutiveAction): string {
    switch (action) {
      case ExecutiveAction.Execution:
        return 'Eliminate a suspected enemy';
      case ExecutiveAction.InvestigateLoyalty:
        return "Reveal a player's party membership";
      case ExecutiveAction.SpecialElection:
        return 'Appoint the next President';
      case ExecutiveAction.PolicyPeek:
        return 'Examine the top three policies';
      default:
        return '';
    }
  }

  getActionInstruction(action: ExecutiveAction): string {
    switch (action) {
      case ExecutiveAction.Execution:
        return 'Select a player to execute:';
      case ExecutiveAction.InvestigateLoyalty:
        return 'Choose a player to investigate:';
      case ExecutiveAction.SpecialElection:
        return 'Select the next President:';
      case ExecutiveAction.PolicyPeek:
        return 'The next three policies are:';
      default:
        return '';
    }
  }

  needsPlayerSelection(action: ExecutiveAction): boolean {
    return [
      ExecutiveAction.Execution,
      ExecutiveAction.InvestigateLoyalty,
      ExecutiveAction.SpecialElection,
    ].includes(action);
  }

  getTargetPlayers(action: ExecutiveAction): any[] {
    if (!this.game) return [];
    switch (action) {
      case ExecutiveAction.Execution:
        return this.game.alivePlayers.filter(
          (p) => p.userId !== this.currentUserId
        );
      case ExecutiveAction.InvestigateLoyalty:
        return this.game.alivePlayers.filter(
          (p) => p.userId !== this.currentUserId
        );
      case ExecutiveAction.SpecialElection:
        return this.game.alivePlayers.filter(
          (p) => p.userId !== this.currentUserId
        );
      default:
        return [];
    }
  }

  handlePlayerSelection(player: Player) {
    if (!this.game) return;
    switch (this.game.currentExecutiveAction) {
      case ExecutiveAction.Execution:
        this.signalr.executePlayer(this.game.roomId, player.userId);
        break;
      case ExecutiveAction.InvestigateLoyalty:
        this.signalr.investigateLoyalty(this.game.roomId, player.userId);
        break;
      case ExecutiveAction.SpecialElection:
        this.signalr.setSpecialElectionPresident(
          this.game.roomId,
          player.userId
        );
        break;
    }
    this.actionPromptVisible = false;
  }

  cancelAction() {
    this.actionPromptVisible = false;
  }
}

interface PolicyModalConfig {
  visible: boolean;
  cards: PolicyType[];
  onSelect: (index: number) => void;
  title: string;
  instruction: string;
}
