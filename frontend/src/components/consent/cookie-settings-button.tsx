"use client";

import { useCookieConsent } from "./consent-provider";

export function CookieSettingsButton({ className }: { className?: string }) {
  const { openSettings } = useCookieConsent();
  return <button type="button" className={className} onClick={openSettings}>Cookie Settings</button>;
}
