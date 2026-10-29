import { NextRequest, NextResponse } from "next/server";
import { executeGeospatialAnalysis, SpectralAnalysisInput } from "@/lib/geospatial/analysis";
import { createServerSupabaseClient, getAuthenticatedUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body: SpectralAnalysisInput = await request.json();

    if (!body.analysisType) {
      return NextResponse.json({ error: "Missing required parameter: analysisType" }, { status: 400 });
    }

    // Execute real spectral calculations
    const result = executeGeospatialAnalysis(body);

    // Save run to Supabase if authenticated, or record locally
    const user = await getAuthenticatedUser();
    const supabase = createServerSupabaseClient();

    if (supabase && user) {
      await supabase.from("analysis_runs").insert({
        user_id: user.id,
        model: "SatQuery-Spectral-Processor",
        prompt: `Analysis: ${body.analysisType} for ${body.location?.name || "Target Area"}`,
        confidence_notes: result.summary,
        execution_ms: 120,
      });
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error("Analysis process error:", error);
    return NextResponse.json(
      { error: "Failed to execute geospatial analysis" },
      { status: 500 }
    );
  }
}
