import { Category } from "./Category";
import { Player } from "./Player";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

export type MaximumPoints = "80" | "100" | "120" | "200";

export interface Room {
  name: string;
  category: Category;
  maximumNumberOfPlayers: number;
  maximumPoints: MaximumPoints;
  currentWord: string;
  currentPlayer: string;
  chat: string[];
  players: Player[];
  canvas: ExcalidrawElement[];
  timer: number;
}

export interface Guess {
  roomName: string;
  playerNickname: string;
  guess: string;
}

export interface ClientReady {
  roomName: string;
  playerId: string;
}
