import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./config";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  const { url, anonKey, isConfigured } = getSupabaseEnv();

  if (!isConfigured) {
    // Return a dummy client or null-safe instance to prevent hard crashes before setup
    return createBrowserClient(
      url || "https://placeholder-project.supabase.co",
      anonKey || "placeholder-anon-key"
    );
  }

  if (!browserClient) {
    browserClient = createBrowserClient(url, anonKey);
  }

  return browserClient;
}
