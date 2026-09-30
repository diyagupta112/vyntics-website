import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@fontsource-variable/dm-sans";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Vyntics Admin",
    template: "%s | Vyntics Admin",
  },
  description: "Internal administration for Vyntics.",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
