import { createCustomContext } from "@/src/lib/utils";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { MediaConnection, Peer } from "peerjs";
import { useSocket } from "./socket-provider";
import { ChatWithUsers } from "@live-chat/shared/types";
import axios from "axios";

type CallType = "incoming" | "outgoing" | "idle";

type CallContext = {
  peer?: Peer;
  incoming?: Incoming;
  outgoing?: Outgoing;
  callType: CallType;
  callStream?: MediaStream;
  setCallStream: React.Dispatch<React.SetStateAction<MediaStream | undefined>>;
  initiateCall: (chatId: number) => void;
  call: (peerId: string, chat: ChatWithUsers, stream: MediaStream) => void;
};

const [Context, useCallProvider] = createCustomContext<CallContext>();

type Outgoing = {
  peerId: string;
  chat: ChatWithUsers;
};

type Incoming = {
  call: MediaConnection;
};

function CallProvider({ children }: PropsWithChildren) {
  const [outgoing, setOutgoing] = useState<Outgoing>();
  const [incoming, setIncoming] = useState<Incoming>();
  const [callType, setCallType] = useState<CallType>("idle");
  const { socket } = useSocket();
  const [peer, setPeer] = useState<Peer>();
  const peerId = useRef<string>();
  const [callStream, setCallStream] = useState<MediaStream>();

  const initiateCall = useCallback(async (chatId: number) => {
    const res = await axios.get(`/api/chats/${chatId}/peer`);
    const { peerId, chat } = res.data;
    setCallType("outgoing");
    setOutgoing({
      peerId,
      chat,
    });
  }, []);

  const call = useCallback(
    (peerId: string, chat: ChatWithUsers, stream: MediaStream) => {
      if (!peer) {
        console.warn("Peer isn't ready yet");
        return;
      }
      var _call = peer.call(peerId, stream, { metadata: { chat } });
      _call.on("stream", (stream) => {
        console.log("Accepted");
        setCallStream(stream);
      });
    },
    [peer]
  );

  // Signal ws server that our peer is updated
  useEffect(() => {
    if (!socket || !peer) return;
    function peerOpen(id: string) {
      if (!socket) return;
      console.log("Peer id assigned: ", id);
      socket.emit("peer:open", id);
      peerId.current = id;
    }

    function peerClose() {
      console.log("Peer is closed");
      peerId.current = undefined;
    }

    function socketConnect() {
      if (!peerId.current) return;
      peerOpen(peerId.current);
    }

    peer.on("open", peerOpen);
    peer.on("close", peerClose);
    socket.on("connect", socketConnect);

    return () => {
      peer.off("open", peerOpen);
      peer.off("close", peerClose);
      socket.off("connect", socketConnect);
    };
  }, [socket, peer]);

  // Handle socket response
  useEffect(() => {
    if (!socket || !peer) return;

    function callRequest({
      peerId,
      userId,
      chat,
    }: {
      peerId: string;
      userId: number;
      chat: ChatWithUsers;
    }) {
      if (!peer) return;
      setCallType("outgoing");
      setOutgoing({
        peerId,
        chat,
      });
    }

    socket.on("call:request", callRequest);

    return () => {
      socket.off("call:request", callRequest);
    };
  }, [socket, peer]);

  useEffect(() => {
    const peer = new Peer();
    setPeer(peer);
    console.log("Connecting new peer");

    peer.on("call", (call) => {
      console.log("Oh we got a call");
      setCallType("incoming");
      setIncoming({
        call,
      });
    });

    return () => {
      setPeer(undefined);
    };
  }, []);

  return (
    <Context.Provider
      value={{
        callType,
        incoming,
        outgoing,
        peer,
        setCallStream,
        callStream,
        initiateCall,
        call,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export { CallProvider, useCallProvider };
