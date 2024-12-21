import { Router } from "express";
import {
  CreateChat,
  CreateMessageData,
  CreateMessageParams,
  GetMessageParams,
} from "@live-chat/shared/validators/chats";
import { getUser } from "./users";
import { connections } from "..";

const router = Router();

router.post("/", async (req, res) => {
  // FIXME: User must be friend before creating chat
  const data = await CreateChat.parseAsync(req.body);
  const user = await getUser(req.auth.payload.sub);
  var chat = await prisma.chat.findFirst({
    where: { Users: { every: { OR: [{ id: user.id }, { id: data.userId }] } } },
  });

  var status: number = 200;

  if (!chat) {
    chat = await prisma.chat.create({
      data: {
        Users: { connect: [{ id: user.id }, { id: data.userId }] },
      },
    });
    status = 201;
  }

  res.status(status).json(chat);
});

router.post("/:id/messages", async (req, res) => {
  const params = await CreateMessageParams.parseAsync(req.params);
  const data = await CreateMessageData.parseAsync(req.body);
  const user = await getUser(req.auth.payload.sub);
  const chat = await prisma.chat.findFirst({
    where: { id: params.id, Users: { some: { id: user.id } } },
    include: { Users: { select: { id: true } } },
  });
  if (!chat) {
    res.status(404).json({});
    return;
  }

  const message = await prisma.message.create({
    data: { content: data.content, senderId: user.id, chatId: chat.id },
  });

  for (const { id } of chat.Users) {
    if (id in connections) {
      connections[id].emit("message", message);
    }
  }

  res.status(201).json(message);
});

router.get("/", async (req, res) => {
  const user = await getUser(req.auth.payload.sub);
  const chats = await prisma.chat.findMany({
    where: { Users: { some: { id: user.id } } },
    include: { Users: { where: { id: { not: user.id } } } },
  });

  res.json(chats);
});

router.get("/:id/messages", async (req, res) => {
  const params = await GetMessageParams.parseAsync(req.params);
  const user = await getUser(req.auth.payload.sub);
  const chat = await prisma.chat.findFirst({
    where: { id: params.id, Users: { some: { id: user.id } } },
  });
  if (!chat) {
    res.status(404).json({});
    return;
  }
  const data = await prisma.message.findMany({
    where: { chatId: chat.id },
  });

  const messages = data.map((msg) => {
    return { ...msg, isSender: user.id == msg.senderId };
  });

  res.json(messages);
});

export default router;
