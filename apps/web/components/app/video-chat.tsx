"use client";

import { useEffect, useRef, useState } from "react";
import { MediaConnection, Peer } from "peerjs";
import { useSocket } from "@/contexts/app/socket-provider";

export function VideoChat() {
  const peerRef = useRef<Peer>(null);
  const localVideoRef = useRef<HTMLVideoElement>();
  const remoteVideoRef = useRef<HTMLVideoElement>();
  const { socket, callState } = useSocket();
  const [peerId, setPeerId] = useState<string | null>(null);
  const [callAccepted, setCallAccepted] = useState(true);
  const [callObject, setCallObject] = useState<MediaConnection | null>(null);
  useEffect(() => {
    if (peerRef.current) {
      return;
    }
    const peer = new Peer();
    peerRef.current = peer;
    peer.once("open", (id: string) => {
      console.log(`${id} peer connected with id`);
      if (callState.state != "idle") {
        socket.emit("call:ready", id, callState.callId);
      }
      setPeerId(id);
    });
    peer.once("call", (call) => {
      console.log("wait is this true, iam getting a call");
      setCallObject(call);
    });
  }, []);

  useEffect(() => {
    socket.open();
    const peer = peerRef.current!;
    socket.on("call:start", (peerId: string) => {
      const stream = new MediaStream();
      const call = peer.call(peerId, stream);
      setCallObject(call);
    });
  }, [peerId]);

  useEffect(() => {
    if (callAccepted && callObject && callState.state == "receiving_call") {
      const stream = new MediaStream();
      callObject.answer(stream);
      console.log("Call answered");
    }
  }, [callAccepted, callObject]);

  useEffect(() => {
    if (!callObject) return;
    callObject.on("stream", (stream) => {
      remoteVideoRef.current.srcObject = stream;
    });
  }, [callObject]);

  return (
    <div>
      <video autoPlay ref={localVideoRef} muted />
      <video autoPlay ref={remoteVideoRef} />
    </div>
  );
}
