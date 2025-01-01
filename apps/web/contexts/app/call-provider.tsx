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
import { useUser } from "./user-provider";
import { IncomingCallDialog } from "@/components/app/video-chat/incoming-call-dialog";
import { VideoChat } from "@/components/app/video-chat";
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

  const acceptCall = useCallback(async () => {
    if (!callState || callState.state != "incoming") {
      return;
    }
    const request: CallAnswerRequest = {
      callId: callState.callId,
    };
    socket.emit("call:answer:accepted", request);
  }, [callState, socket]);

  useEffect(() => {
    socket.on("call:initiate", onCallInitiate);
    socket.on("call:answer", onCallAnswer);
    socket.on("call:connected", onCallConnected);
    return () => {
      socket.off("call:answer", onCallAnswer);
      socket.off("call:connected", onCallConnected);
      socket.off("call:initiate", onCallInitiate);
    };
  }, [socket, onCallAnswer, onCallConnected, onCallInitiate]);

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
          rejectCall={() => {}}
          acceptCall={acceptCall}
        />
      )}
      {callState?.state == "ongoing" && <VideoChat />}
    </Context.Provider>
  );
}

export { useCall };
