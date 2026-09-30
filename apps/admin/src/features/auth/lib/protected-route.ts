import { redirect } from "next/navigation";

import { checkAdminAccess } from "./admin-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAdminAccess() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    redirect("/auth/signout?reason=authentication");
  }

  const access = await checkAdminAccess(session.access_token);

  if (!access.allowed) {
    if (access.reason === "authentication") {
      redirect("/auth/signout?reason=authentication");
    }

    redirect(`/access-denied?reason=${access.reason}`);
  }

  return { email: user.email ?? "Authorized administrator", userId: user.id };
}
