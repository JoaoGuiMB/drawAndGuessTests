import * as z from "zod";

const CategoryEnum = z.enum(["ANIME", "ANIMALS", "MOVIES", "SPORTS"]);

const maximumPointsEnum = z.enum(["80", "100", "120", "200"]);

export const createRoomSchema = z.object({
  name: z
    .string()
    .min(2, "Room name must contain at least 2 characters")
    .max(20, "Username must not contain more than 20 characters"),

  category: CategoryEnum,
  maximumPoints: maximumPointsEnum,
  maximumNumberOfPlayers: z.number().min(2).max(10),
});
