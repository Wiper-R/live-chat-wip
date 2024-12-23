"use client";

import { useCallProvider } from "@/contexts/app/call-provider";
import { useSocket } from "@/contexts/app/socket-provider";
import { useMediaStream } from "@/hooks/use-media-stream";
import { useEffect, useRef } from "react";

const PeerPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toggleAudio, toggleVideo, stream } = useMediaStream();
  useEffect(() => {
    if (stream && videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  const { socket } = useSocket();

  // useEffect(() => {
  //   if (!socket || !stream) return;
  //   socket.on("call:request", ({ peerId }: { peerId: string }) => {
  //     call(peerId, stream);
  //   });
  // }, [socket, stream]);

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="-scale-x-100 mx-auto w-72"
        muted
      />
      <button onClick={toggleVideo}>Toggle Video</button>
      <button onClick={toggleAudio}>Toggle Audio</button>
    </div>
  );
};

export default PeerPage;
