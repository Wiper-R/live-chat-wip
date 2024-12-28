import { Button } from "@/components/ui/button";
import { MicIcon, PhoneOff, VideoIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type VideoChatProps = {
  localStream: MediaStream;
  remoteStream: MediaStream;
};

export function VideoChatComponent({
  localStream,
  remoteStream,
}: VideoChatProps) {
  const remoteVideoRef = useRef<HTMLVideoElement>(null!);
  const localVideoRef = useRef<HTMLVideoElement>(null!);

  return (
    <div className="inset-0 bg-background absolute overflow-hidden">
      <video
        ref={remoteVideoRef}
        autoPlay
        muted
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
        <Button className="" size="icon">
          <MicIcon />
        </Button>
        <Button className="" size="icon">
          <VideoIcon />
        </Button>
        <Button variant="destructive" size="icon">
          <PhoneOff />
        </Button>
      </div>
    </div>
  );
}

export function VideoChat(props: VideoChatProps) {
  const [videoPortal, setVideoPortal] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setVideoPortal(document.getElementById("call-portal"));
  }, []);

  return videoPortal
    ? createPortal(<VideoChatComponent {...props} />, videoPortal)
    : null;
}
