import { Guess } from "../../types/Room";
import { mockPlayer } from "./player";
import { mockRoom } from "./room";

export const mockPlayerGuess: Guess = {
  guess: "",
  playerNickname: mockPlayer.nickName,
  roomName: mockRoom.name,
};

export const mockInvalidPlayerGuess: Guess = {
  guess: "",
  playerNickname: "",
  roomName: "",
};
