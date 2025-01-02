"use client";
import { useUser } from "@/contexts/app/user-provider";
import { useRouter } from "next/navigation";
import { PropsWithChildren, useEffect, useMemo } from "react";

export function WithAuth({ children }: PropsWithChildren) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/signin");
    }
  }, [user, isLoading, router]);
  const component = useMemo(() => children, [user]);
  return user ? component : <></>;
}
