"use client";

import { useEffect, useRef } from "react";
import { Peer } from "peerjs";

export function VideoChat() {
  const peerRef = useRef<Peer>();
  const localVideoRef = useRef<HTMLVideoElement>();
  const remoteVideoRef = useRef<HTMLVideoElement>();
  useEffect(() => {
    if (peerRef.current) return; // Peer already initialized
    const peer = new Peer();
    peerRef.current = peer;
  }, []);

  return (
    <div>
      <video autoPlay ref={localVideoRef} muted />
      <video autoPlay ref={remoteVideoRef} />
    </div>
  );
}
