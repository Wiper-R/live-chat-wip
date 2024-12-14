import { Router } from "express";
import prisma from "../prisma";
import auth0Axios from "../lib/auth0-axios";
import {
  CreateUserRequest,
  SearchUsers,
} from "@live-chat/shared/validators/users";

const router = Router();

// Helper
async function createUser(accessToken: string) {
  const resp = await auth0Axios.get("/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data: CreateUserRequest = resp.data;
  var user = await prisma.user.findFirst({ where: { email: data.email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.email,
        Account: {
          create: {
            id: data.sub,
          },
        },
      },
    });
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { Account: { create: { id: data.sub } } },
    });
  }

  return user;
}

export async function getUser(sub: string) {
  const account = await prisma.account.findFirst({
    where: { id: sub },
    include: { User: true },
  });
  if (!account) {
    return null;
  }
  return account.User;
}

router.post("/", async (req, res) => {
  const exists = await prisma.account.findFirst({
    where: { id: req.auth?.payload.sub },
  });
  if (exists) {
    res.send({ message: "Account already exists" });
    // TODO: Return duplicate errror message
    return;
  }
  const user = await createUser(req.auth?.token!);
  res.send({});
});

router.get("/", async (req, res) => {
  const accessToken = req.auth?.token!;
  var user = await getUser(req.auth?.payload.sub!);
  if (!user) {
    user = await createUser(accessToken);
  }
  res.json({ ...user });
});

router.get("/search", async (req, res) => {
  const data = await SearchUsers.parseAsync(req.query);
  const user = await getUser(req.auth?.payload.sub!);
  if (!user) {
    res.status(401).json({});
    return;
  }
  if (!data.q) {
    res.json([]);
    return;
  }
  const users = await prisma.user.findMany({
    where: {
      username: { contains: data.q, mode: "insensitive" },
      Friendship: { none: { Users: { some: { id: user.id } } } },
      id: { not: user.id },
    },
  });
  res.json(users);
});

export default router;
