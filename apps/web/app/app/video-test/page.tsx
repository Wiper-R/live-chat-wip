"use client";
import { Button } from "@/components/ui/button";
import { useMediaStream } from "@/hooks/use-media-stream";
import { MicIcon, PhoneOff, VideoIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

function VideoContainer() {
  const { stream } = useMediaStream();
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (stream && remoteVideoRef.current && localVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
      localVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="inset-0 bg-background absolute overflow-hidden">
      <video
        ref={remoteVideoRef}
        autoPlay
        muted
        className="-scale-x-100 w-full h-full object-contain"
      />
      <div className="absolute inset-0 p-10">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          className="-scale-x-100 object-contain w-[200px] h-[100px] cursor-pointer top-0 left-0"
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

function CallPortal() {
  const ref = useRef<Element>(null);
  useEffect(() => {
    ref.current = document.getElementById("call-portal");
  }, []);

  return ref.current ? createPortal(<VideoContainer />, ref.current) : null;
}
export default function Page() {
  return <CallPortal />;
}
