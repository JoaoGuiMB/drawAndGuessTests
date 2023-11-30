import { Server, Socket } from "socket.io";
import {
  createRoom,
  getRooms,
  joinRoom,
  playerLeaveRoom,
  playerGuess,
  playerDraw,
  startTurn,
} from "../controllers/room.controller";

export function handleSocketEvents(io: Server, socket: Socket) {
  const socketsEvents: Record<string, (data: any) => void> = {
    "create-room": (data) => createRoom(socket, data),
    "get-rooms": () => getRooms(socket),
    "join-room": (data) => joinRoom(io, socket, data),
    "player-leave-room": () => playerLeaveRoom(socket),
    "player-guess": (data) => playerGuess(data, socket, io),
    "player-draw": (data) => playerDraw(data, io),
    "start-turn": (data) => startTurn(data, io),
    disconnect: () => {
      console.log("user disconnected");
      playerLeaveRoom(socket);
      socket.disconnect();
    },
  };

  for (const event in socketsEvents) {
    socket.on(event, socketsEvents[event]);
  }
}

export function handleSocketEventsExample(io: Server, socket: Socket) {
  const socketsEvents: Record<string, (data: any) => void> = {
    "multiply-by-2": (data) => {
      const result = data * 2;
      socket.emit("multiplied-by-2", result);
    },
  };
  for (const event in socketsEvents) {
    socket.on(event, socketsEvents[event]);
  }
}
