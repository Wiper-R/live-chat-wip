import { z } from "zod";
export const CreateMessageParams = z.object({
  id: z.coerce.number(),
});

export const CreateMessageData = z.object({
  content: z.coerce.string(),
});

export const CreateChat = z.object({
  userId: z.coerce.number(),
});

export const GetMessageParams = z.object({
  id: z.coerce.number(),
});

export const GetChatByID = z.object({
  id: z.coerce.number(),
});

export const CreateCallParams = z.object({
  id: z.coerce.number(),
});
