"use client";
import { createContext } from "@/lib/utils";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { Peer } from "peerjs";
import { useSocket } from "./socket-provider";

const [Context, usePeer] = createContext();

export function PeerProvider({ children }: PropsWithChildren) {
  const [peerId, setPeerId] = useState<string | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const { socket } = useSocket();
  useEffect(() => {
    if (peerRef.current) return;
    const peer = new Peer();
    peer.on("open", (peerId) => {
      setPeerId(peerId);
    });

    peer.on("close", () => {
      setPeerId(null);
    });
    peerRef.current = peer;
  }, []);

  useEffect(() => {
    socket.connect();
    if (peerId) socket.emit("peer:connected", peerId);
    else socket.emit("peer:disconnected");
  }, [peerId]);
  return <Context.Provider value={{}}>{children}</Context.Provider>;
}

export { usePeer };
