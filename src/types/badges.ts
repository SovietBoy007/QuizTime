export type BadgeId =
  | "primul-quiz"
  | "scor-perfect"
  | "performanta-ridicata"
  | "incepator-quiz"
  | "activ-quiz"
  | "maestru-quiz"
  | "explorator-primar"
  | "explorator-gimnaziu"
  | "explorator-liceu"
  | "consecvent-3-zile"
  | "consecvent-7-zile"
  | "consecvent-14-zile";

export type BadgeCategory =
  | "performanta"
  | "progres"
  | "categorii"
  | "streak";

export type BadgeDefinition = {
  id: BadgeId;
  name: string;
  description: string;
  category: BadgeCategory;
  icon: string;
};

export type UserBadgeState = {
  earnedIds: BadgeId[];
  streakCount: number;
};
