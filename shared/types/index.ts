import { Chat, User } from "@prisma/client";

export type Nullable<T> = T | null;

export type ChatWithUsers = {
  Users: User[];
} & Chat;
