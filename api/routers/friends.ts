import { Router } from "express";
import { SendFriendRequest } from "@live-chat/shared/validators/friends";
import prisma from "../prisma";
import { getUser } from "./user";

const router = Router({});

router.post("/requests", async (req, res) => {
  const data = await SendFriendRequest.parseAsync(req.body);
  const user = await getUser(req.auth?.payload.sub!);
  const receiver = await prisma.user.findFirst({
    where: { username: data.username },
  });

  if (!receiver || !user) {
    // Throw error / bad request
    res.status(400).send({});
    return;
  }

  if (receiver.id == user.id) {
    res.status(400).send({
      message: "Can't send request to yourself",
    });
    return;
  }

  await prisma.friendRequest.create({
    data: {
      receiverId: receiver.id,
      senderId: user.id,
    },
  });
  res.json({ message: `Sent friend request to ${data.username}` });
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
