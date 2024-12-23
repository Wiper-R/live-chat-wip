import { useCallProvider } from "@/src/contexts/app/call-provider";
import { useUser } from "@/src/contexts/app/user-provider";
import { useMediaStream } from "@/src/hooks/use-media-stream";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { User } from "@live-chat/shared/prisma";
import assert from "assert";
function OutgoingCall() {
  const { user } = useUser();
  const { outgoing } = useCallProvider();
  const calledUser = outgoing?.chat.Users.find((u) => u.id != user?.id);
  return (
    <div className="bg-background h-full flex items-center justify-center">
      <div className="flex flex-col justify-center items-center">
        <div>Calling....</div>
        <div className="w-20 h-20 bg-gray-600 rounded-full mt-10"></div>
        <span className="mt-4">{calledUser!.name}</span>
      </div>
    </div>
  );
}

function IncomingCall({ stream }: { stream: MediaStream }) {
  const { incoming, setCallStream } = useCallProvider();
  const { user } = useUser();
  assert(incoming && user);
  const meta = incoming.call.metadata;
  const callingUser = meta.chat.Users.find((u: User) => u.id != user.id);
  function answerCall() {
    if (!incoming) {
      console.log("There is no call, what are you answering");
      return;
    }
    incoming.call.answer(stream);
    incoming.call.on("stream", (stream) => {
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

export function CallWindow() {
  const { callType, incoming, outgoing, peer, callStream, call } =
    useCallProvider();
  if (callType == "incoming" && !incoming) throw new Error("Invalid call");
  if (callType == "outgoing" && !outgoing) throw new Error("Invalid call");

  const { stream, status } = useMediaStream();
  const [isCalling, setIsCalling] = useState(false);

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
      call(outgoing.peerId, outgoing.chat, stream);
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
    return (
      <video ref={videoRef} autoPlay className="w-full h-full object-contain" />
    );
  }

  if (outgoing && callType == "outgoing") {
    return <OutgoingCall />;
  }
  if (incoming && callType == "incoming") {
    return <IncomingCall stream={stream!} />;
  }

  return null;
}
