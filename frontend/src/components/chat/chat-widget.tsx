"use client";

import Link from "next/link";
import { Check, RotateCcw, Send, X } from "lucide-react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { chatbotFlow, findAnswerNode, START_NODE } from "./chatbot-flow";
import styles from "./chat-widget.module.css";

type Item = {
  id: number;
  from: "user" | "bot";
  text: string;
  time: string;
  node?: string;
};

type Booking = {
  step: "name" | "email" | "time" | "details" | "confirm";
  name: string;
  email: string;
  time: string;
  details: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BOOKING_INTENT = /\b(b[ou]+k+i?n?g?|schedul\w*|arrang\w*|set up|request)\b.*\b(dem[ou]+s?|call|meeting|session|consultation|appointment)\b|\b(dem[ou]+s?|call|meeting|session|consultation)\b.*\b(b[ou]+k+i?n?g?|schedul\w*|arrang\w*)\b/i;

const GREETING = "Hi! Need a hand?";
const TYPE_START_MS = 600;
const TYPE_STEP_MS = 70;

const AUTO_OPEN_KEY = "vyntics-chat-auto-opened";

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

// Greeting bubble that types itself out. The full text is rendered invisibly first so the bubble
// keeps its final size, and users who prefer reduced motion see the whole text at once.
function TypedGreeting({ text }: { text: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(text.length);
      return;
    }
    let step: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      step = setInterval(() => {
        setCount((value) => {
          if (value >= text.length && step) clearInterval(step);
          return Math.min(value + 1, text.length);
        });
      }, TYPE_STEP_MS);
    }, TYPE_START_MS);
    return () => {
      clearTimeout(start);
      if (step) clearInterval(step);
    };
  }, [text]);

  return (
    <p className={styles.greeting} aria-hidden="true">
      <span className={styles.greetingGhost}>{text}</span>
      <span className={styles.greetingTyped}>
        {text.slice(0, count)}
        {count < text.length && <span className={styles.caret} />}
      </span>
    </p>
  );
}

function Robot({ waving }: { waving: boolean }) {
  return (
    <svg className={styles.robot} width="92" height="104" viewBox="0 0 64 72" aria-hidden="true" focusable="false">
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
  const [input, setInput] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
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

  // Opens the chat once per visit when the visitor scrolls down to the site footer.
  // Skipped on mobile, where the full-screen panel would cover the page.
  useEffect(() => {
    if (sessionStorage.getItem(AUTO_OPEN_KEY)) return;
    let frame = 0;
    const check = () => {
      frame = 0;
      const footer = document.getElementById("footer");
      if (!footer || window.matchMedia("(max-width: 767px)").matches) return;
      if (footer.getBoundingClientRect().top < window.innerHeight - 120) {
        sessionStorage.setItem(AUTO_OPEN_KEY, "1");
        window.removeEventListener("scroll", onScroll);
        setOpen(true);
      }
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(check);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

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
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const pushUser = (text: string) =>
    setItems((prev) => [...prev, { id: nextId.current++, from: "user", text, time: formatTime(new Date()) }]);

  // Shows the typing dots, then a bot message with free text. `node` supplies the buttons under it.
  const say = (text: string, node: string) => {
    setTyping(true);
    timer.current = setTimeout(() => {
      setItems((prev) => [...prev, { id: nextId.current++, from: "bot", text, time: formatTime(new Date()), node }]);
      setTyping(false);
    }, TYPING_MS);
  };

  const summary = (data: Booking) =>
    `Please check your request:\n\n- Name: ${data.name}\n- Email: ${data.email}\n- Preferred time: ${data.time}${data.details ? `\n- Details: ${data.details}` : ""}\n\nShall I send it to the team?`;

  // Demo booking is sent to the same contact endpoint the website's contact form uses.
  const sendBooking = async (data: Booking) => {
    setTyping(true);
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
    let sent = false;
    try {
      const response = await fetch(`${apiBaseUrl}/contact-us`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          subject: "Demo booking request",
          message: `Preferred time: ${data.time}${data.details ? `\n\nDetails: ${data.details}` : ""}\n\nSent from the website chatbot.`,
          source_page: window.location.pathname || "/",
        }),
      });
      sent = response.ok;
    } catch {
      sent = false;
    }
    setTyping(false);
    if (sent) {
      setBooking(null);
      setItems((prev) => [
        ...prev,
        { id: nextId.current++, from: "bot", text: `Thank you, ${data.name}. Your request has been sent. The team will contact you at ${data.email} to confirm a time.`, time: formatTime(new Date()), node: "booking-done" },
      ]);
    } else {
      setItems((prev) => [
        ...prev,
        { id: nextId.current++, from: "bot", text: "Sorry, I could not send your request. Please try again, or use the form on our [Contact page](/contact-us).", time: formatTime(new Date()), node: "booking-error" },
      ]);
    }
  };

  const handleBook = (label: string, action: string) => {
    pushUser(label);
    if (action === "book:start") {
      setBooking({ step: "name", name: "", email: "", time: "", details: "" });
      say("Happy to help. What is your name?", "booking");
    } else if (action === "book:cancel") {
      setBooking(null);
      say("No problem. Your request was not sent. Is there anything else I can help with?", "ai");
    } else if (action === "book:skip" && booking) {
      const next = { ...booking, step: "confirm" as const, details: "" };
      setBooking(next);
      say(summary(next), "booking-confirm");
    } else if (action === "book:send" && booking) {
      void sendBooking(booking);
    }
  };

  const answerBooking = (text: string, current: Booking) => {
    pushUser(text);
    if (current.step === "name") {
      setBooking({ ...current, step: "email", name: text });
      say(`Thank you, ${text}. What is your email address?`, "booking");
    } else if (current.step === "email") {
      if (!EMAIL_PATTERN.test(text)) {
        say("That does not look like an email address. Please type it again.", "booking");
        return;
      }
      setBooking({ ...current, step: "time", email: text });
      say("When would you like the demo? For example, a day and time that suits you.", "booking");
    } else if (current.step === "time") {
      setBooking({ ...current, step: "details", time: text });
      say("Is there anything you would like the team to know, such as your project or goals? Type it here, or tap Skip.", "booking-details");
    } else if (current.step === "details") {
      const next = { ...current, step: "confirm" as const, details: text };
      setBooking(next);
      say(summary(next), "booking-confirm");
    } else {
      say("Please tap Send request to send it, or Cancel booking.", "booking-confirm");
    }
  };

  const choose = (label: string, next: string) => {
    if (typing) return;
    if (next.startsWith("book:")) {
      handleBook(label, next);
      return;
    }
    pushUser(label);
    setTyping(true);
    timer.current = setTimeout(() => {
      setItems((prev) => [...prev, botItem(next)]);
      setTyping(false);
    }, TYPING_MS);
  };

  // Typed questions go to /api/chat (AI limited to website content). If that is unavailable,
  // fall back to the built-in keyword matching. While a demo booking is open, typed text is the answer to its current question.
  const ask = async () => {
    const text = input.trim();
    if (!text || typing) return;
    setInput("");

    if (booking) {
      answerBooking(text, booking);
      return;
    }
    if (BOOKING_INTENT.test(text)) {
      handleBook(text, "book:start");
      return;
    }

    const history = [...items, { id: -1, from: "user" as const, text, time: "" }]
      .slice(-7)
      .map((item) => ({ role: item.from === "user" ? "user" : "assistant", content: item.text }));

    pushUser(text);
    setTyping(true);

    let reply: string | null = null;
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (response.ok) reply = ((await response.json()) as { reply?: string }).reply ?? null;
    } catch {
      reply = null;
    }

    setItems((prev) => [
      ...prev,
      reply
        ? { id: nextId.current++, from: "bot", text: reply, time: formatTime(new Date()), node: "ai" }
        : botItem(findAnswerNode(text)),
    ]);
    setTyping(false);
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void ask();
    }
  };

  const restart = () => {
    if (timer.current) clearTimeout(timer.current);
    setTyping(false);
    setBooking(null);
    setItems([botItem(START_NODE)]);
  };

  const placeholder =
    booking?.step === "name" ? "Type your name"
    : booking?.step === "email" ? "Type your email address"
    : booking?.step === "time" ? "For example: Tuesday at 3 PM"
    : booking?.step === "details" ? "Type here, or tap Skip"
    : booking ? "Tap a button above"
    : "Type your question";

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
          <button type="button" className={styles.restart} onClick={restart}>
            <RotateCcw size={14} aria-hidden="true" />
            Start over
          </button>
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

        <form
          className={styles.inputBar}
          onSubmit={(event) => {
            event.preventDefault();
            void ask();
          }}
        >
          <textarea
            className={styles.input}
            rows={1}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder={placeholder}
            aria-label={placeholder}
          />
          <button type="submit" className={styles.send} disabled={!input.trim() || typing} aria-label="Send message">
            <Send size={18} />
          </button>
        </form>
      </div>

      <div className={styles.launcherWrap}>
        {!open && (
          <TypedGreeting text={GREETING} />
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
