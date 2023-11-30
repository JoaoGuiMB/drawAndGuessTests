import { Socket, Server } from "socket.io";
import { Guess, Room } from "../types/Room";
import {
  pushRoom,
  getAllRooms,
  addPlayerToRoom,
  removePlayer,
  playerMakeGuess,
  playerMakeDraw,
  startNewTurn,
  drecreaseTimer,
  isCurrentPlayerStillInRoom,
  hasPlayerWonTheGame,
  resetPlayersPoints,
} from "../useCases/room.case";
import { createRoomSchema } from "../validations/room/createRoom";

import { z } from "zod";
import CustomError from "../utils/CustomError";
import { JoinRoom } from "../types/JoinRoom";
import { PlayerDraw } from "../types/Draw";
import { roomConfig } from "../utils/roomConfig";

export function createRoom(socket: Socket, room: Room) {
  try {
    createRoomSchema.parse(room);

    pushRoom(room);
    socket.join(room.name);
    socket.emit("room-created", {
      message: "The room was created successfully",
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      const message = JSON.parse(e.message)[0].message;
      socket.emit("invalid-data", {
        message,
      });
    } else if (e instanceof CustomError) {
      socket.emit("create-room-error", {
        message: e.message,
      });
    }
  }
}

export function getRooms(socket: Socket) {
  const rooms = getAllRooms();
  socket.emit("rooms", rooms);
}

export function joinRoom(io: Server, socket: Socket, joinRoomData: JoinRoom) {
  try {
    const { roomName, player } = joinRoomData;
    player.id = socket.id;
    const joinedRoom = addPlayerToRoom(roomName, player);
    socket.join(roomName);

    socket.emit("player-joined-room", {
      playerId: socket.id,
      room: joinedRoom,
    });
    // before it was socket.to
    io.to(roomName).emit("update-players", joinedRoom.players);
  } catch (e) {
    if (e instanceof CustomError) {
      socket.emit("join-room-error", {
        message: e.message,
      });
    }
  }
}

export function playerLeaveRoom(socket: Socket) {
  try {
    const room = removePlayer(socket.id);
    socket.leave(room.name);
    socket.emit("player-left-room", {
      message: "You left the room successfully",
    });
    socket.to(room.name).emit("update-players", room.players);
    getAllRooms();
    socket.leave(room.name);
  } catch (e) {
    if (e instanceof CustomError) {
      socket.emit("player-leave-room-error", {
        message: e.message,
      });
    }
  }
}

export function playerGuess(data: Guess, socket: Socket, io: Server) {
  const { playerGuessRightId, room } = playerMakeGuess(data);
  io.to(data.roomName).emit("update-chat", room.chat);
  if (playerGuessRightId) {
    io.to(playerGuessRightId).emit("player-guessed-right");
  }
  io.to(data.roomName).emit("update-players", room.players);
}

export function playerDraw(data: PlayerDraw, io: Server) {
  const canvas = playerMakeDraw(data);

  io.to(data.roomName).emit("update-canvas-state", canvas);
}

export function startTurn(roomName: string, io: Server) {
  let room = startNewTurn(roomName);
  let intervalId: string | number | NodeJS.Timeout;
  const timerFunction = () => {
    console.log(room.timer);
    const playerWhoWonMessage = hasPlayerWonTheGame(room);
    if (playerWhoWonMessage) {
      resetPlayersPoints(room);
      io.to(roomName).emit("player-won-the-game", playerWhoWonMessage);
      io.to(roomName).emit("update-players", room.players);
    }
    if (room.timer > 0) {
      drecreaseTimer(room);
      io.to(roomName).emit("update-timer", room.timer);
    } else {
      clearInterval(intervalId);
      if (isCurrentPlayerStillInRoom(room)) {
        io.to(roomName).emit("reset-turn", room.currentWord);
      } else {
        const otherPlayer = room.players[0];
        io.to(otherPlayer?.id).emit(
          "drawing-player-left-room",
          room.currentPlayer
        );
      }
    }
    console.log("Timmer ticking");
  };
  intervalId = setInterval(timerFunction, 1000);

  io.to(roomName).emit("turn-started", room);
}
