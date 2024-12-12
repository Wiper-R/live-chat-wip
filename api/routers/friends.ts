import { Router } from "express";
import { SendFriendRequest } from "@live-chat/shared/validators/friends";

const router = Router({});

router.post("/requests", async (req, res) => {
  const data = await SendFriendRequest.parseAsync(req.body);
  console.log(`Sent friend request to ${data.userId}`);
  res.json({ message: `Sent friend request to ${data.userId}` });
});

router.post("/requests/:requestId/reject", async (req, res) => {
  console.log(`Rejected friend request of ${req.params.requestId}`);
  res.json({ message: `Rejected friend request of ${req.params.requestId}` });
});

router.post("/requests/:requestId/accept", async (req, res) => {
  console.log(`Accepted friend request of ${req.params.requestId}`);
  res.json({ message: `Accepted friend request of ${req.params.requestId}` });
});

router.delete("/:friendId", async (req, res) => {
  console.log(`Removed friend ${req.params.friendId}`);
  res.json({ message: `Removed friend ${req.params.friendId}` });
});

router.get("/", async (req, res) => {
  res.json({ data: [] });
});

export default router;
