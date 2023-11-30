const categories = ["ANIME", "ANIMALS", "MOVIES", "SPORTS"] as const;

export type Category = (typeof categories)[number];
