import { Sidebar } from "@/components/app/sidebar";
import { ChatsProvider } from "@/contexts/app/chats-provider";
import { SocketProvider } from "@/contexts/app/socket-provider";
import { CallProvider } from "@/contexts/app/call-provider";
import { PropsWithChildren } from "react";
import { getUser } from "@/actions/user";
import { redirect } from "next/navigation";
import { WithAuth } from "@/components/with-auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: PropsWithChildren) {
  const user = await getUser();
  if (!user) redirect("/signin");
  return (
    <WithAuth>
      <SocketProvider>
        <CallProvider>
          <ChatsProvider>
            <div className="flex h-screen">
              <Sidebar />
              <div className="flex-grow">{children}</div>
            </div>
          </ChatsProvider>
        </CallProvider>
      </SocketProvider>
    </WithAuth>
  );
}
