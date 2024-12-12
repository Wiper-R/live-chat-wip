import { z } from "zod";

export const SendFriendRequest = z.object({
  userId: z.string(),
});
