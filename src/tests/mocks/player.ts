import { Player } from "../../types/Player";

const avatar = {
  eyeType: "Side",
  accessoriesType: "Prescription02",
  topType: "WinterHat2",
  hairColor: "Red",
  facialHairType: "MoustacheFancy",
  clotheType: "ShirtCrewNeck",
  eyebrowType: "RaisedExcitedNatural",
  mouthType: "Concerned",
  skinColor: "Black",
};

export const mockPlayer: Player = {
  nickName: "TestPlayer",
  id: "Vws9v-Wegjx4bvBKAAAA",
  isPlayerTurn: false,
  playerGuessedRight: false,
  points: 0,
  avatar,
};

export const mockPlayer2: Player = {
  avatar,
  id: "xws9v-Wegjx4bvBKAABA",
  isPlayerTurn: false,
  nickName: "TestPlayer2",
  playerGuessedRight: false,
  points: 0,
};
