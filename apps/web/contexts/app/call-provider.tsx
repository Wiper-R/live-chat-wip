import { createContext } from "@/lib/utils";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSocket } from "./socket-provider";
import Peer, { MediaConnection } from "peerjs";
import { IncomingCallDialog } from "@/components/app/video-chat/incoming-call-dialog";
import { Chat, User } from "@repo/api-types";
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
};

const [Context, useCall] = createContext<CallContext>();

export function CallProvider({ children }: PropsWithChildren) {
  const [callType, setCallType] = useState<CallType>("idle");
  const { socket } = useSocket();
  const [peer, _setPeer] = useState<Peer>();
  const [peerId, setPeerId] = useState<string>();
  const [answered, setAnswered] = useState(false);
  const [callState, setCallState] = useState<CallState>();
  const [mediaConnection, setMediaConnection] = useState<MediaConnection>();

  const canAnswer = callType == "incoming" && !answered && peerId;
  function setPeer(newPeer: Peer) {
    if (peer) peer.destroy();
    _setPeer(newPeer);
  }

  const onCallOutgoing = useCallback(
    ({
      callId,
      caller,
      chat,
    }: {
      callId: string;
      caller: User;
      chat: Chat;
    }) => {
      setCallType("outgoing");
      setCallState({ chat, caller, callId, state: "outgoing" });
    },
    [setCallType, setCallState],
  );

  const onCallIncoming = useCallback(
    ({
      callId,
      caller,
      chat,
    }: {
      callId: string;
      caller: User;
      chat: Chat;
    }) => {
      setPeer(new Peer());
      setCallType("incoming");
      setCallState({ chat, caller, callId, state: "incoming" });
    },
    [setCallType, setCallState],
  );

  const onCallAnswered = useCallback(
    ({ peerId, callId }: { peerId: string; callId: string }) => {
      if (callType == "outgoing" && peer && callId == callState?.callId) {
        const stream = new MediaStream();
        const mc = peer.call(peerId, stream);
        console.log("Calling user");
        setMediaConnection(mc);
      } else if (callType == "incoming") {
        setAnswered(true);
      }
    },
    [peer, callType, callState],
  );
  useEffect(() => {
    socket.on("call:outgoing", onCallOutgoing);
    socket.on("call:incoming", onCallIncoming);
    socket.on("call:answered", onCallAnswered);
    return () => {
      socket.off("call:outgoing", onCallOutgoing);
      socket.off("call:incoming", onCallIncoming);
      socket.off("call:answered", onCallAnswered);
    };
  }, [onCallIncoming, onCallOutgoing, onCallAnswered]);

  useEffect(() => {
    if (!peer) return;
    peer.on("open", (peerId: string) => {
      setPeerId(peerId);
    });
    peer.on("call", (call) => {
      if (callType == "incoming") {
        const stream = new MediaStream();
        call.answer(stream);
        console.log("Call received and answered");
        setMediaConnection(call);
      }
    });
    peer.on("connection", (data) => {
      console.log(data);
    });
  }, [peer, callType]);

  useEffect(() => {
    if (!mediaConnection) return;
    mediaConnection.on("stream", (stream) => {
      console.log("call is live");
    });
  }, [mediaConnection]);

  const call = useCallback((chatId: string) => {
    setPeer(new Peer());
    socket.emit("call:initiate", {
      chatId,
    });
  }, []);

  const answerCall = useCallback(() => {
    if (!callState || callState.state != "incoming" || !canAnswer) return;
    console.log("Call is answered");
    socket.emit("call:answered", { callId: callState.callId, peerId });
  }, [callState, canAnswer, peerId]);

  const rejectCall = useCallback(() => {
    if (!callState || callState.state != "incoming" || !canAnswer) return;
    socket.emit("call:rejected", { callId: callState.callId });
  }, [callState, canAnswer]);
  return (
    <Context.Provider
      value={{
        callType,
        call,
        callState,
      }}
    >
      {children}
      {callState?.state == "incoming" && canAnswer && (
        <IncomingCallDialog
          caller={callState.caller}
          acceptCall={answerCall}
          rejectCall={rejectCall}
        />
      )}
    </Context.Provider>
  );
}

export { useCall };
