import { RoomMember } from './member.model';

export interface Room {
  members: RoomMember[];
  roomId: string;
  createdBy: string;
  fascists: number;
  liberals: number;
  status: string;
}
