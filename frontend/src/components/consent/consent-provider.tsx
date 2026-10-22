"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";

export type CookieConsent = {
  necessary: true;
  /** Always true. Analytics is not a visitor choice. */
  analytics: true;
  /** The only optional category. Gate future marketing technologies on this. */
  marketing: boolean;
  version: number;
  updatedAt: string;
};

const STORAGE_KEY = "vyntics-cookie-consent";
const CONSENT_VERSION = 2;
const listeners = new Set<() => void>();

function parse(raw: string | null): CookieConsent | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    if (value?.version === CONSENT_VERSION && typeof value.marketing === "boolean") {
      return { ...value, necessary: true, analytics: true };
    }
    // Version 1 stored the single optional choice as "analytics"; it now maps to marketing.
    if (value?.version === 1 && typeof value.analytics === "boolean") {
      return { necessary: true, analytics: true, marketing: value.analytics, version: CONSENT_VERSION, updatedAt: value.updatedAt };
    }
    return null;
  } catch {
    return null;
  }
}

function readRaw() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** For non-React code (for example a future GA4 loader): returns the saved decision or null. */
export function getStoredConsent() {
  return typeof window === "undefined" ? null : parse(readRaw());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

type ConsentContextValue = {
  /** False until the browser has been checked, so the server and first client render match. */
  ready: boolean;
  consent: CookieConsent | null;
  settingsOpen: boolean;
  acceptAll: () => void;
  rejectOptional: () => void;
  openSettings: () => void;
  closeSettings: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  // undefined on the server means "not known yet"; null on the client means "no decision stored".
  const raw = useSyncExternalStore(subscribe, readRaw, () => undefined);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const consent = useMemo(() => (raw === undefined ? null : parse(raw)), [raw]);

  const save = useCallback((marketing: boolean) => {
    const next: CookieConsent = { necessary: true, analytics: true, marketing, version: CONSENT_VERSION, updatedAt: new Date().toISOString() };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage unavailable: the choice only lasts until reload.
    }
    setSettingsOpen(false);
    listeners.forEach(listener => listener());
  }, []);

  const value = useMemo<ConsentContextValue>(() => ({
    ready: raw !== undefined,
    consent,
    settingsOpen,
    acceptAll: () => save(true),
    rejectOptional: () => save(false),
    openSettings: () => setSettingsOpen(true),
    closeSettings: () => setSettingsOpen(false),
  }), [raw, consent, settingsOpen, save]);

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useCookieConsent() {
  const context = useContext(ConsentContext);
  if (!context) throw new Error("useCookieConsent must be used inside ConsentProvider");
  return context;
}
