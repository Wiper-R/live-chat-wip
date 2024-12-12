"use client";

import { useState } from "react";

export function useMediaStream(stream: MediaStream) {
  const [audio, setAudio] = useState(false);
  const [video, setVideo] = useState(false);

  const toggleAudio = () => {
    setAudio((audio) => !audio);
    stream.getAudioTracks().forEach((track) => (track.enabled = audio));
  };

  const toggleVideo = () => {
    setVideo((video) => !video);
    stream.getVideoTracks().forEach((track) => (track.enabled = video));
  };

  return { toggleAudio, toggleVideo };
}
