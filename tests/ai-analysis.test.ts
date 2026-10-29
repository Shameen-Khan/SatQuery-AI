import { describe, it, expect } from "vitest";
import { SYSTEM_PROMPT, analyzeSatelliteImage } from "@/lib/openai";

describe("AI Analysis & Earth Observation Guardrails", () => {
  it("system prompt should explicitly instruct distinguishing observations from inferences", () => {
    expect(SYSTEM_PROMPT).toContain("Direct Observations");
    expect(SYSTEM_PROMPT).toContain("Inferences");
  });

  it("system prompt should mandate abstention on insufficient resolution", () => {
    expect(SYSTEM_PROMPT).toContain("insufficient");
    expect(SYSTEM_PROMPT).toContain("Never fabricate");
  });

  it("should gracefully handle missing OpenAI API key with actionable setup instructions and remote sensing analysis", async () => {
    // Calling analyzeSatelliteImage without active key returns scientific Earth observation analysis
    const result = await analyzeSatelliteImage({
      question: "What is the land cover of this delta?",
    });

    expect(result.content).toContain("Earth Observation Scene Analysis");
    expect(result.content).toContain("OPENAI_API_KEY");
    expect(result.metadata.model).toBe("SatQuery-EO-Kernel");
    expect(result.metadata.executionMs).toBeGreaterThanOrEqual(0);
  });
});
