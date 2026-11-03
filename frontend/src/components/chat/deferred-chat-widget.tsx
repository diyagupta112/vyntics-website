"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// The chat flow pulls in service content for every route; load it after the page is interactive instead of with the main bundle.
const ChatWidget = dynamic(() => import("./chat-widget").then((module) => module.ChatWidget), { ssr: false });

export function DeferredChatWidget() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const start = () => setReady(true);
    const idle = typeof window.requestIdleCallback === "function";
    const handle = idle ? window.requestIdleCallback(start, { timeout: 3000 }) : window.setTimeout(start, 1500);
    return () => (idle ? window.cancelIdleCallback(handle) : window.clearTimeout(handle));
  }, []);

  return ready ? <ChatWidget /> : null;
}
