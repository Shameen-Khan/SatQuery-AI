import { z } from "zod";

export const chatRequestSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1, "Question cannot be empty").max(4000, "Message cannot exceed 4000 characters"),
  attachments: z
    .array(
      z.object({
        id: z.string(),
        filename: z.string(),
        storagePath: z.string().optional(),
        url: z.string().min(1, "Attachment URL cannot be empty"),
        mimeType: z.string(),
        sizeBytes: z.number().nonnegative(),
        width: z.number().positive().optional(),
        height: z.number().positive().optional(),
        provenance: z.object({
          sha256: z.string().min(16).max(128),
          verified: z.boolean(),
          computedAt: z.string(),
          sourceProvider: z.string().default("user_upload"),
          providerAssetId: z.string().optional(),
          acquisitionDate: z.string().optional(),
          sensor: z.string().optional(),
          spatialResolution: z.string().optional(),
        }),
        aoi: z
          .object({
            type: z.enum(["Point", "BoundingBox", "Polygon"]),
            coordinates: z.any(),
            label: z.string().optional(),
            zoom: z.number().optional(),
          })
          .optional(),
      })
    )
    .optional()
    .default([]),
  aoi: z
    .object({
      type: z.enum(["Point", "BoundingBox", "Polygon"]),
      coordinates: z.any(),
      label: z.string().optional(),
      zoom: z.number().optional(),
    })
    .optional(),
});

export const conversationCreateSchema = z.object({
  title: z.string().min(1).max(120).optional().default("New Earth Observation Query"),
  aoi: z
    .object({
      type: z.enum(["Point", "BoundingBox", "Polygon"]),
      coordinates: z.any(),
      label: z.string().optional(),
      zoom: z.number().optional(),
    })
    .optional(),
});

export const conversationUpdateSchema = z.object({
  title: z.string().min(1, "Title must be at least 1 character").max(120, "Title cannot exceed 120 characters"),
});

export const nasaSearchQuerySchema = z.object({
  q: z.string().min(1, "Search keyword is required").max(100),
  page: z.coerce.number().int().positive().optional().default(1),
  mediaType: z.enum(["image", "video", "audio", "all"]).optional().default("image"),
});

export const authCredentialsSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(1, "Name is required").optional(),
});

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/tiff",
];

export const MAX_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export function validateUploadedImageFile(file: {
  type: string;
  size: number;
  name: string;
}): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported file type (${file.type}). SatQuery AI supports JPEG, PNG, WebP, and TIFF satellite imagery.`,
    };
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of 25MB.`,
    };
  }

  // Sanitize filename to prevent path traversal
  if (file.name.includes("..") || file.name.includes("/") || file.name.includes("\\")) {
    return {
      valid: false,
      error: "Filename contains invalid characters or path traversal elements.",
    };
  }

  return { valid: true };
}
