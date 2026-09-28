export type PublicEnvironment = {
  apiBaseUrl: string;
  supabaseAnonKey: string;
  supabaseUrl: string;
};

function requirePublicValue(value: string | undefined, name: string): string {
  const normalized = value?.trim();

  if (!normalized) {
    throw new Error(`Missing required public environment variable: ${name}`);
  }

  return normalized;
}

export function getPublicEnvironment(): PublicEnvironment {
  return {
    apiBaseUrl: requirePublicValue(
      process.env.NEXT_PUBLIC_API_BASE_URL,
      "NEXT_PUBLIC_API_BASE_URL",
    ).replace(/\/$/, ""),
    supabaseAnonKey: requirePublicValue(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ),
    supabaseUrl: requirePublicValue(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      "NEXT_PUBLIC_SUPABASE_URL",
    ).replace(/\/$/, ""),
  };
}
