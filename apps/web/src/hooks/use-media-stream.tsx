"use client";
import { Nullable } from "@live-chat/shared/types";
import { useEffect, useState } from "react";

export type Status = "loading" | "idle" | "rejected" | "success";

export function useMediaStream(stream: Nullable<MediaStream> = null) {
  const [state, setState] = useState<Nullable<MediaStream>>(stream);
  const [status, setStatus] = useState<Status>("loading");
  const [muted, setMuted] = useState(false);
  const [video, setVideo] = useState(true);
  useEffect(() => {
    if (stream) {
      setStatus("idle");
      const [audio, video] = stream.getTracks();
      setMuted(!audio.enabled);
      setVideo(video.enabled);
    } else {
      async function createStream() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
          });
          setState(stream);
          setStatus("success");
        } catch (error) {
          setStatus("rejected");
          console.error("Access denied for audio and video stream", error);
        }
      }

      createStream();
    }
  }, []);

  const toggleVideo = () => {
    if (!state) throw new Error("There is no a video stream to toggle");
    const videoTrack = state.getVideoTracks()[0];
    setVideo((video) => !video);
    videoTrack.enabled = video;
  };

  const toggleAudio = () => {
    if (!state) throw new Error("There is no a video stream to toggle");
    setMuted((muted) => !muted);
    state.getAudioTracks().forEach((track) => (track.enabled = !muted));
  };

  return { toggleAudio, toggleVideo, muted, video, stream: state, status };
}
