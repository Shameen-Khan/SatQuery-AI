import { describe, it, expect } from "vitest";
import {
  computeSha256,
  createProvenanceRecord,
  SCIENTIFIC_UNCERTAINTY_DISCLAIMER,
  PHYSICAL_CONSTRAINTS_NOTE,
} from "@/lib/provenance";

describe("Cryptographic Provenance Tests", () => {
  it("should compute deterministic SHA-256 hash for raw data", async () => {
    const textData = new TextEncoder().encode("SatQuery AI Earth Observation Sentinel Image");
    const hash = await computeSha256(textData);

    expect(typeof hash).toBe("string");
    expect(hash.length).toBe(64);

    // Should be deterministic
    const hash2 = await computeSha256(textData);
    expect(hash).toBe(hash2);
  });

  it("should create structured provenance record with ISO timestamp and provider", () => {
    const testHash = "a".repeat(64);
    const record = createProvenanceRecord({
      sha256: testHash,
      sourceProvider: "nasa_library",
      providerAssetId: "PIA12345",
      acquisitionDate: "2024-05-12",
      sensor: "MODIS Terra",
      spatialResolution: "250m",
    });

    expect(record.sha256).toBe(testHash);
    expect(record.verified).toBe(true);
    expect(record.sourceProvider).toBe("nasa_library");
    expect(record.providerAssetId).toBe("PIA12345");
    expect(record.sensor).toBe("MODIS Terra");
    expect(record.spatialResolution).toBe("250m");
    expect(new Date(record.computedAt).getTime()).not.toBeNaN();
  });

  it("should include scientific disclaimers on remote sensing limitations", () => {
    expect(SCIENTIFIC_UNCERTAINTY_DISCLAIMER).toContain("remote sensing measurements");
    expect(PHYSICAL_CONSTRAINTS_NOTE).toContain("Ground Sample Distance");
  });
});
