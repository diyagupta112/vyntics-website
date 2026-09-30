import { createBrowserClient } from "@supabase/ssr";

import { getPublicEnvironment } from "@/lib/config/public-env";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    const { supabaseAnonKey, supabaseUrl } = getPublicEnvironment();
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  return browserClient;
}
