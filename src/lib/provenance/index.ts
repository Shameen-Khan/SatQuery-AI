import { AttachmentProvenance } from "@/types";

/**
 * Computes SHA-256 hash of an ArrayBuffer or Uint8Array in browser or server runtime.
 */
export async function computeSha256(data: ArrayBuffer | Uint8Array): Promise<string> {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);

  if (typeof crypto !== "undefined" && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", bytes as any);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // Fallback for Node.js environments
  const nodeCrypto = await import("crypto");
  const hash = nodeCrypto.createHash("sha256");
  hash.update(Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength));
  return hash.digest("hex");
}

/**
 * Creates an authoritative provenance metadata object for an image.
 */
export function createProvenanceRecord(params: {
  sha256: string;
  sourceProvider: AttachmentProvenance["sourceProvider"];
  providerAssetId?: string;
  acquisitionDate?: string;
  sensor?: string;
  spatialResolution?: string;
}): AttachmentProvenance {
  return {
    sha256: params.sha256,
    verified: true,
    computedAt: new Date().toISOString(),
    sourceProvider: params.sourceProvider,
    providerAssetId: params.providerAssetId,
    acquisitionDate: params.acquisitionDate,
    sensor: params.sensor,
    spatialResolution: params.spatialResolution,
  };
}

/**
 * Remote Sensing Uncertainty & Scientific Disclaimer constants
 */
export const SCIENTIFIC_UNCERTAINTY_DISCLAIMER =
  "Visual AI estimates are indicative observations and not a substitute for radiometrically calibrated, ground-truthed remote sensing measurements (such as official USGS Landsat Level-2 Surface Reflectance or ESA Copernicus Sentinel-2 Level-2A BOA products).";

export const PHYSICAL_CONSTRAINTS_NOTE =
  "Exact surface areas, canopy heights, or spectral band ratios cannot be measured without calibrated sensor metadata, spatial reference systems (CRS/EPSG), and known Ground Sample Distance (GSD).";
