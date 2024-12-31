import { Button } from "@/components/ui/button";
import { useCall } from "@/contexts/app/call-provider";
import { useMediaStream } from "@/hooks/use-media-stream";
import { MicIcon, PhoneOff, VideoIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function VideoChatComponent() {
  const remoteVideoRef = useRef<HTMLVideoElement>(null!);
  const localVideoRef = useRef<HTMLVideoElement>(null!);
  const { remoteStream, localStream, setLocalStream, callType } = useCall();

  useEffect(() => {
    remoteVideoRef.current.srcObject = remoteStream || null;
    localVideoRef.current.srcObject = localStream || null;
    console.log(remoteStream?.getTracks());
  }, [remoteStream, localStream]);

  return (
    <div className="inset-0 bg-background absolute overflow-hidden">
      <video
        ref={remoteVideoRef}
        autoPlay
        className="-scale-x-100 w-full h-full object-contain"
        disablePictureInPicture
      />
      <div className="absolute inset-0 p-10">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          className="-scale-x-100 object-contain w-[200px] h-[100px] cursor-pointer top-0 left-0"
          disablePictureInPicture
        />
      </div>
      {/* Controls */}
      <div className="mx-auto absolute left-1/2 bottom-[5%] -translate-x-1/2 space-x-2">
        <Button size="icon">
          <MicIcon />
        </Button>
        <Button size="icon">
          <VideoIcon />
        </Button>
        <Button variant="destructive" size="icon">
          <PhoneOff />
        </Button>
      </div>
    </div>
  );
}

export function VideoChat() {
  const [videoPortal, setVideoPortal] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setVideoPortal(document.getElementById("call-portal"));
  }, []);

  return videoPortal ? createPortal(<VideoChatComponent />, videoPortal) : null;
}
