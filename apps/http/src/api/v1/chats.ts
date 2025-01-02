import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { CreateChat, CreateMessage } from "../../types";
import prisma from "@repo/db/client";
import redis from "@repo/redis/client";

export const router = Router();
router.use(authMiddleware);

router.post("/", async (req, res) => {
  const data = await CreateChat.parseAsync(req.body);

  // TODO: check if recipient is friend
  var chat;
  try {
    chat = await prisma.chat.findFirstOrThrow({
      where: {
        AND: [
          { Recipients: { some: { id: req.userId } } },
          { Recipients: { some: { id: data.recipient_id } } },
        ],
      },
      include: { Recipients: true },
    });
  } catch (e) {
    chat = await prisma.chat.create({
      data: {
        Recipients: {
          connect: [{ id: req.userId }, { id: data.recipient_id }],
        },
      },
      include: { Recipients: true },
    });
  }
  res.json(chat);
});

router.get("/:chatId", async (req, res) => {
  try {
    const chat = await prisma.chat.findUniqueOrThrow({
      where: { id: req.params.chatId },
      include: { Recipients: true },
    });
    res.json(chat);
  } catch (e) {
    res.status(404).json();
  }
});

router.get("/", async (req, res) => {
  const chats = await prisma.chat.findMany({
    where: {
      Recipients: { some: { id: req.userId } },
    },
    include: {
      Recipients: true,
      _count: { select: { Message: { where: { seen: false } } } },
    },
  });
  res.json(chats);
});

router.get("/:chatId/messages", async (req, res) => {
  // Check chat permissions
  try {
    await prisma.chat.findUnique({
      where: {
        id: req.params.chatId,
        Recipients: { some: { id: req.userId } },
      },
    });
  } catch (e) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  const messages = await prisma.message.findMany({
    where: { chatId: req.params.chatId },
    orderBy: { createdAt: "asc" },
    include: { Sender: true },
  });

  res.json(messages);
});

router.post("/:chatId/messages", async (req, res) => {
  const data = await CreateMessage.parseAsync(req.body);
  try {
    await prisma.chat.findUnique({
      where: {
        id: req.params.chatId,
        Recipients: { some: { id: req.userId } },
      },
    });
  } catch (e) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  const message = await prisma.message.create({
    data: {
      content: data.content,
      senderId: req.userId!,
      chatId: req.params.chatId,
    },
    include: {
      Sender: true,
      Chat: {
        include: {
          Recipients: true,
        },
      },
    },
  });
  await redis.publish("message:create", JSON.stringify(message));
  res.status(201).json(message);
});
