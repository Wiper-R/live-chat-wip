import { z } from "zod";

export const SendFriendRequest = z.object({
  username: z.string(),
});

export const AcceptFriendRequest = z.object({
  requestId: z.coerce.number(),
});

export const RejectFriendRequest = AcceptFriendRequest;

export const RemoveFriend = z.object({
  friendId: z.coerce.number(),
});
