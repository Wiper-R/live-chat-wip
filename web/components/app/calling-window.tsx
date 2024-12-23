import { useCallProvider } from "@/contexts/app/call-provider";
import { useUser } from "@/contexts/app/user-provider";
import { useMediaStream } from "@/hooks/use-media-stream";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { User } from "@live-chat/shared/prisma";

export function CallingWindow() {
  const { callType, incoming, outgoing, peer, setCallStream, callStream } =
    useCallProvider();
  if (callType == "incoming" && !incoming) throw new Error("Invalid call");
  if (callType == "outgoing" && !outgoing) throw new Error("Invalid call");

  const { stream, status } = useMediaStream();
  const [isCalling, setIsCalling] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    if (status == "rejected") {
    }

    if (
      status == "success" &&
      stream &&
      callType == "outgoing" &&
      outgoing &&
      !isCalling &&
      peer
    ) {
      peer.call(outgoing.peerId, stream, {
        metadata: {
          chat: outgoing.chat,
          user,
        },
      });
      setIsCalling(true);
    }
  }, [status, stream, isCalling, peer, outgoing, callType]);

  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (videoRef.current && callStream) {
      videoRef.current.srcObject = callStream!;
    }
  }, [videoRef.current, callStream]);

  if (callStream) {
    console.log("Call stream yay");
    return <video ref={videoRef} autoPlay />;
  }

  if (outgoing && callType == "outgoing") {
    const calledUser = outgoing.chat.Users.find(
      (u) => u.id == outgoing.userId
    )!;

    return (
      <div className="bg-background h-full flex items-center justify-center">
        <div className="flex flex-col justify-center items-center">
          <div>Calling....</div>
          <div className="w-20 h-20 bg-gray-600 rounded-full mt-10"></div>
          <span className="mt-4">{calledUser.name}</span>
        </div>
      </div>
    );
  }
  if (incoming && callType == "incoming") {
    const meta = incoming.call.metadata;
    const callingUser = meta.chat.Users.find((u: User) => u.id == meta.user.id);
    function answerCall() {
      incoming?.call.answer(stream!);
      incoming?.call.on("stream", (stream) => {
        setCallStream(stream);
      });
    }
    return (
      <div className="bg-background h-full flex items-center justify-center">
        <div className="flex flex-col justify-center items-center">
          <div>Incoming...</div>
          <div className="w-20 h-20 bg-gray-600 rounded-full mt-10"></div>
          <span className="mt-4">{callingUser.name}</span>
          <Button onClick={answerCall}>Accept</Button>
        </div>
      </div>
    );
  }

  return null;
}
