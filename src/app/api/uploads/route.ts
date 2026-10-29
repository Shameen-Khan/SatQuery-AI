import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, getAuthenticatedUser } from "@/lib/supabase/server";
import { validateUploadedImageFile } from "@/lib/validation";
import { sanitizeFilename } from "@/lib/security";
import { computeSha256, createProvenanceRecord } from "@/lib/provenance";
import { Attachment } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided in upload request" }, { status: 400 });
    }

    // 1. File Validation
    const validation = validateUploadedImageFile({
      type: file.type,
      size: file.size,
      name: file.name,
    });

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const safeFilename = sanitizeFilename(file.name);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Cryptographic Provenance Hash (SHA-256)
    const sha256 = await computeSha256(arrayBuffer);

    // 3. User Authorization & Supabase Storage
    const user = await getAuthenticatedUser();
    const supabase = createServerSupabaseClient();

    let storagePath = "";
    let fileUrl = "";

    if (supabase && user) {
      const timestamp = Date.now();
      storagePath = `${user.id}/${timestamp}-${safeFilename}`;

      // Upload to private Supabase Storage bucket
      const { error: uploadError } = await supabase.storage
        .from("satellite-images")
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Supabase storage error:", uploadError);
        // Fall back to base64 preview if bucket policy is being configured
        fileUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
      } else {
        // Create short-lived signed URL (3600 seconds = 1 hour)
        const { data: signedUrlData } = await supabase.storage
          .from("satellite-images")
          .createSignedUrl(storagePath, 3600);

        fileUrl = signedUrlData?.signedUrl || "";
      }

      // Record in uploaded_images database table
      await supabase.from("uploaded_images").insert({
        user_id: user.id,
        storage_path: storagePath,
        filename: safeFilename,
        mime_type: file.type,
        size_bytes: file.size,
        sha256,
        source: "user_upload",
      });
    } else {
      // In offline / unconfigured demo mode, convert to data URI for direct OpenAI vision preview
      fileUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
      storagePath = `local-memory/${safeFilename}`;
    }

    const attachment: Attachment = {
      id: "att-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      filename: safeFilename,
      storagePath,
      url: fileUrl,
      mimeType: file.type,
      sizeBytes: file.size,
      provenance: createProvenanceRecord({
        sha256,
        sourceProvider: "user_upload",
      }),
    };

    return NextResponse.json({
      success: true,
      attachment,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process image upload." },
      { status: 500 }
    );
  }
}
