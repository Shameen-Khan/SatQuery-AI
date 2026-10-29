import { describe, it, expect } from "vitest";
import {
  chatRequestSchema,
  validateUploadedImageFile,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_UPLOAD_SIZE_BYTES,
  nasaSearchQuerySchema,
  authCredentialsSchema,
} from "@/lib/validation";

describe("Validation Layer Tests", () => {
  describe("Upload Validation", () => {
    it("should accept valid satellite image formats (JPEG, PNG, WebP, TIFF)", () => {
      for (const mime of ALLOWED_IMAGE_MIME_TYPES) {
        const result = validateUploadedImageFile({
          type: mime,
          size: 1024 * 1024,
          name: "scene.jpg",
        });
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      }
    });

    it("should reject disallowed image MIME types (e.g. svg, exe, html)", () => {
      const result = validateUploadedImageFile({
        type: "image/svg+xml",
        size: 500,
        name: "test.svg",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Unsupported file type");
    });

    it("should reject files exceeding 25MB maximum limit", () => {
      const result = validateUploadedImageFile({
        type: "image/jpeg",
        size: MAX_UPLOAD_SIZE_BYTES + 1024,
        name: "large_granule.jpg",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("exceeds maximum limit");
    });

    it("should block path traversal attempts in filenames", () => {
      const result = validateUploadedImageFile({
        type: "image/png",
        size: 1024,
        name: "../../etc/passwd.png",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("invalid characters");
    });
  });

  describe("Chat Request Validation", () => {
    it("should validate a valid chat request payload", () => {
      const validPayload = {
        message: "Analyze the coastline erosion in this scene.",
        attachments: [],
      };
      const result = chatRequestSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("should reject empty questions", () => {
      const invalidPayload = {
        message: "",
        attachments: [],
      };
      const result = chatRequestSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it("should validate attached image provenance structure", () => {
      const payloadWithAtt = {
        message: "Identify visible canals.",
        attachments: [
          {
            id: "att-1",
            filename: "sentinel_canal.jpg",
            url: "https://example.com/image.jpg",
            mimeType: "image/jpeg",
            sizeBytes: 102400,
            provenance: {
              sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
              verified: true,
              computedAt: new Date().toISOString(),
              sourceProvider: "user_upload",
            },
          },
        ],
      };
      const result = chatRequestSchema.safeParse(payloadWithAtt);
      expect(result.success).toBe(true);
    });
  });

  describe("NASA Search Query Validation", () => {
    it("should validate NASA search keyword and default page", () => {
      const result = nasaSearchQuerySchema.safeParse({ q: "wildfire" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.mediaType).toBe("image");
      }
    });

    it("should reject empty search query", () => {
      const result = nasaSearchQuerySchema.safeParse({ q: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("Auth Credentials Validation", () => {
    it("should require a valid email and minimum 6 characters password", () => {
      const valid = authCredentialsSchema.safeParse({
        email: "scientist@nasa.gov",
        password: "securepassword123",
      });
      expect(valid.success).toBe(true);

      const invalidEmail = authCredentialsSchema.safeParse({
        email: "not-an-email",
        password: "securepassword123",
      });
      expect(invalidEmail.success).toBe(false);

      const shortPassword = authCredentialsSchema.safeParse({
        email: "test@nasa.gov",
        password: "123",
      });
      expect(shortPassword.success).toBe(false);
    });
  });
});
