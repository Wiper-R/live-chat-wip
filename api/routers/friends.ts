import { Router } from "express";
import {
  AcceptFriendRequest,
  RemoveFriend,
  SearchFriends,
  SearchPendingRequests,
  SendFriendRequest,
} from "@live-chat/shared/validators/friends";
import prisma from "../prisma";
import { getUser } from "./users";

// TODO: Implement pages data, infinite scroll

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

router.get("/requests", async (req, res) => {
  const query = await SearchPendingRequests.parseAsync(req.query);
  const user = await getUser(req.auth?.payload.sub);
  // TODO: Run custom query prisma?
  const data = await prisma.friendRequest.findMany({
    where: {
      AND: [
        { OR: [{ senderId: user.id }, { receiverId: user.id }] },
        {
          OR: [
            {
              sender: { username: { contains: query.q, mode: "insensitive" } },
            },
            {
              receiver: {
                username: { contains: query.q, mode: "insensitive" },
              },
            },
          ],
        },
      ],
    },
    include: { receiver: true, sender: true },
  });
  const requests = data.map((req) => {
    return { ...req, isSender: user.id == req.senderId };
  });
  res.json(requests);
});

router.post("/requests/:requestId/reject", async (req, res) => {
  const data = await AcceptFriendRequest.parseAsync(req.params);
  const friendRequest = await prisma.friendRequest.findFirst({
    where: { id: data.requestId },
  });
  if (!friendRequest) {
    res.status(404).json({});
    return;
  }
  const user = await getUser(req.auth?.payload.sub!);
  if (!user || friendRequest.receiverId != user.id) {
    res.status(401).json({});
    return;
  }

  await prisma.friendRequest.delete({ where: { id: friendRequest.id } });
  res.json({ message: `Rejected friend request of ${req.params.requestId}` });
});

router.post("/requests/:requestId/accept", async (req, res) => {
  const data = await AcceptFriendRequest.parseAsync(req.params);
  const friendRequest = await prisma.friendRequest.findFirst({
    where: { id: data.requestId },
  });
  if (!friendRequest) {
    res.status(404).json({});
    return;
  }
  const user = await getUser(req.auth?.payload.sub!);
  if (!user || friendRequest.receiverId != user.id) {
    res.status(401).json({});
    return;
  }
  await prisma.friendship.create({
    data: {
      Users: { connect: [{ id: user.id }, { id: friendRequest.senderId }] },
    },
  });
  await prisma.friendRequest.delete({ where: { id: friendRequest.id } });
  res.json({ message: `Accepted friend request of ${req.params.requestId}` });
});

router.delete("/:friendId", async (req, res) => {
  const data = await RemoveFriend.parseAsync(req.params);
  const user = await getUser(req.auth?.payload.sub!);
  if (!user || user.id == data.friendId) {
    res.status(400).json({});
    return;
  }
  const friendship = await prisma.friendship.findFirst({
    where: { Users: { some: { id: data.friendId } } },
  });
  if (!friendship) {
    res.status(404).json({});
    return;
  }
  await prisma.friendship.delete({ where: { id: friendship.id } });
  res.json({ message: `Removed friend ${req.params.friendId}` });
});

router.get("/", async (req, res) => {
  const data = await SearchFriends.parseAsync(req.query);
  const user = await getUser(req.auth?.payload.sub!);

  const search = data.q || "";

  const friendList = await prisma.friendship.findMany({
    where: {
      Users: {
        some: {
          AND: [
            { id: user!.id },
            { username: { contains: search, mode: "insensitive" } },
          ],
        },
      },
    },
    include: { Users: { where: { id: { not: user!.id } } } },
  });

  const friends = friendList.map((fl) => fl.Users[0]);
  res.json(friends);
});

export default router;
