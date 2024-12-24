import { Router } from "express";
import { SigninSchema, SignupSchema } from "../../types";
import { compare, hash } from "../../scrypt";
import prisma from "@repo/db/client";
import jwt from "jsonwebtoken";
import env from "../../env";
import { router as usersRouter } from "./users";
import { router as relationshipRouter } from "./relationships";
import { router as chatsRouter } from "./chats";

const router = Router();

router.post("/signup", async (req, res) => {
  const data = await SignupSchema.parseAsync(req.body);
  const hashedPassword = await hash(data.password);
  try {
    var user = await prisma.user.create({
      data: {
        username: data.username,
        name: data.name,
        password: hashedPassword,
      },
      select: { id: true, username: true, name: true },
    });
    res.json(user);
  } catch (e) {
    console.log(e);
    res.status(400).json({ message: "User already exists" });
  }

  res.json({});
});

router.post("/signin", async (req, res) => {
  const data = await SigninSchema.parseAsync(req.body);
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { username: data.username },
      select: { password: true, id: true },
    });
    if (!user) {
      res.status(403).json({ message: "Invalid username or password" });
      return;
    }

    const isValid = await compare(data.password, user.password);
    if (!isValid) {
      res.status(403).json({ message: "Invalid username or password" });
      return;
    }

    const token = jwt.sign(
      {
        userId: user.id,
      },
      env.JWT_SECRET
    );
    res.cookie("token", token, {
      httpOnly: true,
    });
    res.json({});
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.use("/users", usersRouter);
usersRouter.use("/@me/relationships", relationshipRouter);
usersRouter.use("/@me/chats", chatsRouter);

export { router };
