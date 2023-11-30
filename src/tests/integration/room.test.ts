import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Socket as ClientSocket } from "socket.io-client";

import { Server, Socket } from "socket.io";
import setupTestServer from "../../utils/tests/setupTestServer";
import waitFor from "../../utils/tests/waitForSocketEvent";
import { Room } from "../../types/Room";
import { joinRoom, joinRoom2 } from "../mocks/joinRoom";
import { mockRoom } from "../mocks/room";
import { resetRooms } from "../../useCases/room.case";

interface Message {
  message: Message;
}

describe("create room", () => {
  let io: Server;

  let serverSocket: Socket | undefined;
  let clientSocket: ClientSocket;

  beforeAll(async () => {
    const response = await setupTestServer();
    io = response.io;
    clientSocket = response.clientSocket;
    serverSocket = response.serverSocket;
    resetRooms();
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  it("should create a room", async () => {
    clientSocket.emit("create-room", mockRoom);
    const expectedMessage = "The room was created successfully";
    const { message }: Message = await waitFor(clientSocket, "room-created");

    expect(message).toBe(expectedMessage);
  });

  it("should throw invalid  room data", async () => {
    clientSocket.emit("create-room", { ...mockRoom, name: "" });
    const expectedMessage = "Room name must contain at least 2 characters";
    const { message }: Message = await waitFor(clientSocket, "invalid-data");

    expect(message).toBe(expectedMessage);
  });

  it("should throw room already exist", async () => {
    clientSocket.emit("create-room", mockRoom);
    const expectedMessage = "A room with this name already exists";
    const { message }: Message = await waitFor(
      clientSocket,
      "create-room-error"
    );

    expect(message).toBe(expectedMessage);
  });
});

describe("get rooms", () => {
  let io: Server;

  let serverSocket: Socket | undefined;
  let clientSocket: ClientSocket;

  beforeAll(async () => {
    const response = await setupTestServer();
    io = response.io;
    clientSocket = response.clientSocket;
    serverSocket = response.serverSocket;
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  it("should get rooms", async () => {
    clientSocket.emit("get-rooms");
    clientSocket.emit("create-room", mockRoom);

    const rooms: Room[] = await waitFor(clientSocket, "rooms");

    expect(rooms[0].name).toBe(mockRoom.name);
  });
});

describe("join room", () => {
  let io: Server;

  let serverSocket: Socket | undefined;
  let clientSocket: ClientSocket;

  beforeAll(async () => {
    const response = await setupTestServer();
    io = response.io;
    clientSocket = response.clientSocket;
    serverSocket = response.serverSocket;
    resetRooms();
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  it("should throw room not found", async () => {
    clientSocket.emit("join-room", joinRoom);

    const error = await waitFor(clientSocket, "join-room-error");

    expect(error?.message).toBe("Room not found");
  });

  it("should join a room", async () => {
    clientSocket.emit("create-room", mockRoom);
    clientSocket.emit("join-room", joinRoom);

    const promises = [
      waitFor(clientSocket, "player-joined-room"),
      waitFor(clientSocket, "update-players"),
    ];
    const [playerJoinedRoom, updatePlayers] = await Promise.all(promises);

    expect(playerJoinedRoom?.room.players[0].nickName).toBe(
      joinRoom.player.nickName
    );
    expect(playerJoinedRoom?.playerId).toBe(clientSocket.id);
    expect(updatePlayers[0]?.nickName).toBe(joinRoom.player.nickName);
  });

  it("should throw nickname is already in use", async () => {
    clientSocket.emit("create-room", mockRoom);
    clientSocket.emit("join-room", joinRoom);

    const promises = [waitFor(clientSocket, "join-room-error")];

    const [error] = await Promise.all(promises);

    expect(error?.message).toBe("This nickname is already in use");
  });

  it("should throw room is full", async () => {
    clientSocket.emit("create-room", mockRoom);
    clientSocket.emit("join-room", joinRoom2);
    clientSocket.emit("join-room", joinRoom2);

    const promises = [waitFor(clientSocket, "join-room-error")];

    const [error] = await Promise.all(promises);

    expect(error?.message).toBe("Room is full");
  });
});
