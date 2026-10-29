import { NextRequest, NextResponse } from "next/server";
import { nasaSearchQuerySchema } from "@/lib/validation";
import { searchNasaImages } from "@/lib/nasa/api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = nasaSearchQuerySchema.safeParse({
      q: searchParams.get("q") || "Earth observation satellite",
      page: searchParams.get("page") || 1,
      mediaType: searchParams.get("mediaType") || "image",
    });

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid search parameters", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { q, page, mediaType } = parseResult.data;
    const result = await searchNasaImages({ q, page, mediaType });

    return NextResponse.json(result);
  } catch (error) {
    console.error("NASA API route error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch imagery from NASA Image and Video Library.",
        items: [],
        totalHits: 0,
      },
      { status: 500 }
    );
  }
}
