import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
  type: "coordinate" | "place";
  bbox?: [number, number, number, number]; // [minLat, maxLat, minLng, maxLng]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json({ error: "Search query 'q' parameter is required" }, { status: 400 });
    }

    // 1. Check for Direct Coordinate Input (e.g. "37.7749, -122.4194" or "37.7749 -122.4194")
    const coordRegex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)[,\s]+[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
    if (coordRegex.test(query)) {
      const parts = query.split(/[,\s]+/).map(Number);
      const lat = parts[0];
      const lng = parts[1];

      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        const coordResult: GeocodeResult = {
          lat: Number(lat.toFixed(5)),
          lng: Number(lng.toFixed(5)),
          displayName: `Coordinates: ${lat >= 0 ? `${lat.toFixed(4)}°N` : `${Math.abs(lat).toFixed(4)}°S`}, ${lng >= 0 ? `${lng.toFixed(4)}°E` : `${Math.abs(lng).toFixed(4)}°W`}`,
          type: "coordinate",
        };
        return NextResponse.json({ results: [coordResult] });
      }
    }

    // 2. Query OpenStreetMap Nominatim for Named Places
    const nominatimUrl = new URL("https://nominatim.openstreetmap.org/search");
    nominatimUrl.searchParams.set("q", query);
    nominatimUrl.searchParams.set("format", "json");
    nominatimUrl.searchParams.set("limit", "5");
    nominatimUrl.searchParams.set("addressdetails", "1");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(nominatimUrl.toString(), {
      headers: {
        "User-Agent": "SatQueryAI/1.0 (Earth Observation Intelligence; https://satquery.ai)",
        Accept: "application/json",
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      throw new Error(`Nominatim responded with status ${response.status}`);
    }

    const data = await response.json();

    const results: GeocodeResult[] = (data || []).map((item: any) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      displayName: item.display_name,
      type: "place",
      bbox: item.boundingbox ? [
        parseFloat(item.boundingbox[0]),
        parseFloat(item.boundingbox[1]),
        parseFloat(item.boundingbox[2]),
        parseFloat(item.boundingbox[3]),
      ] : undefined,
    }));

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Geocoding error:", error);
    // Return friendly fallback if external service is unreachable
    return NextResponse.json({
      results: [],
      warning: "Location search service is temporarily busy. You can enter exact latitude and longitude coordinates directly (e.g. 29.9792, 31.1342).",
    });
  }
}
