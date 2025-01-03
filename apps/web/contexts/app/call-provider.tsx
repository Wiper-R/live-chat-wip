"use client";
import { createContext } from "@/lib/utils";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CallAnswerRequest,
  CallAnswerResponse,
  CallConnectedResponse,
  CallInitiateResponse,
  Chat,
  User,
} from "@repo/api-types";
import { useSocket } from "./socket-provider";
import { useUser } from "./user-provider";
import { IncomingCallDialog } from "@/components/app/video-chat/incoming-call-dialog";
import { VideoChat } from "@/components/app/video-chat";
import { OutgoingCallDialog } from "@/components/app/video-chat/outgoing-call-dialog";
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
  const { socket } = useSocket();
  const [callType, setCallType] = useState<CallType>();
  const [callState, setCallState] = useState<CallState>();
  const { user } = useUser();
  const outgoingCallAudio = useRef(new Audio("/sounds/outgoing-call.wav"));

  // Play sound based on state
  useEffect(() => {
    if (callType == "outgoing" && callState?.state == "outgoing") {
      outgoingCallAudio.current.play();
    } else {
      outgoingCallAudio.current.pause();
      outgoingCallAudio.current.currentTime = 0;
    }
    return () => {
      outgoingCallAudio.current.pause();
      outgoingCallAudio.current.currentTime = 0;
    };
  }, [callType, callState]);

  const call = useCallback(
    async (chatId: string) => {
      socket.emit("call:start", { chatId });
    },
    [socket],
  );

  const onCallInitiate = useCallback(
    ({ callId, chat, caller }: CallInitiateResponse) => {
      if (callType) return;
      const state: CallState["state"] =
        caller.id == user?.id ? "outgoing" : "incoming";
      setCallType(state);
      setCallState({ caller, state, callId, chat });
    },
    [callType, user, setCallState, setCallType],
  );

  const onCallAnswer = useCallback(
    async ({ callId }: CallAnswerResponse) => {
      if (callState?.callId != callId) return;
      socket.emit("call:connected", { callId });
    },
    [callState],
  );

  const onCallConnected = useCallback(
    ({ callId, caller, chat }: CallConnectedResponse) => {
      setCallState({ state: "ongoing", callId, caller, chat });
    },
    [setCallState],
  );

  const onCallEnded = useCallback(() => {
    setCallState(undefined);
    setCallType(undefined);
  }, [setCallType, setCallState]);

  const acceptCall = useCallback(async () => {
    if (!callState || callState.state != "incoming") {
      return;
    }
    const request: CallAnswerRequest = {
      callId: callState.callId,
    };
    socket.emit("call:answer:accepted", request);
  }, [callState, socket]);

  const rejectCall = useCallback(async () => {
    if (!callState) return;
    socket.emit("call:end", {
      callId: callState.callId,
      reason: "Receiver rejected the call",
    });
  }, [callState, socket]);

  useEffect(() => {
    socket.on("call:initiate", onCallInitiate);
    socket.on("call:answer", onCallAnswer);
    socket.on("call:connected", onCallConnected);
    socket.on("call:ended", onCallEnded);
    return () => {
      socket.off("call:answer", onCallAnswer);
      socket.off("call:connected", onCallConnected);
      socket.off("call:initiate", onCallInitiate);
      socket.off("call:ended", onCallEnded);
    };
  }, [socket, onCallAnswer, onCallConnected, onCallInitiate, onCallEnded]);

  return (
    <Context.Provider
      value={{
        call,
        callType,
        callState,
      }}
    >
      {children}
      {callState?.state == "incoming" && (
        <IncomingCallDialog
          caller={callState.caller}
          acceptCall={acceptCall}
          rejectCall={rejectCall}
        />
      )}
      {callState?.state == "outgoing" && (
        <OutgoingCallDialog callee={callState.caller} hangUp={rejectCall} />
      )}
      {callState?.state == "ongoing" && <VideoChat hangup={rejectCall} />}
    </Context.Provider>
  );
}

export { useCall };
