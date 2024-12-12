import { Router } from "express";
import { SendFriendRequest } from "@live-chat/shared/validators/friends";

const router = Router({});

router.post("/requests", async (req, res) => {
  const data = await SendFriendRequest.parseAsync(req.body);
  console.log(`Sent friend request to ${data.userId}`);
  res.json({ message: `Sent friend request to ${data.userId}` });
});

export default router;
