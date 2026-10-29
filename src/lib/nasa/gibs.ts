import { GibsLayer } from "@/types";

/**
 * Curated list of high-value Earth Observation NASA GIBS WMTS layers.
 * Using the standard EPSG:3857 WebMercator projection supported by Leaflet.
 */
export const NASA_GIBS_LAYERS: GibsLayer[] = [
  {
    id: "MODIS_Terra_CorrectedReflectance_TrueColor",
    title: "MODIS Terra True Color",
    subtitle: "250m Spatial Resolution • Daily Optical Imagery",
    format: "jpg",
    tileMatrixSet: "GoogleMapsCompatible_Level9",
    maxZoom: 9,
    timeResolution: "daily",
    category: "True Color",
    attribution: "NASA Global Imagery Browse Services (GIBS) / EOSDIS",
    description:
      "Natural color optical imagery from the MODIS sensor aboard NASA's Terra satellite. Ideal for monitoring cloud fronts, storms, wildfire plumes, and snow cover.",
    urlTemplate:
      "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/{time}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg",
  },
  {
    id: "VIIRS_SNPP_DayNightBand_ENCC",
    title: "VIIRS Day / Night Band (Night Lights)",
    subtitle: "750m Resolution • Sensor Radiance & City Lights",
    format: "png",
    tileMatrixSet: "GoogleMapsCompatible_Level8",
    maxZoom: 8,
    timeResolution: "daily",
    category: "Thermal & Night",
    attribution: "NASA GIBS / Suomi NPP VIIRS",
    description:
      "Measures nocturnal low-light visible and near-infrared emissions. Reveals human settlement patterns, power grid status, ship lighting, and gas flares.",
    urlTemplate:
      "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_DayNightBand_ENCC/default/{time}/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png",
  },
  {
    id: "MODIS_Terra_SurfaceReflectance_Bands721",
    title: "MODIS False Color (Bands 7-2-1)",
    subtitle: "Bands 7 (SWIR), 2 (NIR), 1 (Red) • Burn & Flood Analysis",
    format: "jpg",
    tileMatrixSet: "GoogleMapsCompatible_Level9",
    maxZoom: 9,
    timeResolution: "daily",
    category: "False Color",
    attribution: "NASA EOSDIS / Terra MODIS",
    description:
      "Shortwave infrared false-color composite. Deep water appears almost black, healthy vegetation vibrant green, burn scars vivid red, and ice bright cyan.",
    urlTemplate:
      "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_SurfaceReflectance_Bands721/default/{time}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg",
  },
  {
    id: "AIRS_CO_Total_Column_Day",
    title: "AIRS Atmospheric Carbon Monoxide",
    subtitle: "Global Daily Tropospheric CO Trace Gas",
    format: "png",
    tileMatrixSet: "GoogleMapsCompatible_Level6",
    maxZoom: 6,
    timeResolution: "daily",
    category: "Atmosphere",
    attribution: "NASA EOSDIS / Aqua AIRS",
    description:
      "Atmospheric Infrared Sounder daily measurement of total column carbon monoxide, tracing wildfire emissions and urban industrial plumes.",
    urlTemplate:
      "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/AIRS_CO_Total_Column_Day/default/{time}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png",
  },
];

/**
 * Standard basemaps for Leaflet
 */
export const BASEMAP_PROVIDERS = [
  {
    id: "osm",
    name: "OpenStreetMap Cartographic",
    type: "osm",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
    maxZoom: 19,
  },
  {
    id: "esri-sat",
    name: "Esri World Imagery (Satellite)",
    type: "satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    maxZoom: 19,
  },
  {
    id: "carto-dark",
    name: "CartoDB Dark Matter",
    type: "dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; <a href='https://carto.com/'>CARTO</a>",
    maxZoom: 19,
  },
];

/**
 * Helper to get a valid YYYY-MM-DD date string for GIBS (defaults to yesterday to ensure full planetary swath synthesis)
 */
export function getDefaultGibsDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1); // Yesterday
  return date.toISOString().split("T")[0];
}
