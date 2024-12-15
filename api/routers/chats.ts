import { Router } from "express";
import {
  CreateChat,
  CreateMessageData,
  CreateMessageParams,
} from "@live-chat/shared/validators/chats";
import { getUser } from "./users";

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
  });
  if (!chat) {
    res.status(404).json({});
    return;
  }

  const message = await prisma.chat.update({
    where: { id: chat.id },
    data: { Messages: { create: { content: data.content } } },
  });

  res.status(201).json(message);
});

export default router;
