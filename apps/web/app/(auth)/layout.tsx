import { getUser } from "@/actions/user";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

export default async function Layout({ children }: PropsWithChildren) {
  const user = await getUser();
  if (user) redirect("/app");
  return children;
}
