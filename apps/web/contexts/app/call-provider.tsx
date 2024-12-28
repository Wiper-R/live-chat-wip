import { createContext } from "@/lib/utils";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSocket } from "./socket-provider";
import { IncomingCallDialog } from "@/components/app/video-chat/incoming-call-dialog";
import { Chat, User } from "@repo/api-types";
import Peer, { MediaConnection } from "peerjs";
import { useUser } from "./user-provider";
import { useMediaStream } from "@/hooks/use-media-stream";

type CallState =
  | {
      state: "idle";
    }
  | {
      state: "outgoing" | "incoming" | "ongoing";
      initiator: User;
      callId: string;
      chat: Chat;
    };

type CallContext = {
  callState: CallState;
  call: (chatId: string) => void;
};
const [Context, useCall] = createContext<CallContext>();

function useCallState() {
  const [callState, setCallState] = useState<CallState>({ state: "idle" });
  const { socket } = useSocket();
  const { user } = useUser();
  const [callAccepted, setCallAccepted] = useState(false);
  const [mediaConnection, setMediaConnection] = useState<MediaConnection>();
  const [peer, setPeer] = useState<Peer>();
  const { stream } = useMediaStream();

  const callInitiate = useCallback(
    ({
      initiator,
      chat,
      callId,
    }: {
      initiator: User;
      callId: string;
      chat: Chat;
    }) => {
      if (!user) return;
      if (initiator.id == user.id) {
        setCallState({ state: "outgoing", initiator, chat, callId });
      } else {
        setCallState({ state: "incoming", initiator, callId, chat });
      }
    },
    [user, setCallState],
  );

  const onCallAccept = useCallback(
    ({ callId }: { callId: string }) => {
      if (callState.state == "idle" || callState.state == "ongoing") {
        return;
      }
      if (callState.callId != callId) return;
      console.log("Call is accepted");
      setCallAccepted(true);

      setCallState((prev) => {
        if (prev.state == "incoming" || prev.state == "outgoing") {
          return { ...prev, state: "ongoing" };
        }
        return prev;
      });
    },
    [callState],
  );

  const onReceiverReady = useCallback(
    ({ receiverPeerId }: { receiverPeerId: string }) => {
      if (!peer || !user) return;
      console.log("Receiver ready");
      if (callState.state == "idle") return;
      if (callState.initiator.id == user.id) {
        const call = peer.call(receiverPeerId, stream!);
        call.on("stream", (stream) => {
          console.log("we are live in call");
        });
        call.on("error", (error) => {
          console.log(error);
        });
        console.log("Starting a call");
      }
    },
    [callState, peer, user, stream],
  );

  useEffect(() => {
    socket.on("call:initiate", callInitiate);
    return () => {
      socket.off("call:initiate", callInitiate);
    };
  }, [callInitiate]);

  useEffect(() => {
    socket.on("call:accepted", onCallAccept);
    return () => {
      socket.off("call:accepted", onCallAccept);
    };
  }, [onCallAccept]);

  useEffect(() => {
    socket.on("call:receiverReady", onReceiverReady);
    return () => {
      socket.off("call:receiverReady", onReceiverReady);
    };
  }, [onReceiverReady]);

  useEffect(() => {
    if (!callAccepted || peer) return;
    const newPeer = new Peer();
    setPeer(newPeer);
    console.log("Alert socket before", callState);
    if (callState.state == "idle") return;
    newPeer.on("open", (peerId: string) => {
      socket.open();
      console.log("Alert socket");
      socket.emit("call:peerReady", { peerId, callId: callState.callId });
    });
  }, [callAccepted, callState]);

  useEffect(() => {
    if (!peer) return;
    peer.on("call", (call) => {
      call.on("stream", (stream) => {
        console.log("we are live in call");
      });
      call.on("error", (error) => {
        console.log(error);
      });
      call.answer(stream!);
      console.log("Answering call");
    });
  }, [callState, peer, stream]);

  return { callState, callAccepted };
}

export function CallProvider({ children }: PropsWithChildren) {
  const { callState, callAccepted } = useCallState();
  const { socket } = useSocket();
  // This is a call object

  const call = useCallback((chatId: string) => {
    socket.connect();
    socket.emit("call:initiate", { chatId });
    console.log("Call");
  }, []);

  const acceptCall = useCallback(() => {
    socket.connect();
    if (callState.state != "incoming") return;
    socket.emit("call:accept", { callId: callState.callId });
  }, [callState.state]);

  const rejectCall = useCallback(() => {
    socket.connect();
    if (callState.state != "incoming") return;
    socket.emit("call:reject", { callId: callState.callId });
  }, [callState.state]);

  return (
    <Context.Provider value={{ callState, call }}>
      {children}
      {callState.state == "incoming" && (
        <IncomingCallDialog
          from={callState.initiator}
          acceptCall={acceptCall}
          rejectCall={rejectCall}
        />
      )}
    </Context.Provider>
  );
}

export { useCall };
