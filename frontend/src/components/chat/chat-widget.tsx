"use client";

import Link from "next/link";
import { Check, RotateCcw, X } from "lucide-react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { chatbotFlow, START_NODE } from "./chatbot-flow";
import styles from "./chat-widget.module.css";

type Item = {
  id: number;
  from: "user" | "bot";
  text: string;
  time: string;
  node?: string;
};

const BOT_NAME = "Vyntics Assistant";
const TYPING_MS = 700;
const LINK_PATTERN = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// Bot messages may contain [label](/internal-path) links, rendered as same-tab internal links.
function renderText(text: string, onNavigate: () => void): ReactNode[] {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK_PATTERN)) {
    const index = match.index ?? 0;
    if (index > last) parts.push(<Fragment key={`t${last}`}>{text.slice(last, index)}</Fragment>);
    parts.push(
      <Link key={`l${index}`} href={match[2]} className={styles.link} onClick={onNavigate}>
        {match[1]}
      </Link>,
    );
    last = index + match[0].length;
  }
  if (last < text.length) parts.push(<Fragment key={`t${last}`}>{text.slice(last)}</Fragment>);
  return parts;
}

function Robot({ waving }: { waving: boolean }) {
  return (
    <svg className={styles.robot} width="64" height="72" viewBox="0 0 64 72" aria-hidden="true" focusable="false">
      <line x1="32" y1="4" x2="32" y2="12" stroke="#1754d8" strokeWidth="2.500" strokeLinecap="round" />
      <circle cx="32" cy="4" r="3" fill="#60a5fa" />
      <rect x="6" y="12" width="52" height="38" rx="16" fill="#ffffff" stroke="#1754d8" strokeWidth="3" />
      <rect x="12" y="19" width="40" height="24" rx="11" fill="#0b1220" />
      <g className={styles.eyes}>
        <circle cx="24" cy="30" r="4" fill="#60a5fa" />
        <circle cx="40" cy="30" r="4" fill="#60a5fa" />
      </g>
      <path d="M27 37q5 4 10 0" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
      <rect x="18" y="52" width="28" height="16" rx="8" fill="#1754d8" />
      <rect x="25" y="56" width="14" height="6" rx="3" fill="#ffffff" opacity="0.9" />
      <g className={waving ? styles.wave : undefined} style={{ transformOrigin: "52px 56px" }}>
        <rect x="46" y="50" width="12" height="7" rx="3.500" fill="#1754d8" />
        <circle cx="59" cy="53" r="4" fill="#ffffff" stroke="#1754d8" strokeWidth="2" />
      </g>
      <rect x="6" y="52" width="12" height="7" rx="3.500" fill="#1754d8" />
    </svg>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [typing, setTyping] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const nextId = useRef(1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  const botItem = useCallback((node: string): Item => ({
    id: nextId.current++,
    from: "bot",
    text: chatbotFlow[node].text,
    time: formatTime(new Date()),
    node,
  }), []);

  // Timestamps use the client clock, so the first message is created after mount to avoid hydration mismatch.
  useEffect(() => {
    setItems([botItem(START_NODE)]);
    setMounted(true);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [botItem]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    // While typing, show the bottom. Once a reply arrives, scroll to the start of that reply so the
    // description is read from the top and the option buttons sit below it.
    const last = items[items.length - 1];
    if (!typing && last?.from === "bot" && items.length > 1) {
      messagesRef.current?.querySelector(`[data-id="${last.id}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [items, typing, open]);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  // The chat stays open when a link is followed. On mobile the panel is full-screen and would hide the page, so it closes there.
  const closeOnMobile = useCallback(() => {
    if (window.matchMedia("(max-width: 767px)").matches) setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const choose = (label: string, next: string) => {
    if (typing) return;
    setItems((prev) => [...prev, { id: nextId.current++, from: "user", text: label, time: formatTime(new Date()) }]);
    setTyping(true);
    timer.current = setTimeout(() => {
      setItems((prev) => [...prev, botItem(next)]);
      setTyping(false);
    }, TYPING_MS);
  };

  const restart = () => {
    if (timer.current) clearTimeout(timer.current);
    setTyping(false);
    setItems([botItem(START_NODE)]);
  };

  const lastBotId = [...items].reverse().find((item) => item.from === "bot")?.id;

  return (
    <div className={styles.root}>
      <div
        ref={panelRef}
        id="vyntics-chat-panel"
        role="dialog"
        aria-label={BOT_NAME}
        aria-hidden={!open}
        inert={!open}
        tabIndex={-1}
        className={`${styles.panel} ${open ? styles.panelOpen : ""}`}
      >
        <header className={styles.header}>
          <div className={styles.headerText}>
            <p className={styles.name}>{BOT_NAME}</p>
            <p className={styles.status}>
              <span className={styles.dot} aria-hidden="true" />
              Online
            </p>
          </div>
          <button type="button" className={styles.iconButton} onClick={close} aria-label="Close chat">
            <X size={18} />
          </button>
        </header>

        <div ref={messagesRef} className={styles.messages} role="log" aria-live="polite" aria-label="Chat messages">
          {mounted &&
            items.map((item) => (
              <div key={item.id} data-id={item.id} className={`${styles.row} ${item.from === "user" ? styles.rowUser : ""}`}>
                <div className={`${styles.bubble} ${item.from === "user" ? styles.bubbleUser : styles.bubbleBot}`}>
                  {item.from === "bot" ? renderText(item.text, closeOnMobile) : item.text}
                </div>
                <span className={styles.time}>{item.time}</span>
                {item.id === lastBotId && !typing && item.node && (
                  <div className={styles.options}>
                    {chatbotFlow[item.node].options.map(([label, next]) => (
                      <button key={label} type="button" className={styles.option} onClick={() => choose(label, next)}>
                        <Check size={14} aria-hidden="true" />
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

          {typing && (
            <div className={styles.row}>
              <div className={`${styles.bubble} ${styles.bubbleBot} ${styles.typing}`} role="status" aria-label="Assistant is typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.restart} onClick={restart}>
            <RotateCcw size={14} aria-hidden="true" />
            Start over
          </button>
        </footer>
      </div>

      <div className={styles.launcherWrap}>
        {!open && (
          <p className={styles.greeting} aria-hidden="true">
            Hi! Need a hand?
          </p>
        )}
        <button
          ref={toggleRef}
          type="button"
          className={styles.launcher}
          onClick={() => (open ? close() : setOpen(true))}
          aria-label={open ? "Close chat" : "Open chat"}
          aria-expanded={open}
          aria-controls="vyntics-chat-panel"
        >
          <Robot waving={!open} />
        </button>
      </div>
    </div>
  );
}
