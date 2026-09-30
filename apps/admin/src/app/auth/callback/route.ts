import { NextResponse, type NextRequest } from "next/server";

import { checkAdminAccess } from "@/features/auth/lib/admin-access";
import { getSafeRedirectPath } from "@/features/auth/lib/redirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = getSafeRedirectPath(requestUrl.searchParams.get("next"));
  const supabase = await createSupabaseServerClient();

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=authentication", requestUrl.origin));
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session?.access_token) {
    return NextResponse.redirect(new URL("/login?error=authentication", requestUrl.origin));
  }

  const access = await checkAdminAccess(data.session.access_token);

  if (!access.allowed) {
    if (access.reason !== "service") {
      await supabase.auth.signOut();
    }

    const destination =
      access.reason === "service"
        ? "/access-denied?reason=service"
        : `/login?error=${access.reason}`;
    return NextResponse.redirect(new URL(destination, requestUrl.origin));
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
