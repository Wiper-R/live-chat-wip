"use client";

import { useMediaStream } from "@/hooks/useMediaStream";
import { useEffect, useRef } from "react";

const PeerPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toggleAudio, toggleVideo, stream } = useMediaStream();
  useEffect(() => {
    if (stream && videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="-scale-x-100 mx-auto w-72"
      />
      <button onClick={toggleVideo}>Toggle Video</button>
      <button onClick={toggleAudio}>Toggle Audio</button>
    </div>
  );
};

export default PeerPage;
