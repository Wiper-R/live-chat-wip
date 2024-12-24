import { Handler } from "express";
import jwt from "jsonwebtoken";
import env from "../env";

export const authMiddleware: Handler = async (req, res, next) => {
  const header = req.headers["authorization"];
  const token = header?.split(" ")[1];
  if (!token) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
    };
    req.userId = decoded.userId;
    next();
  } catch (e) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }
};
