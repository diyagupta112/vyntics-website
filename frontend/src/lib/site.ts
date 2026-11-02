export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://vyntics-website.vercel.app"
).replace(/\/+$/, "");

// Shared by route discovery, the sitemap, and robots.txt.
export const PRIVATE_PATHS = [
  "/admin", "/api", "/auth", "/login", "/logout", "/signup",
  "/register", "/forgot-password", "/reset-password", "/account",
  "/dashboard", "/private",
];

export function isPrivatePath(path: string) {
  return PRIVATE_PATHS.some((prefix) => path.startsWith(prefix));
}
