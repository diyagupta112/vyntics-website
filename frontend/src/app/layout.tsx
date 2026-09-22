import type { Metadata } from "next";
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
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
