import { Button } from "@/components/ui/button";
import { useCall } from "@/contexts/app/call-provider";
import { useSocket } from "@/contexts/app/socket-provider";
import { useMediaStream } from "@/hooks/use-media-stream";
import { MicIcon, PhoneOff, VideoIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type VideoChatProps = {
  hangup: () => void;
};

export function VideoChatComponent({ hangup }: VideoChatProps) {
  const remoteVideoRef = useRef<HTMLVideoElement>(null!);
  const localVideoRef = useRef<HTMLVideoElement>(null!);
  const { callState, callType } = useCall();
  const { socket } = useSocket();
  const { stream } = useMediaStream();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();

  const peerRef = useRef<RTCPeerConnection>(
    new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org",
        },
      ],
    }),
  );
  useEffect(() => {
    remoteVideoRef.current.srcObject = remoteStream || null;
  }, [remoteStream]);

  useEffect(() => {
    localVideoRef.current.srcObject = stream || null;
  }, [stream]);

  useEffect(() => {
    return () => {
      if (!stream) return;
      stream.getTracks().forEach((t) => t.stop());
      peerRef.current.close();
    };
  }, [stream]);

  useEffect(() => {
    if (!stream) return;
    stream
      .getTracks()
      .forEach((track) => peerRef.current.addTrack(track, stream));
  }, [stream]);

  const onIceCandidate = useCallback(
    ({ candidate }: RTCPeerConnectionIceEvent) => {
      if (!callState) return;
      socket.connect();
      socket.emit("call:icecandidate", {
        candidate,
        callId: callState.callId,
      });
    },
    [callState],
  );

  const onNegotiationNeeded = useCallback(async () => {
    if (!callState || callType != "outgoing") return;
    const peer = peerRef.current;
    const offer = await peer.createOffer({});
    await peer.setLocalDescription(offer);
    socket.emit("call:negotiationneeded", {
      description: offer,
      callId: callState.callId,
    });
  }, [callState, callType]);

  const onTrack = useCallback(
    ({ streams: [track] }: RTCTrackEvent) => {
      setRemoteStream(track);
    },
    [setRemoteStream],
  );

  const onPeerIceCandidate = useCallback(
    async ({ candidate }: { candidate: RTCIceCandidate }) => {
      const peer = peerRef.current;
      await peer.addIceCandidate(candidate);
    },
    [],
  );

  const onPeerNegotiationNeeeded = useCallback(
    async ({ description }: { description: RTCSessionDescriptionInit }) => {
      if (!callState) return;
      const peer = peerRef.current;
      await peer.setRemoteDescription(description);
      if (description.type == "offer") {
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.connect();
        socket.emit("call:negotiationneeded", {
          description: answer,
          callId: callState.callId,
        });
      }
    },
    [callState],
  );

  useEffect(() => {
    socket.on("call:icecandidate", onPeerIceCandidate);
    socket.on("call:negotiationneeded", onPeerNegotiationNeeeded);
    return () => {
      socket.off("call:icecandidate", onPeerIceCandidate);
      socket.off("call:negotiationneeded", onPeerNegotiationNeeeded);
    };
  }, [onPeerIceCandidate, onPeerNegotiationNeeeded]);

  useEffect(() => {
    const peer = peerRef.current;
    peer.addEventListener("icecandidate", onIceCandidate);
    peer.addEventListener("negotiationneeded", onNegotiationNeeded);
    peer.addEventListener("track", onTrack);
    return () => {
      peer.removeEventListener("icecandidate", onIceCandidate);
      peer.removeEventListener("negotiationneeded", onNegotiationNeeded);
      peer.removeEventListener("track", onTrack);
    };
  }, [onIceCandidate, onNegotiationNeeded, onTrack]);

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
        <Button variant="destructive" size="icon" onClick={hangup}>
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

    return () => {
      setVideoPortal(null);
    };
  }, []);

  return videoPortal
    ? createPortal(<VideoChatComponent {...props} />, videoPortal)
    : null;
}
