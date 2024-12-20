"use client";
import { createCustomContext } from "@/lib/utils";
import axios from "axios";
import { PropsWithChildren, useEffect, useState } from "react";

type User = {
  id: number;
  email: string;
  name?: string;
  username: string;
};

const [Context, useUser] = createCustomContext<{
  user?: User;
  isLoading: boolean;
}>();

export function UserProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User>();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    async function getUser() {
      try {
        const res = await axios.get("/api/users/");
        setUser(res.data);
      } finally {
        setIsLoading(false);
      }
    }
    getUser();
  }, []);
  return (
    <Context.Provider value={{ user, isLoading }}>{children}</Context.Provider>
  );
}

function InternalProvider({ children }: PropsWithChildren) {}

export { useUser };
