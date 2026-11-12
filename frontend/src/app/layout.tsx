import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";
import { DeferredChatWidget } from "@/components/chat/deferred-chat-widget";
import { ConsentProvider } from "@/components/consent/consent-provider";
import { CookieConsent } from "@/components/consent/cookie-consent";
import { ScrollRestoration } from "@/components/layout/scroll-restoration";
import { ServiceWorkerRegister } from "@/components/layout/service-worker-register";
import "@fontsource-variable/dm-sans";
import "./globals.css";


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vyntics",
    template: "%s | Vyntics",
  },
  description: "Analytics meets velocity. AI does the work. Vyntics delivers custom AI, data engineering, analytics, cloud, and CRM solutions that help businesses turn complex problems into impactful outcomes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script id="vyntics-theme-init" src="/theme-init.js" async />
      </head>
      <body>
        <ScrollRestoration />
        <ServiceWorkerRegister />
        <ConsentProvider>
          {children}
          <CookieConsent />
          <DeferredChatWidget />
        </ConsentProvider>
      </body>
    </html>
  );
}
