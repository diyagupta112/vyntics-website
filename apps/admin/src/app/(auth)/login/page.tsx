import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { LoginForm } from "@/features/auth/components/login-form";
import { checkAdminAccess } from "@/features/auth/lib/admin-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      const access = await checkAdminAccess(session.access_token);
      if (access.allowed) redirect("/dashboard");
    }
  }

  return (
    <Suspense fallback={<p>Loading sign in…</p>}>
      <LoginForm />
    </Suspense>
  );
}
