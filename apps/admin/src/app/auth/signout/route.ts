import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const reason = url.searchParams.get("reason");
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  const destination = reason ? `/login?error=${encodeURIComponent(reason)}` : "/login";
  return NextResponse.redirect(new URL(destination, url.origin));
}
