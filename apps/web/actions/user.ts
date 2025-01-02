"use server";

import { apiClient } from "@/lib/api-client";
import { User } from "@repo/api-types";
import { cookies } from "next/headers";

export async function getUser() {
  const token = cookies().get("token")?.value;
  if (!token) return null;
  try {
    const res = await apiClient.get("/users/@me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data as User;
  } catch (e) {
    return null;
  }
}
