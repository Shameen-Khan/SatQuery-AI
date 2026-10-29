// ==============================================================================
// SatQuery AI - Core TypeScript Types
// ==============================================================================

export type Role = "user" | "assistant" | "system";

export interface Profile {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  preferredTheme: "dark" | "light";
  createdAt: string;
  updatedAt: string;
}

export interface AreaOfInterest {
  type: "Point" | "BoundingBox" | "Polygon";
  coordinates: [number, number] | [number, number, number, number] | number[][];
  label?: string;
  zoom?: number;
}

export interface AttachmentProvenance {
  sha256: string;
  verified: boolean;
  computedAt: string;
  sourceProvider: "user_upload" | "nasa_library" | "nasa_gibs" | "sentinel" | "landsat";
  providerAssetId?: string;
  acquisitionDate?: string;
  sensor?: string;
  spatialResolution?: string;
}

export interface Attachment {
  id: string;
  filename: string;
  storagePath?: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  provenance: AttachmentProvenance;
  aoi?: AreaOfInterest;
}

export interface Citation {
  provider: string;
  title: string;
  sourceUrl: string;
  mediaId?: string;
  date?: string;
  license?: string;
  notes?: string;
}

export interface AnalysisMetadata {
  model: string;
  executionMs: number;
  uncertaintyNotes?: string;
  observations?: string[];
  inferences?: string[];
  caveats?: string[];
  tokenCount?: number;
  timestamp: string;
}

export interface Message {
  id: string;
  conversationId: string;
  userId: string;
  role: Role;
  content: string;
  attachments?: Attachment[];
  citations?: Citation[];
  metadata?: AnalysisMetadata;
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  aoi?: AreaOfInterest | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  messageCount?: number;
}

export interface NasaImageItem {
  nasaId: string;
  title: string;
  description: string;
  center?: string;
  dateCreated: string;
  keywords: string[];
  mediaType: "image" | "video" | "audio";
  previewUrl: string;
  originalUrl?: string;
  photographer?: string;
  secondaryCreator?: string;
  isEarthObservation: boolean;
}

export interface GibsLayer {
  id: string;
  title: string;
  subtitle: string;
  format: "jpg" | "png";
  tileMatrixSet: string;
  maxZoom: number;
  defaultDate?: string;
  timeResolution: "daily" | "subdaily" | "monthly" | "static";
  attribution: string;
  description: string;
  category: "True Color" | "False Color" | "Atmosphere" | "Thermal & Night" | "Vegetation & Land";
  urlTemplate: string;
}

export interface ServiceStatus {
  service: "supabase_auth" | "supabase_db" | "supabase_storage" | "openai" | "nasa_api";
  name: string;
  isConfigured: boolean;
  status: "operational" | "missing_config" | "error";
  message: string;
  docsUrl?: string;
}
