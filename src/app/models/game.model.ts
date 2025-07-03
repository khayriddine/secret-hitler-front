import { ExecutiveAction, GamePhase, PolicyType } from './enums';
import { Player } from './player.model';

export interface Game {
  roomId: string;
  players: Player[];
  alivePlayers: Player[];
  drawPile: PolicyType[];
  discardPile: PolicyType[];

  enactedFascistPolicies: number;
  enactedLiberalPolicies: number;

  presidentId: string;
  chancellorId: string;
  previousPresidentId: string;
  previousChancellorId: string;

  phase: GamePhase;
  electionTracker: number;
  isStarted: boolean;
  isGameOver: boolean;
  winningTeam?: string;

  votes: Record<string, boolean>;
  presidentHand: PolicyType[];
  chancellorHand: PolicyType[];

  currentExecutiveAction?: ExecutiveAction;
  vetoProposed: boolean;
}
