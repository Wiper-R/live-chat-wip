import { z } from "zod";

export const SendFriendRequest = z.object({
  username: z.string(),
});
