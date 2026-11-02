import type { Metadata } from "next";
import { ConsentProvider } from "@/components/consent/consent-provider";
import { CookieConsent } from "@/components/consent/cookie-consent";
import { StyledComponentsRegistry } from "@/components/ui/styled-components-registry";
import { ScrollRestoration } from "@/components/layout/scroll-restoration";
import "@fontsource-variable/dm-sans";
import "./globals.css";


export const metadata: Metadata = {
  metadataBase: new URL("https://vyntics.com"),
  title: {
    default: "Vyntics",
    template: "%s | Vyntics",
  },
  description: "Vyntics company website",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script id="vyntics-theme-init" src="/theme-init.js" async />
      </head>
      <body>
        <ScrollRestoration />
        <ConsentProvider>
          <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
          <CookieConsent />
        </ConsentProvider>
      </body>
    </html>
  );
}
