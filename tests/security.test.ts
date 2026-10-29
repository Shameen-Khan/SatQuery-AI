import { describe, it, expect } from "vitest";
import { sanitizeFilename, sanitizeText, checkRateLimit } from "@/lib/security";

describe("Security & Defense Utilities", () => {
  describe("Filename Sanitization", () => {
    it("should strip directory traversal characters and backslashes", () => {
      const sanitized = sanitizeFilename("../../../etc/shadow.jpg");
      expect(sanitized).not.toContain("..");
      expect(sanitized).not.toContain("/");
      expect(sanitized).toBe("shadow.jpg");
    });

    it("should replace dangerous characters with underscores", () => {
      const sanitized = sanitizeFilename('earth<scene>*?.png');
      expect(sanitized).toBe("earth_scene___.png");
    });
  });

  describe("Text Sanitization", () => {
    it("should strip executable script and iframe tags from user input", () => {
      const raw = 'Analyze this: <script>alert("xss")</script><iframe src="evil.com"></iframe>';
      const clean = sanitizeText(raw);
      expect(clean).not.toContain("<script>");
      expect(clean).not.toContain("alert");
      expect(clean).not.toContain("<iframe>");
    });
  });

  describe("Sliding Window Rate Limiter", () => {
    it("should enforce limits per client identifier", () => {
      const id = "test-client-" + Date.now();
      const limit = 3;

      const r1 = checkRateLimit(id, limit, 5000);
      expect(r1.allowed).toBe(true);

      const r2 = checkRateLimit(id, limit, 5000);
      expect(r2.allowed).toBe(true);

      const r3 = checkRateLimit(id, limit, 5000);
      expect(r3.allowed).toBe(true);

      const r4 = checkRateLimit(id, limit, 5000);
      expect(r4.allowed).toBe(false);
      expect(r4.remaining).toBe(0);
    });
  });
});
