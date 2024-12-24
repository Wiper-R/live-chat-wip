import { Router } from "express";
import { SendFriendRequest } from "../../types";
import prisma from "@repo/db/client";
import z from "zod";
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
  });

  if (relationship && relationship.senderId == senderId) {
    // Request already sent
    res.status(400).json({ message: "Request already sent" });
    return;
  }

  if (relationship && relationship.recipientId == senderId) {
    // Accept friend request
    relationship = await prisma.relationship.update({
      where: { id: relationship.id },
      data: { status: "accepted" },
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
  });

  res.json(relationship);
});

router.get("/", async (req, res) => {
  const type = await z
    .enum(["incoming", "outgoing", "friends"])
    .default("friends")
    .parseAsync(req.query.type);

  var relationships;
  if (type == "friends") {
    relationships = await prisma.relationship.findMany({
      where: {
        status: "accepted",
        userIds: { has: req.userId },
      },
    });
  } else if (type == "incoming") {
    relationships = await prisma.relationship.findMany({
      where: {
        status: "pending",
        recipientId: req.userId,
      },
    });
  } else {
    relationships = await prisma.relationship.findMany({
      where: {
        status: "pending",
        senderId: req.userId,
      },
    });
  }

  res.json(relationships);
});

router.patch("/:id", async (req, res) => {
  const action = await z
    .enum(["accept", "reject"])
    .parseAsync(req.query.action);

  var relationship = await prisma.relationship.findFirst({
    where: { id: req.params.id, recipientId: req.userId },
  });

  if (!relationship) {
    res.status(404).json({ message: "Relation not found" });
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
