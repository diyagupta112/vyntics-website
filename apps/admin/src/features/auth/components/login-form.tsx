"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import { checkAdminAccess, getAdminAccessMessage } from "@/features/auth/lib/admin-access";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

import styles from "./login-form.module.css";

type FieldErrors = { email?: string; password?: string };

function getInitialMessage(error: string | null): string | null {
  if (error === "authentication" || error === "permission") {
    return "Your account is not authorized to access the Admin Panel.";
  }

  if (error === "service") {
    return "Authentication is temporarily unavailable. Please try again later.";
  }

  return null;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const submittingRef = useRef(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(() =>
    getInitialMessage(searchParams.get("error")),
  );
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const nextErrors: FieldErrors = {};

    if (!email) nextErrors.email = "Email is required.";
    if (!password) nextErrors.password = "Password is required.";
    setFieldErrors(nextErrors);
    setMessage(null);

    if (Object.keys(nextErrors).length > 0) return;

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error || !data.session?.access_token) {
        setMessage("Unable to sign in. Please check your email and password.");
        return;
      }

      const access = await checkAdminAccess(data.session.access_token);
      if (!access.allowed) {
        if (access.reason !== "service") await supabase.auth.signOut();
        setMessage(getAdminAccessMessage(access.reason));
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setMessage("Authentication is temporarily unavailable. Please try again later.");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setMessage(null);

    try {
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", "/dashboard");
      const { error } = await getSupabaseBrowserClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callbackUrl.toString() },
      });

      if (error) {
        setMessage("Unable to continue with Google. Please try again.");
        submittingRef.current = false;
        setIsSubmitting(false);
      }
    } catch {
      setMessage("Authentication is temporarily unavailable. Please try again later.");
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="login-title" className={styles.login}>
      <div className={styles.brand} aria-label="Vyntics Admin Panel">
        <span className={styles.brandName}>Vyntics</span>
        <span className={styles.brandContext}>Admin Panel</span>
      </div>

      <div className={styles.heading}>
        <h1 id="login-title">Welcome back</h1>
        <p>Sign in to continue</p>
      </div>

      <Button
        className={styles.google}
        disabled={isSubmitting}
        onClick={handleGoogleSignIn}
        variant="secondary"
      >
        Continue with Google
      </Button>

      <div className={styles.divider} aria-hidden="true">
        <span>or</span>
      </div>

      <form className={styles.form} noValidate onSubmit={handleSubmit}>
          <FormField error={fieldErrors.email} label="Email" htmlFor="email" required>
            <Input
              aria-invalid={Boolean(fieldErrors.email)}
              autoComplete="email"
              disabled={isSubmitting}
              id="email"
              name="email"
              type="email"
            />
          </FormField>

          <FormField error={fieldErrors.password} label="Password" htmlFor="password" required>
            <div className={styles.passwordControl}>
              <Input
                aria-invalid={Boolean(fieldErrors.password)}
                autoComplete="current-password"
                disabled={isSubmitting}
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className={styles.visibility}
                disabled={isSubmitting}
                onClick={() => setShowPassword((visible) => !visible)}
                type="button"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </FormField>

          <Button className={styles.submit} disabled={isSubmitting} type="submit">
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>

          {message ? (
            <p className={styles.notice} role="alert">
              {message}
            </p>
          ) : null}
      </form>
    </section>
  );
}
