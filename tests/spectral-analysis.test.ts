import { describe, it, expect } from "vitest";
import {
  calculateNDVI,
  calculateVARI,
  calculateGLI,
  executeGeospatialAnalysis,
} from "@/lib/geospatial/analysis";

describe("Geospatial & Spectral Analysis Tests", () => {
  describe("NDVI Calculation", () => {
    it("should calculate correct NDVI for dense vegetation", () => {
      // NIR = 0.75 (high reflection), Red = 0.15 (chlorophyll absorption)
      const res = calculateNDVI(0.75, 0.15);
      expect(res.valid).toBe(true);
      expect(res.value).toBeCloseTo(0.6667, 3);
      expect(res.interpretation).toContain("Dense, healthy photosynthetic canopy");
    });

    it("should calculate correct NDVI for water body (negative value)", () => {
      // Water absorbs NIR strongly: NIR = 0.05, Red = 0.12
      const res = calculateNDVI(0.05, 0.12);
      expect(res.valid).toBe(true);
      expect(res.value).toBeLessThan(0);
      expect(res.interpretation).toContain("water");
    });

    it("should safely handle zero denominator without crashing or NaN", () => {
      const res = calculateNDVI(0, 0);
      expect(res.valid).toBe(false);
      expect(res.value).toBe(0);
      expect(Number.isNaN(res.value)).toBe(false);
    });

    it("should clamp outputs within [-1.0, 1.0] bounds", () => {
      const res1 = calculateNDVI(1.0, 0.0);
      expect(res1.value).toBeLessThanOrEqual(1.0);

      const res2 = calculateNDVI(0.0, 1.0);
      expect(res2.value).toBeGreaterThanOrEqual(-1.0);
    });
  });

  describe("Visible Spectrum Proxies (VARI & GLI)", () => {
    it("should calculate VARI for green canopy pixels", () => {
      // R=60, G=140, B=50
      const res = calculateVARI(60, 140, 50);
      expect(res.valid).toBe(true);
      expect(res.value).toBeGreaterThan(0.2);
      expect(res.interpretation).toContain("green");
    });

    it("should calculate GLI correctly", () => {
      const res = calculateGLI(70, 130, 60);
      expect(res.valid).toBe(true);
      expect(res.value).toBeGreaterThan(0);
    });
  });

  describe("End-to-End Analysis Workflow", () => {
    it("should execute analysis and output structured land cover & metrics", () => {
      const run = executeGeospatialAnalysis({
        analysisType: "vegetation_ndvi",
        dataSource: "Sentinel-2 MSI",
        location: { lat: 30.6, lng: 32.3, name: "Suez Canal" },
        hasMultispectralData: true,
        nirBandValue: 0.8,
        redBandValue: 0.2,
      });

      expect(run.metrics.length).toBeGreaterThan(0);
      expect(run.metrics[0].metricName).toContain("NDVI");
      expect(run.landCoverFractions.vegetationPct).toBeGreaterThan(0);
      expect(run.summary).toContain("Suez Canal");
    });

    it("should clearly label visible proxy when only RGB imagery is available", () => {
      const run = executeGeospatialAnalysis({
        analysisType: "vegetation_ndvi",
        dataSource: "MODIS True Color (RGB)",
        hasMultispectralData: false,
      });

      const variMetric = run.metrics.find((m) => m.metricName.includes("VARI"));
      expect(variMetric).toBeDefined();
      expect(variMetric?.isMultispectral).toBe(false);
      expect(variMetric?.caveat).toContain("multispectral NDVI requires");
    });
  });
});
