"use client";

import { useEffect, useRef } from "react";

const PeerPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
  }, []);

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="-scale-x-100 mx-auto w-72"
      />
    </div>
  );
};

export default PeerPage;
