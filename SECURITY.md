# Security Architecture & Policies • SatQuery AI

## Threat Model & Security Posture

SatQuery AI is designed to process user-supplied satellite imagery, geolocated coordinates, and AI vision queries.

### 1. Data Isolation & Row Level Security (RLS)
- Every database table (`profiles`, `conversations`, `messages`, `uploaded_images`, `saved_library_items`, `analysis_runs`) enforces PostgreSQL Row Level Security (RLS).
- Policies strictly evaluate `auth.uid() = user_id`.
- Users cannot enumerate, query, update, or delete another user's conversations or attachments by altering identifiers in HTTP requests or URLs.

### 2. Private Storage Buckets & Time-Limited Signed URLs
- User uploads are placed into the private `satellite-images` Supabase Storage bucket under `${user.id}/`.
- Storage RLS rules disallow access to files outside the authenticated user's own prefix.
- Direct public URLs are disabled by default. Access is granted exclusively via short-lived signed URLs (1 hour expiration) generated on the server.

### 3. Image Validation & Integrity (SHA-256 Provenance)
- Supported formats are restricted to raster images: `image/jpeg`, `image/png`, `image/webp`, and `image/tiff`.
- File uploads are capped at 25MB.
- File names are sanitized against path traversal (`..`, `/`, `\`).
- Cryptographic SHA-256 hashes are computed for every uploaded file and stored in the database for non-repudiation and auditability.

### 4. Secret Isolation
- `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and other cloud credentials are kept exclusively server-side.
- Client bundles never receive or reference backend API secrets.
- `.gitignore` explicitly prevents accidental commits of `.env`, `.env.local`, and other secret files.

### 5. Input Sanitization & Anti-Injection
- User prompts and assistant responses are sanitized to strip `<script>`, `<iframe>`, and JavaScript scheme injections.
- Server API routes validate all incoming payloads using Zod schemas (`chatRequestSchema`, `nasaSearchQuerySchema`).

### 6. Rate Limiting & DoS Mitigation
- API routes (`/api/chat`) feature an in-memory sliding-window rate limiter (default 20 requests per minute per IP address).
- In production, upstream rate limiters (e.g., Cloudflare, Upstash Redis) should be layered over the edge endpoints.

### 7. Reporting a Vulnerability
To report a security vulnerability or incident, please contact security@satquery.ai with reproduction details.
