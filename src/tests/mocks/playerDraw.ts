import { PlayerDraw } from "../../types/Draw";
import { elements } from "./canvasElements";
import { mockRoom } from "./room";

export const mockPlayerDraw: PlayerDraw = {
  excalidrawElements: elements,
  roomName: mockRoom.name,
};
