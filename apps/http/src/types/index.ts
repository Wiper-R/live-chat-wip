import { z } from "zod";

export const SignupSchema = z.object({
  username: z.string(),
  name: z.string(),
  password: z.string(),
});

export const SigninSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const CreateChat = z.object({
  recipient_id: z.string(),
});

export const SendFriendRequest = z.object({
  username: z.string(),
});

export const CreateMessage = z.object({
  content: z.string(),
});

declare global {
  namespace Express {
    export interface Request {
      userId?: string;
    }
  }
}
