import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import prisma from "@repo/db/client";
import z from "zod";
import { SendFriendRequest } from "../../types";

export const router = Router();

router.use(authMiddleware);

router.get("/:userId", async (req, res) => {
  let userId = req.params.userId;
  if (userId == "@me") {
    userId = req.userId!;
  }

  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
      },
    });
    res.json(user);
  } catch (e) {
    res.status(404).json({ message: "User not found" });
  }
});
