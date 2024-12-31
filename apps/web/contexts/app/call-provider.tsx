import { createContext } from "@/lib/utils";
import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import {
  CallAnswerRequest,
  CallAnswerResponse,
  CallConnectedResponse,
  CallInitiateResponse,
  Chat,
  User,
} from "@repo/api-types";
import { useSocket } from "./socket-provider";
import { Socket } from "socket.io-client";
import { useUser } from "./user-provider";
import { IncomingCallDialog } from "@/components/app/video-chat/incoming-call-dialog";
import { VideoChat } from "@/components/app/video-chat";
import { useMediaStream } from "@/hooks/use-media-stream";
type CallType = "incoming" | "outgoing" | "idle";
type CallState = {
  state: "incoming" | "outgoing" | "ongoing";
  caller: User;
  chat: Chat;
  callId: string;
};

type CallContext = {
  callType?: CallType;
  call: (chatId: string) => void;
  callState?: CallState;
  peer?: RTCPeerConnection;
  localStream?: MediaStream;
  setLocalStream: (stream?: MediaStream) => void;
  remoteStream?: MediaStream;
};

const [Context, useCall] = createContext<CallContext>();

export function CallProvider({ children }: PropsWithChildren) {
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection>();
  const { socket } = useSocket();
  const [callType, setCallType] = useState<CallType>();
  const [callState, setCallState] = useState<CallState>();
  const { user } = useUser();
  const [offer, setOffer] = useState<RTCSessionDescriptionInit>();
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const { stream } = useMediaStream();
  useEffect(() => {
    if (stream) setLocalStream(stream);
  }, [stream]);

  const initializePeer = useCallback(() => {
    if (peerConnection) {
      peerConnection.close();
    }
    const newPeerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun2.1.google.com:19302",
        },
      ],
    });
    localStream
      ?.getTracks()
      .forEach((track) => newPeerConnection.addTrack(track, localStream!));
    newPeerConnection.oniceconnectionstatechange = function () {
      console.log("ICE state: ", newPeerConnection.iceConnectionState);
    };
    setPeerConnection(newPeerConnection);

    return newPeerConnection;
  }, [peerConnection, localStream]);

  const call = useCallback(
    async (chatId: string) => {
      const peer = initializePeer();
      const offer = await peer.createOffer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: true,
      });
      await peer.setLocalDescription(new RTCSessionDescription(offer));
      socket.emit("call:start", { offer, chatId });
    },
    [socket, initializePeer, setOffer],
  );

  const onCallInitiate = useCallback(
    ({ offer, callId, chat, caller }: CallInitiateResponse) => {
      if (callType) return;
      const state: CallState["state"] =
        caller.id == user?.id ? "outgoing" : "incoming";
      setCallType(state);
      setOffer(offer);
      setCallState({ caller, state, callId, chat });
    },
    [callType, user, setCallState, setOffer, setCallType],
  );

  const onCallAnswer = useCallback(
    async ({ answer, callId }: CallAnswerResponse) => {
      if (!peerConnection || callState?.callId != callId) return;
      await peerConnection.setRemoteDescription(answer);
      socket.emit("call:connected", { callId });
      console.log("Answer", answer);
    },
    [peerConnection, callState],
  );

  const onCallConnected = useCallback(
    ({ callId, caller, chat }: CallConnectedResponse) => {
      setCallState({ state: "ongoing", callId, caller, chat });
    },
    [setCallState],
  );

  const acceptCall = useCallback(async () => {
    if (!callState || callState.state != "incoming" || !offer) {
      return;
    }
    const peer = initializePeer();
    await peer.setRemoteDescription(offer);
    console.log("Offer", offer);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(new RTCSessionDescription(answer));
    const request: CallAnswerRequest = {
      answer,
      callId: callState.callId,
    };
    socket.emit("call:answer:accepted", request);
  }, [offer, callState, initializePeer, socket]);

  useEffect(() => {
    socket.on("call:initiate", onCallInitiate);
    return () => {
      socket.off("call:initiate", onCallInitiate);
    };
  }, [socket, onCallInitiate]);

  useEffect(() => {
    socket.on("call:answer", onCallAnswer);
    return () => {
      socket.off("call:answer", onCallAnswer);
    };
  }, [socket, onCallAnswer]);

  useEffect(() => {
    socket.on("call:connected", onCallConnected);
    return () => {
      socket.off("call:connected", onCallConnected);
    };
  }, [onCallConnected]);

  useEffect(() => {
    console.log("Before return");
    console.log(peerConnection, localStream);
    if (!peerConnection || !localStream) return;
    console.log("After return");
    // localStream.getTracks().forEach((track) => {
    //   console.log(track);
    //   peerConnection.addTrack(track, localStream);
    // });
  }, [localStream, peerConnection]);

  useEffect(() => {
    if (!peerConnection) return;

    // Ensure that the ontrack handler is correctly set
    const handleTrack = (event: RTCTrackEvent) => {
      console.log("Received track", event);
      setRemoteStream(event.streams[0]);
    };

    peerConnection.addEventListener("track", handleTrack);

    // Cleanup event listener when peerConnection changes
    return () => {
      peerConnection.removeEventListener("track", handleTrack);
    };
  }, [peerConnection]);

  return (
    <Context.Provider
      value={{
        call,
        callType,
        callState,
        peer: peerConnection,
        localStream,
        setLocalStream,
        remoteStream,
      }}
    >
      {children}
      {callState?.state == "incoming" && (
        <IncomingCallDialog
          caller={callState.caller}
          rejectCall={() => {}}
          acceptCall={acceptCall}
        />
      )}
      {callState?.state == "ongoing" && <VideoChat />}
    </Context.Provider>
  );
}

export { useCall };
