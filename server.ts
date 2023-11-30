import * as dotenv from "dotenv";
import { Server } from "socket.io";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

import app from "./src/app";

import { handleSocketEvents } from "./src/utils/handleSocketEvents";

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  handleSocketEvents(io, socket);
});

export { server, io };
