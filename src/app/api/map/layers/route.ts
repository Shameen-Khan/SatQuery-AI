import { NextResponse } from "next/server";
import { NASA_GIBS_LAYERS, BASEMAP_PROVIDERS, getDefaultGibsDate } from "@/lib/nasa/gibs";
import { ALL_EO_PROVIDERS } from "@/lib/geospatial/adapters";

export async function GET() {
  return NextResponse.json({
    defaultDate: getDefaultGibsDate(),
    gibsLayers: NASA_GIBS_LAYERS,
    basemaps: BASEMAP_PROVIDERS,
    providers: ALL_EO_PROVIDERS.map((p) => p.info),
  });
}
