import { Role } from './enums';

export interface Player {
  userId: string;
  name: string;
  role: Role;
  isAlive: boolean;
  isConnected: boolean;
  isPresident: boolean;
  isChancellor: boolean;
  avatar: string;
}
