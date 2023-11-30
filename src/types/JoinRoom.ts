import { Player } from "./Player";

export interface JoinRoom {
  roomName: string;
  player: Player;
}

export interface LeaveRoom {
  roomName: string;
  id: string;
}
