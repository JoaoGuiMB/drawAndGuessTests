import app from "../../app";

import { Server, Socket } from "socket.io";
import { io as ioc } from "socket.io-client";

import { handleSocketEvents } from "../../utils/handleSocketEvents";

import { createServer } from "http";
import waitFor from "./waitForSocketEvent";

const PORT = process.env.PORT;

export default async function setupTestServer() {
  const httpServer = createServer(app);

  const io = new Server(httpServer);
  httpServer.listen(PORT);

  const clientSocket = ioc(`ws://localhost:${PORT}`, {
    transports: ["websocket"],
  });

  let serverSocket: Socket | undefined = undefined;
  io.on("connection", (connectedSocket) => {
    serverSocket = connectedSocket;
    handleSocketEvents(io, serverSocket);
  });

  await waitFor(clientSocket, "connect");

  return { io, clientSocket, serverSocket };
}
