import { NasaImageItem } from "@/types";

const NASA_IMAGES_API_BASE = "https://images-api.nasa.gov";

interface RawNasaCollectionItem {
  data?: Array<{
    nasa_id: string;
    title: string;
    description?: string;
    center?: string;
    date_created?: string;
    keywords?: string[];
    media_type?: string;
    photographer?: string;
    secondary_creator?: string;
  }>;
  links?: Array<{
    href: string;
    rel: string;
    render?: string;
  }>;
  href?: string;
}

export function isEarthObservationItem(keywords: string[] = [], title: string = "", description: string = ""): boolean {
  const combined = `${keywords.join(" ")} ${title} ${description}`.toLowerCase();
  const earthKeywords = [
    "earth",
    "satellite",
    "modis",
    "landsat",
    "orbit",
    "terra",
    "aqua",
    "viirs",
    "iss",
    "astronaut photography",
    "hurricane",
    "typhoon",
    "glacier",
    "wildfire",
    "deforestation",
    "atmosphere",
    "ocean",
    "land cover",
    "surface",
    "coastline",
  ];
  return earthKeywords.some((kw) => combined.includes(kw));
}

export async function searchNasaImages(params: {
  q: string;
  page?: number;
  mediaType?: string;
}): Promise<{ items: NasaImageItem[]; totalHits: number; page: number }> {
  const { q, page = 1, mediaType = "image" } = params;

  const url = new URL(`${NASA_IMAGES_API_BASE}/search`);
  url.searchParams.set("q", q);
  url.searchParams.set("media_type", mediaType === "all" ? "image" : mediaType);
  url.searchParams.set("page", page.toString());

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "SatQueryAI/1.0 (Earth Observation Intelligence)",
    },
    next: { revalidate: 3600 }, // Cache search queries for 1 hour
  });

  if (!response.ok) {
    throw new Error(`NASA Image API responded with status ${response.status}: ${response.statusText}`);
  }

  const json = await response.json();
  const collection = json.collection || {};
  const rawItems: RawNasaCollectionItem[] = collection.items || [];
  const totalHits: number = collection.metadata?.total_hits || rawItems.length;

  const items: NasaImageItem[] = [];

  for (const item of rawItems) {
    const data = item.data?.[0];
    if (!data) continue;

    const previewLink = item.links?.find((l) => l.rel === "preview" || l.render === "image")?.href;
    if (!previewLink) continue;

    const keywords = data.keywords || [];
    const title = data.title || "Untitled NASA Asset";
    const description = data.description || "";

    items.push({
      nasaId: data.nasa_id,
      title,
      description,
      center: data.center,
      dateCreated: data.date_created || new Date().toISOString(),
      keywords,
      mediaType: (data.media_type as "image") || "image",
      previewUrl: previewLink,
      photographer: data.photographer,
      secondaryCreator: data.secondary_creator,
      isEarthObservation: isEarthObservationItem(keywords, title, description),
    });
  }

  return { items, totalHits, page };
}
