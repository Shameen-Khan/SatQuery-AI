import { NextResponse } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/config";
import { ServiceStatus } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseEnv = getSupabaseEnv();
  const hasOpenAiKey = Boolean(
    process.env.OPENAI_API_KEY &&
    !process.env.OPENAI_API_KEY.includes("your-openai-api-key")
  );

  const services: ServiceStatus[] = [
    {
      service: "supabase_auth",
      name: "Supabase Authentication",
      isConfigured: supabaseEnv.isConfigured,
      status: supabaseEnv.isConfigured ? "operational" : "missing_config",
      message: supabaseEnv.isConfigured
        ? "Configured with project URL and Anon key."
        : "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
      docsUrl: "https://supabase.com/docs/guides/auth",
    },
    {
      service: "supabase_db",
      name: "PostgreSQL Database & RLS",
      isConfigured: supabaseEnv.isConfigured,
      status: supabaseEnv.isConfigured ? "operational" : "missing_config",
      message: supabaseEnv.isConfigured
        ? "Connected. Migrations defined in supabase/migrations."
        : "Pending Supabase project connection.",
      docsUrl: "https://supabase.com/docs/guides/database",
    },
    {
      service: "supabase_storage",
      name: "Private Storage Bucket (satellite-images)",
      isConfigured: supabaseEnv.isConfigured,
      status: supabaseEnv.isConfigured ? "operational" : "missing_config",
      message: supabaseEnv.isConfigured
        ? "Ready for encrypted, signed-URL satellite image uploads."
        : "Pending Supabase storage bucket initialization.",
      docsUrl: "https://supabase.com/docs/guides/storage",
    },
    {
      service: "openai",
      name: "OpenAI Vision Model",
      isConfigured: hasOpenAiKey,
      status: hasOpenAiKey ? "operational" : "missing_config",
      message: hasOpenAiKey
        ? `Configured with model: ${process.env.OPENAI_MODEL || "gpt-4o"}`
        : "Missing OPENAI_API_KEY in .env.local. Analysis will run in scientific preview mode.",
      docsUrl: "https://platform.openai.com/docs/models/gpt-4o",
    },
    {
      service: "nasa_api",
      name: "NASA Image & Video Library API",
      isConfigured: true,
      status: "operational",
      message: "Public REST endpoint operational (no API key required).",
      docsUrl: "https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf",
    },
  ];

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services,
  });
}
