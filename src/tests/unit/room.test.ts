import { describe, it, expect, afterAll, afterEach } from "vitest";
import {
  getAllRooms,
  pushRoom,
  resetRooms,
  addPlayerToRoom,
  removeFromRoom,
  removePlayer,
  startNewTurn,
  playerMakeDraw,
  isCurrentPlayerStillInRoom,
  playerMakeGuess,
  hasPlayerWonTheGame,
  resetPlayersPoints,
  drecreaseTimer,
} from "../../useCases/room.case";
import { mockRoom } from "../mocks/room";
import { mockPlayerDraw } from "../mocks/playerDraw";
import { mockPlayer, mockPlayer2 } from "../mocks/player";
import { mockPlayerGuess, mockInvalidPlayerGuess } from "../mocks/playerGuess";
import { mock } from "node:test";

const ROOM_NOT_FOUND_NAME = "notFoundRoom";

describe("Push room", () => {
  afterAll(() => {
    resetRooms();
  });

  it("should push room", () => {
    pushRoom(mockRoom);
    const rooms = getAllRooms();
    expect(rooms.length).toBe(1);
  });

  it("should not push room with same name", () => {
    expect(() => pushRoom(mockRoom)).toThrow(
      "A room with this name already exists"
    );
  });
});

describe("add player to room", () => {
  afterAll(() => {
    resetRooms();
  });

  it("should not find room", () => {
    expect(() => addPlayerToRoom(ROOM_NOT_FOUND_NAME, mockPlayer)).toThrow(
      "Room not found"
    );
  });

  it("should add player to room", () => {
    pushRoom(mockRoom);
    const room = addPlayerToRoom(mockRoom.name, mockPlayer);
    expect(room.players.length).toBe(1);
  });

  it("should throw nickname already in use", () => {
    expect(() => addPlayerToRoom(mockRoom.name, mockPlayer)).toThrow(
      "This nickname is already in use"
    );
  });

  it("should throw room is full", () => {
    const player2 = { ...mockPlayer, nickName: "player2" };
    const player3 = { ...mockPlayer, nickName: "player3" };
    addPlayerToRoom(mockRoom.name, player2);
    expect(() => addPlayerToRoom(mockRoom.name, player3)).toThrow(
      "Room is full"
    );
  });
});

describe("remove player from room", () => {
  afterAll(() => {
    resetRooms();
  });

  it("should not find room", () => {
    expect(() => removeFromRoom(ROOM_NOT_FOUND_NAME, mockPlayer.id)).toThrow(
      "Room not found"
    );
  });

  it("should throw player not found", () => {
    pushRoom(mockRoom);
    expect(() => removeFromRoom(mockRoom.name, "invalid player id")).toThrow(
      "Player not found"
    );
  });

  it("should remove player from room", () => {
    addPlayerToRoom(mockRoom.name, mockPlayer);
    expect(() => removeFromRoom(mockRoom.name, mockPlayer.id)).not.toThrow();
    expect(getAllRooms()[0].players.length).toBe(0);
  });

  it("should remove player", () => {
    addPlayerToRoom(mockRoom.name, mockPlayer);
    removePlayer(mockPlayer.id);
    expect(getAllRooms()[0].players.length).toBe(0);
  });
});

describe("start turn", () => {
  afterEach(() => {
    resetRooms();
  });

  it("should trow room not found", () => {
    expect(() => startNewTurn(ROOM_NOT_FOUND_NAME)).toThrow("Room not found");
  });

  it("should throw player not found", () => {
    pushRoom(mockRoom);
    expect(() => startNewTurn(mockRoom.name)).toThrow("Player not found");
  });

  it("should start new turn", () => {
    pushRoom(mockRoom);
    addPlayerToRoom(mockRoom.name, mockPlayer);
    addPlayerToRoom(mockRoom.name, mockPlayer2);
    const room = startNewTurn(mockRoom.name);

    expect(room.players[0].playerGuessedRight).toBe(false);
  });
});

describe("player draw", () => {
  afterAll(() => {
    resetRooms();
  });

  it("should throw room not found", () => {
    expect(() => playerMakeDraw(mockPlayerDraw)).toThrow("Room not found");
  });

  it("should add canvas to room", () => {
    pushRoom(mockRoom);
    const canvas = playerMakeDraw(mockPlayerDraw);
    expect(canvas).toBe(mockPlayerDraw.excalidrawElements);
  });
});

describe("player make guess", () => {
  afterEach(() => {
    resetRooms();
  });

  it("should throw room not found", () => {
    expect(() => playerMakeGuess(mockInvalidPlayerGuess)).toThrow(
      "Room not found"
    );
  });

  it("should make incorrect guess", () => {
    pushRoom(mockRoom);
    const wrongGuess = "wrong guess";
    const { guess, playerNickname } = mockPlayerGuess;
    const { room, playerGuessRightId } = playerMakeGuess({
      ...mockPlayerGuess,
      guess: wrongGuess,
    });
    expect(playerGuessRightId).toBe(undefined);
    expect(room.chat[0]).toBe(`${playerNickname}: ${wrongGuess}`);
  });

  it("should throw player not found", () => {
    pushRoom(mockRoom);
    addPlayerToRoom(mockRoom.name, mockPlayer);
    const room = startNewTurn(mockRoom.name);

    expect(() =>
      playerMakeGuess({
        guess: room.currentWord,
        playerNickname: "alskdm",
        roomName: mockRoom.name,
      })
    ).toThrow("Player not found");
  });

  it("should got correct guess", () => {
    pushRoom(mockRoom);
    addPlayerToRoom(mockRoom.name, mockPlayer);
    const newTurnRoom = startNewTurn(mockRoom.name);
    const { playerGuessRightId, room } = playerMakeGuess({
      ...mockPlayerGuess,
      guess: newTurnRoom.currentWord,
    });

    const expectedMessage = `${mockPlayerGuess.playerNickname} got the right word!`;
    expect(room.chat[0]).toBe(expectedMessage);
  });
});

describe("player won the game", () => {
  afterEach(() => {
    resetRooms();
  });

  it("no player won the game", () => {
    pushRoom(mockRoom);
    addPlayerToRoom(mockRoom.name, mockPlayer);
    const room = startNewTurn(mockRoom.name);
    const playerWhoWonMessage = hasPlayerWonTheGame(room);
    expect(playerWhoWonMessage).toBe(undefined);
  });

  it("should return player who won the game", () => {
    pushRoom(mockRoom);
    addPlayerToRoom(mockRoom.name, mockPlayer);
    addPlayerToRoom(mockRoom.name, mockPlayer2);
    const room = startNewTurn(mockRoom.name);
    room.players[0].points = 200;
    const playerWhoWonMessage = hasPlayerWonTheGame(room);
    expect(playerWhoWonMessage).toBe(`${mockPlayer.nickName} won the game!`);
  });

  it("should reset players points", () => {
    pushRoom(mockRoom);
    addPlayerToRoom(mockRoom.name, mockPlayer);
    addPlayerToRoom(mockRoom.name, mockPlayer2);
    const room = startNewTurn(mockRoom.name);
    room.players[0].points = 200;
    resetPlayersPoints(room);
    expect(room.players[0].points).toBe(0);
  });

  it("should decrease timer", () => {
    pushRoom(mockRoom);
    addPlayerToRoom(mockRoom.name, mockPlayer);
    addPlayerToRoom(mockRoom.name, mockPlayer2);
    const room = startNewTurn(mockRoom.name);
    room.timer = 10;
    drecreaseTimer(room);
    expect(room.timer).toBe(9);
  });
});
