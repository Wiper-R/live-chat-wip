import { Router } from "express";
import prisma from "../prisma";
import auth0Axios from "../lib/auth0-axios";
import {
  FinalizeSignUp,
  SearchUsers,
} from "@live-chat/shared/validators/users";

const router = Router();

// Helper
async function createUser({
  email,
  username,
  accountId,
  name,
}: {
  email: string;
  username: string;
  accountId: string;
  name: string;
}) {
  // Create user should only happen in finalize
  var user = await prisma.user.findFirst({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        username,
        name,
        Account: {
          create: {
            id: accountId,
          },
        },
      },
    });
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { Account: { create: { id: accountId } } },
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

router.get("/", async (req, res) => {
  var user = await getUser(req.auth?.payload.sub!);
  if (!user) {
    res.status(404).json();
    return;
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

router.post("/finalize", async (req, res) => {
  const data = await FinalizeSignUp.parseAsync(req.body);
  const resp = await auth0Axios.get("/userinfo", {
    headers: { Authorization: `Bearer ${req.auth.token}` },
  });
  const { email } = resp.data;
  const user = await getUser(req.auth.payload.sub);
  if (user) {
    res.status(400).json({});
    return;
  }

  const createdUser = await createUser({
    email,
    username: data.username,
    name: data.name,
    accountId: req.auth.payload.sub,
  });

  res.json(createdUser);
});

export default router;
