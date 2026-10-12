import type { Metadata } from "next";
import Script from "next/script";
import { StyledComponentsRegistry } from "@/components/ui/styled-components-registry";
import "@fontsource-variable/dm-sans";
import "./globals.css";

const themeScript = `
  try {
    var theme = localStorage.getItem("vyntics-theme") === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (_) {
    document.documentElement.dataset.theme = "light";
    document.documentElement.style.colorScheme = "light";
  }
`;

export const metadata: Metadata = {
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
        <Script id="vyntics-theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body><StyledComponentsRegistry>{children}</StyledComponentsRegistry></body>
    </html>
  );
}
