"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import type { AuthChangeEvent } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthSessionBoundaryProps = Readonly<{ children: ReactNode }>;

export function AuthSessionBoundary({ children }: AuthSessionBoundaryProps) {
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const { data } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === "SIGNED_OUT") {
        router.replace("/login");
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        router.refresh();
      }
    });

    return () => data.subscription.unsubscribe();
  }, [router]);

  return children;
}
