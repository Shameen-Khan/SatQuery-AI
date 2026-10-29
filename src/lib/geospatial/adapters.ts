// ==============================================================================
// SatQuery AI - Earth Observation Provider Adapter Architecture
// Standardized interface for querying, fetching metadata, and rendering satellite layers
// ==============================================================================

export interface EOProviderCapabilities {
  supportsRealTimeOverlays: boolean;
  supportsOpticalRGB: boolean;
  supportsMultispectralBands: boolean;
  supportsFreeSearch: boolean;
  requiresApiKey: boolean;
  spatialResolutionRange: string;
  temporalCoverage: string;
}

export interface EOProviderInfo {
  id: string;
  name: string;
  organization: string;
  status: "active" | "requires_configuration" | "planned";
  website: string;
  docsUrl: string;
  authRequirements: string;
  capabilities: EOProviderCapabilities;
  supportedConstellations: string[];
}

export interface EOProviderAdapter {
  info: EOProviderInfo;
  isAvailable(): boolean;
  searchImagery?(query: { bbox?: [number, number, number, number]; dateRange?: [string, string]; maxCloudCover?: number }): Promise<unknown[]>;
}

/**
 * 1. NASA GIBS / EOSDIS Adapter (Operational out of the box - No auth required)
 */
export const NasaGibsAdapter: EOProviderAdapter = {
  info: {
    id: "nasa-gibs",
    name: "NASA GIBS / EOSDIS",
    organization: "NASA Earth Science Data and Information System",
    status: "active",
    website: "https://earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs",
    docsUrl: "https://nasa-gibs.github.io/gibs-api-docs/",
    authRequirements: "None for standard WMTS/WMS tile requests. Optional Earthdata Login for direct raw granule downloads.",
    capabilities: {
      supportsRealTimeOverlays: true,
      supportsOpticalRGB: true,
      supportsMultispectralBands: true,
      supportsFreeSearch: true,
      requiresApiKey: false,
      spatialResolutionRange: "250m - 2km",
      temporalCoverage: "2000 - Present (Near real-time 3hr latency)",
    },
    supportedConstellations: ["Terra (MODIS)", "Aqua (MODIS/AIRS)", "Suomi NPP (VIIRS)", "NOAA-20 (VIIRS)"],
  },
  isAvailable: () => true,
};

/**
 * 2. NASA Image & Video Library Adapter (Operational - Public API)
 */
export const NasaLibraryAdapter: EOProviderAdapter = {
  info: {
    id: "nasa-library",
    name: "NASA Image & Video Archive",
    organization: "National Aeronautics and Space Administration",
    status: "active",
    website: "https://images.nasa.gov",
    docsUrl: "https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf",
    authRequirements: "None required. Public REST API endpoint at https://images-api.nasa.gov",
    capabilities: {
      supportsRealTimeOverlays: false,
      supportsOpticalRGB: true,
      supportsMultispectralBands: false,
      supportsFreeSearch: true,
      requiresApiKey: false,
      spatialResolutionRange: "Variable (Archival imagery & high-res astronaut photography)",
      temporalCoverage: "1958 - Present",
    },
    supportedConstellations: ["International Space Station (ISS)", "Landsat (Historic)", "Apollo", "Earth Probes"],
  },
  isAvailable: () => true,
};

/**
 * 3. ESA Copernicus / Sentinel-2 Adapter (Requires Copernicus Data Space Ecosystem credentials)
 */
export const CopernicusSentinelAdapter: EOProviderAdapter = {
  info: {
    id: "copernicus-sentinel",
    name: "ESA Copernicus Sentinel-2",
    organization: "European Space Agency (ESA) / European Commission",
    status: "requires_configuration",
    website: "https://dataspace.copernicus.eu/",
    docsUrl: "https://documentation.dataspace.copernicus.eu/APIs/OData.html",
    authRequirements: "OAuth2 Client ID and Secret obtained from Copernicus Data Space Ecosystem (CDSE) account.",
    capabilities: {
      supportsRealTimeOverlays: true,
      supportsOpticalRGB: true,
      supportsMultispectralBands: true,
      supportsFreeSearch: true,
      requiresApiKey: true,
      spatialResolutionRange: "10m, 20m, 60m (MSI Sensor 13 spectral bands)",
      temporalCoverage: "2015 - Present (5-day revisit rate)",
    },
    supportedConstellations: ["Sentinel-2A", "Sentinel-2B", "Sentinel-1 (SAR)"],
  },
  isAvailable: () => Boolean(process.env.COPERNICUS_CLIENT_ID && process.env.COPERNICUS_CLIENT_SECRET),
};

/**
 * 4. USGS Landsat (M2M / EarthExplorer API)
 */
export const UsgsLandsatAdapter: EOProviderAdapter = {
  info: {
    id: "usgs-landsat",
    name: "USGS Landsat Collection 2",
    organization: "United States Geological Survey (USGS)",
    status: "requires_configuration",
    website: "https://www.usgs.gov/landsat-missions",
    docsUrl: "https://m2m.cr.usgs.gov/api/docs/json/",
    authRequirements: "USGS EROS Registration System (ERS) account token generated via Machine-to-Machine (M2M) API.",
    capabilities: {
      supportsRealTimeOverlays: false,
      supportsOpticalRGB: true,
      supportsMultispectralBands: true,
      supportsFreeSearch: true,
      requiresApiKey: true,
      spatialResolutionRange: "30m Multispectral, 15m Panchromatic",
      temporalCoverage: "1972 - Present (Landsat 1 through 9 continuous archive)",
    },
    supportedConstellations: ["Landsat 8 (OLI/TIRS)", "Landsat 9 (OLI-2/TIRS-2)", "Landsat 7 (ETM+)"],
  },
  isAvailable: () => Boolean(process.env.USGS_M2M_API_KEY),
};

/**
 * 5. Google Maps Satellite Basemap Adapter
 */
export const GoogleMapsAdapter: EOProviderAdapter = {
  info: {
    id: "google-maps",
    name: "Google Maps Satellite Visualization",
    organization: "Google Cloud Platform",
    status: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? "active" : "requires_configuration",
    website: "https://developers.google.com/maps/documentation/javascript",
    docsUrl: "https://developers.google.com/maps/documentation/javascript/overview",
    authRequirements: "Google Cloud API key with Maps JavaScript API enabled.",
    capabilities: {
      supportsRealTimeOverlays: false,
      supportsOpticalRGB: true,
      supportsMultispectralBands: false,
      supportsFreeSearch: false,
      requiresApiKey: true,
      spatialResolutionRange: "Sub-meter commercial composite (non-downloadable)",
      temporalCoverage: "Composite basemap",
    },
    supportedConstellations: ["Maxar", "Airbus", "Commercial Orthophoto Mosaic"],
  },
  isAvailable: () => Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY),
};

export const ALL_EO_PROVIDERS: EOProviderAdapter[] = [
  NasaGibsAdapter,
  NasaLibraryAdapter,
  CopernicusSentinelAdapter,
  UsgsLandsatAdapter,
  GoogleMapsAdapter,
];
