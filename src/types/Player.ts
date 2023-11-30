export interface IAvatar {
  eyeType: string;
  accessoriesType: string;
  topType: string;
  hairColor: string;
  facialHairType: string;
  clotheType: string;
  eyebrowType: string;
  mouthType: string;
  skinColor: string;
}

export interface Player {
  id: string;
  points: number;
  nickName: string;
  avatar: IAvatar;
  isPlayerTurn: boolean;
  playerGuessedRight: boolean;
}
