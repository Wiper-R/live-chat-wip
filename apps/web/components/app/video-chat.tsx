"use client";

import { useEffect, useRef, useState } from "react";
import { MediaConnection, Peer } from "peerjs";
import { useSocket } from "@/contexts/app/socket-provider";
import { useMediaStream } from "@/hooks/use-media-stream";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { User } from "@repo/api-types";
import { Button } from "../ui/button";

export function VideoChat() {
  const peerRef = useRef<Peer>(undefined);
  const localVideoRef = useRef<HTMLVideoElement>(null!);
  const remoteVideoRef = useRef<HTMLVideoElement>(null!);
  const { socket, callState } = useSocket();
  const [peerId, setPeerId] = useState<string | null>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callObject, setCallObject] = useState<MediaConnection | null>(null);
  useEffect(() => {
    if (peerRef.current) {
      return;
    }
    const peer = new Peer();
    peerRef.current = peer;
    peer.once("open", (id: string) => {
      console.log(`${id} peer connected with id`);
      setPeerId(id);
    });
    peer.once("call", (call) => {
      console.log("wait is this true, iam getting a call");
      setCallObject(call);
    });
  }, []);

  const { stream } = useMediaStream();

  useEffect(() => {
    if (!stream) return;
    socket.open();
    const peer = peerRef.current!;
    socket.on(
      "call:start",
      ({ receiverPeerId }: { receiverPeerId: string }) => {
        const call = peer.call(receiverPeerId, stream);
        setCallObject(call);
      },
    );
    return () => {
      socket.off("call:start");
    };
  }, [peerId, stream]);

  useEffect(() => {
    if (!stream || !peerId) return;
    localVideoRef.current.srcObject = stream;
    if (callState.state != "idle") {
      socket.emit("call:ready", { peerId, callId: callState.callId });
    }
  }, [stream, peerId]);

  useEffect(() => {
    if (callAccepted && callObject && callState.state == "receiving_call") {
      callObject.answer(stream!);
      console.log("Call answered");
    }
  }, [callAccepted, callObject]);

  useEffect(() => {
    if (!callObject) return;
    callObject.on("stream", (stream) => {
      remoteVideoRef.current.srcObject = stream;
    });
  }, [callObject]);

  const acceptCall = () => setCallAccepted(true);

  return (
    <div>
      <video autoPlay ref={localVideoRef} muted />
      <video autoPlay ref={remoteVideoRef} />
      {callState.state == "receiving_call" && (
        <IncomingCallDialog from={callState.from} acceptCall={acceptCall} />
      )}
    </div>
  );
}

function IncomingCallDialog({
  from,
  acceptCall,
}: {
  from: User;
  acceptCall: () => void;
}) {
  const [open, setIsOpen] = useState(true);
  return (
    <Dialog open={open}>
      <DialogContent className="max-w-[400px] flex flex-col items-center">
        <DialogTitle>Incoming Call</DialogTitle>
        <div className="w-24 h-24 rounded-full bg-gray-500" />
        <div>{from.name} is calling</div>
        <div className="space-x-4">
          <Button
            onClick={() => {
              setIsOpen(false);
              acceptCall();
            }}
          >
            Accept
          </Button>
          <Button variant="destructive">Reject</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
