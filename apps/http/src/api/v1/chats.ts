import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { CreateChat, CreateMessage } from "../../types";
import prisma from "@repo/db/client";
import redis from "@repo/redis/client";
import { Chat, Message } from "@repo/api-types";

export const router = Router();
router.use(authMiddleware);

router.post("/", async (req, res) => {
  const data = await CreateChat.parseAsync(req.body);

  // TODO: check if recipient is friend
  var chat: Chat;
  try {
    chat = await prisma.chat.findFirstOrThrow({
      where: {
        AND: [
          { Recipients: { some: { User: { id: req.userId } } } },
          { Recipients: { some: { User: { id: data.recipient_id } } } },
        ],
      },
      include: { Recipients: { include: { User: true } } },
    });
  } catch (e) {
    chat = await prisma.chat.create({
      data: {
        Recipients: {
          create: [{ userId: req.userId! }, { userId: data.recipient_id }],
        },
      },
      include: { Recipients: { include: { User: true } } },
    });
  }
  res.json(chat);
});

router.get("/:chatId", async (req, res) => {
  try {
    const chat: Chat = await prisma.chat.findUniqueOrThrow({
      where: { id: req.params.chatId },
      include: { Recipients: { include: { User: true } } },
    });
    res.json(chat);
  } catch (e) {
    res.status(404).json();
  }
});

router.get("/", async (req, res) => {
  const chats: Chat[] = await prisma.chat.findMany({
    where: {
      Recipients: { some: { User: { id: req.userId } } },
    },
    include: {
      Recipients: { include: { User: true } },
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
        Recipients: { some: { User: { id: req.userId } } },
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

  await prisma.chatUser.update({
    where: {
      chatId_userId: { chatId: req.params.chatId, userId: req.userId! },
    },
    data: { lastSeenAt: new Date() },
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

  const message: Message = await prisma.message.create({
    data: {
      content: data.content,
      senderId: req.userId!,
      chatId: req.params.chatId,
    },
    include: {
      Sender: true,
      Chat: {
        include: {
          Recipients: { include: { User: true } },
        },
      },
    },
  });
  await redis.publish("message:create", JSON.stringify(message));
  res.status(201).json(message);
});
