"use client";

import { useState } from "react";

export function useMediaStream(stream: MediaStream) {
  const [audio, setAudio] = useState(stream.getAudioTracks()[0].enabled);
  const [video, setVideo] = useState(stream.getVideoTracks()[0].enabled);

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
