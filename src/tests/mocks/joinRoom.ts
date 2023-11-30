import { JoinRoom } from "../../types/JoinRoom";
import { mockRoom } from "./room";

import { mockPlayer, mockPlayer2 } from "./player";

export const joinRoom: JoinRoom = {
  roomName: mockRoom.name,
  player: mockPlayer,
};

export const joinRoom2: JoinRoom = {
  roomName: mockRoom.name,
  player: mockPlayer2,
};
