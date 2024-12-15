import { z } from "zod";
export const CreateMessageParams = z.object({
  id: z.number(),
});

export const CreateMessageData = z.object({
  content: z.string(),
});

export const CreateChat = z.object({
  userId: z.number(),
});
