import { describe, it, expect } from "vitest";
import { isEarthObservationItem } from "@/lib/nasa/api";
import { NASA_GIBS_LAYERS, getDefaultGibsDate } from "@/lib/nasa/gibs";

describe("NASA & Earth Observation Tests", () => {
  describe("NASA Asset Classification", () => {
    it("should correctly classify Earth observation satellite scenes", () => {
      const isEO = isEarthObservationItem(
        ["Earth", "MODIS", "Terra", "wildfire"],
        "MODIS Captures California Wildfire Smoke",
        "Terra satellite image of northern California"
      );
      expect(isEO).toBe(true);
    });

    it("should identify non-Earth astronomical assets", () => {
      const isEO = isEarthObservationItem(
        ["Mars", "Curiosity", "rover", "Gale Crater"],
        "Curiosity Mastcam view of Mars outcrop",
        "Mast Camera image from Mars Science Laboratory"
      );
      expect(isEO).toBe(false);
    });
  });

  describe("NASA GIBS Overlays", () => {
    it("should provide valid WMTS tile URL templates for supported layers", () => {
      expect(NASA_GIBS_LAYERS.length).toBeGreaterThanOrEqual(4);

      for (const layer of NASA_GIBS_LAYERS) {
        expect(layer.urlTemplate).toContain("{time}");
        expect(layer.urlTemplate).toContain("{z}/{y}/{x}");
        expect(layer.attribution).toContain("NASA");
        expect(layer.tileMatrixSet).toBeDefined();
        expect(layer.maxZoom).toBeGreaterThan(0);
      }
    });

    it("should generate a valid default date (yesterday) for GIBS WMTS synthesis", () => {
      const date = getDefaultGibsDate();
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
