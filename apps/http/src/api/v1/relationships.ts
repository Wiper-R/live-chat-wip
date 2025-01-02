import { Router } from "express";
import { SendFriendRequest } from "../../types";
import prisma from "@repo/db/client";
import z from "zod";
import redis from "@repo/redis/client";
export const router = Router();

router.post("/", async (req, res) => {
  const data = await SendFriendRequest.parseAsync(req.body);

  const senderId = req.userId!;
  var recipientId: string;
  try {
    const recipient = await prisma.user.findFirstOrThrow({
      where: { username: data.username, id: { not: senderId } },
    });
    recipientId = recipient.id;
  } catch (e) {
    res.status(400).json({
      message: "Recipient not found",
    });
    return;
  }

  const userIds = [senderId, recipientId];
  userIds.sort();

  var relationship = await prisma.relationship.findUnique({
    where: { userIds },
    include: {
      Recipient: true,
      Sender: true,
    },
  });

  if (relationship && relationship.senderId == senderId) {
    // Request already sent
    res.json(relationship);
    return;
  }

  if (relationship && relationship.recipientId == senderId) {
    // Accept friend request
    relationship = await prisma.relationship.update({
      where: { id: relationship.id },
      data: { status: "accepted" },
      include: {
        Recipient: true,
        Sender: true,
      },
    });

    res.json(relationship);
    return;
  }

  relationship = await prisma.relationship.create({
    data: {
      senderId: senderId,
      recipientId: recipientId,
      userIds,
    },
    include: {
      Recipient: true,
      Sender: true,
    },
  });
  await redis.publish("relationship:new", JSON.stringify(relationship));
  res.json(relationship);
});

router.get("/", async (req, res) => {
  const type = await z
    .enum(["pending", "friends"])
    .default("friends")
    .parseAsync(req.query.type);

  var relationships;
  if (type == "friends") {
    relationships = await prisma.relationship.findMany({
      where: {
        status: "accepted",
        userIds: { has: req.userId },
      },
      include: {
        Recipient: true,
        Sender: true,
      },
    });
  } else if (type == "pending") {
    relationships = await prisma.relationship.findMany({
      where: {
        status: "pending",
      },
      include: {
        Recipient: true,
        Sender: true,
      },
    });
  } else {
    res.json({ message: "Invalid relationship type" });
    return;
  }
  res.json(relationships);
});

router.patch("/:id", async (req, res) => {
  const action = await z
    .enum(["accept", "reject"])
    .parseAsync(req.query.action);

  var relationship = await prisma.relationship.findFirst({
    where: { id: req.params.id },
    include: { Recipient: true, Sender: true },
  });

  if (!relationship) {
    res.status(404).json({ message: "Relation not found" });
    return;
  }

  if (relationship.senderId == req.userId && action == "accept") {
    res.status(400).json({ message: "You cannot accept this request" });
    return;
  }

  if (relationship.status != "pending") {
    res.status(400).json({ message: "Relationship cannot be updated" });
    return;
  }

  if (action == "reject") {
    await prisma.relationship.delete({ where: { id: relationship.id } });
    res.json({});
    return;
  } else if (action == "accept") {
    relationship = await prisma.relationship.update({
      where: { id: relationship.id },
      data: {
        status: "accepted",
      },
      include: { Recipient: true, Sender: true },
    });
    res.json(relationship);
    return;
  }
  // We should not reach here theoritically
  res.status(400).json({ message: "Invalid action" });
});

router.delete("/:id", async (req, res) => {
  const relationship = await prisma.relationship.findFirst({
    where: { id: req.params.id, userIds: { has: req.userId } },
  });
  if (!relationship) {
    res.status(404).send({ message: "Relationship not found" });
    return;
  }

  await prisma.relationship.delete({ where: { id: relationship.id } });
  res.json({});
});

router.get("/pending-count", async (req, res) => {
  const pending = await prisma.relationship.count({
    where: { recipientId: req.userId, seen: false },
  });
  res.json({ pending });
});
