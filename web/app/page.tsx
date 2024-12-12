"use client";
import { useEffect } from "react";
import PeerPage from "./peer/peer";

export default function Home() {
  useEffect(() => {
    async function testApi() {
      await fetch("/api/authorized");
    }
    testApi();
  }, []);
  return (
    <div>
      <PeerPage />
    </div>
  );
}
