import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { CreateChat } from "../../types";
import prisma from "@repo/db/client";

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
  });
  res.json(chats);
});
