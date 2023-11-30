import CustomError from "../utils/CustomError";
import { Guess, Room } from "../types/Room";
import { Player } from "../types/Player";
import { PlayerDraw } from "../types/Draw";
import { roomConfig } from "../utils/roomConfig";
import { categories } from "../data";
import { Category } from "../types/Category";

const rooms: Room[] = [];

export function pushRoom(room: Room) {
  if (roomExists(room.name)) {
    throw new CustomError(400, "A room with this name already exists");
  }
  room.currentPlayer = "";
  room.currentWord = "";
  room.timer = roomConfig.timer;
  room.chat = [];
  room.players = [];
  rooms.push(room);
}

export function roomExists(name: string) {
  return findRoomByName(name) !== undefined;
}

export function findRoomByName(id: string) {
  return rooms.find((room) => room.name === id);
}

export function getAllRooms() {
  return rooms;
}

export function validateRoomNotFoundByName(roomName: string) {
  const room = findRoomByName(roomName);
  if (!room) throw new CustomError(404, "Room not found");
  return room;
}

export function addPlayerToRoom(roomName: string, player: Player) {
  const room = validateRoomNotFoundByName(roomName);
  if (room.players.length >= room.maximumNumberOfPlayers)
    throw new CustomError(400, "Room is full");
  if (checkIfPlayerIsAlreadyInRoom(room, player.nickName))
    throw new CustomError(400, "This nickname is already in use");
  player.isPlayerTurn = false;
  room.players.push(player);

  return room;
}

export function checkIfPlayerIsAlreadyInRoom(
  room: Room,
  playerNickname: string
) {
  return room.players.find((player) => player.nickName === playerNickname);
}

export function removeFromRoom(roomName: string, playerId: string) {
  const room = validateRoomNotFoundByName(roomName);
  const playerIndex = room.players.findIndex(
    (player) => player.id === playerId
  );
  if (playerIndex === -1) throw new CustomError(404, "Player not found");
  room.players.splice(playerIndex, 1);
  console.log(rooms);
}

export function findRoomByPlayerId(playerId: string) {
  return rooms.find((room) => {
    return room.players.find((player) => player.id === playerId);
  });
}

export function removePlayer(playerId: string) {
  const room = findRoomByPlayerId(playerId);
  if (!room) throw new CustomError(404, "Room not found");
  removeFromRoom(room.name, playerId);
  return room;
}

export function playerMakeGuess(playerGuess: Guess) {
  const { guess, playerNickname, roomName } = playerGuess;
  const room = validateRoomNotFoundByName(roomName);
  let message;
  const isCorrectGuess = isGuessCorrect(guess, room);
  let playerGuessRightId: string | undefined;
  if (!isCorrectGuess) {
    message = `${playerNickname}: ${guess}`;
  } else {
    message = `${playerNickname} got the right word!`;
    playerGuessRightId = increasePlayersPoints(playerNickname, room);
    if (!playerGuessRightId) {
      throw new CustomError(404, "Player not found");
    }
    room.chat.push(message);
    return { playerGuessRightId, room };
  }

  room.chat.push(message);
  return { room, playerGuessRightId };
}

export function isGuessCorrect(guess: string, room: Room) {
  return guess.toLowerCase() === room.currentWord?.toLowerCase();
}

export function increasePlayersPoints(playerNickname: string, room: Room) {
  let playerGuessRightId: string | undefined;
  room.players.map((player) => {
    if (player.nickName === playerNickname) {
      player.points += 10;
      playerGuessRightId = player.id;
    }
    if (player.nickName === room.currentPlayer) {
      player.points += 5;
    }
  });
  return playerGuessRightId;
}

export function playerMakeDraw(playerDraw: PlayerDraw) {
  const { excalidrawElements, roomName } = playerDraw;
  const room = validateRoomNotFoundByName(roomName);
  room.canvas = excalidrawElements;
  return room.canvas;
}

export function startNewTurn(roomName: string) {
  const room = validateRoomNotFoundByName(roomName);

  room.timer = 30;

  room.currentWord = getWordFromRoomCategory(room.category);
  room.currentPlayer = getRandomPlayerFromRoom(room).nickName;
  setAllPlayersTurnToFalseExcept(room.currentPlayer, room);
  setAllPlayersGuessToFalse(room);
  return room;
}

export function isCurrentPlayerStillInRoom(room: Room) {
  return room.players.find((player) => player.nickName === room.currentPlayer);
}

export function getWordFromRoomCategory(category: Category) {
  const categoryWords = categories[category];
  const randomIndex = Math.floor(Math.random() * categoryWords.length);
  return categoryWords[randomIndex];
}

export function getRandomPlayerFromRoom(room: Room) {
  const randomIndex = Math.floor(Math.random() * room.players.length);
  const player = room.players[randomIndex];
  if (!player) throw new CustomError(404, "Player not found");
  player.isPlayerTurn = true;
  return player;
}

export function setAllPlayersTurnToFalseExcept(playerName: string, room: Room) {
  room.players.map((player) => {
    if (player.nickName !== playerName) {
      player.isPlayerTurn = false;
    }
  });
}

export function setAllPlayersGuessToFalse(room: Room) {
  room.players.map((player) => (player.playerGuessedRight = false));
}

export function hasPlayerWonTheGame(room: Room) {
  const player = room.players.find(
    (player) => player.points >= +room.maximumPoints
  );
  if (player) {
    return `${player.nickName} won the game!`;
  }
}

export function resetPlayersPoints(room: Room) {
  room.players.map((player) => (player.points = 0));
}

export function drecreaseTimer(room: Room) {
  room.timer--;
}

export function resetRooms() {
  rooms.splice(0, rooms.length);
}
