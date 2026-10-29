import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, getAuthenticatedUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    const supabase = createServerSupabaseClient();

    if (!supabase || !user) {
      return NextResponse.json({ items: [], unauthenticated: true });
    }

    const { data, error } = await supabase
      .from("saved_library_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data || [] });
  } catch (error) {
    console.error("Fetch saved items error:", error);
    return NextResponse.json({ error: "Failed to fetch saved items" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const supabase = createServerSupabaseClient();

    if (!supabase || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { nasaId, title, description, thumbnailUrl, assetUrl, dateCreated, mediaType } = body;

    if (!nasaId || !title || !thumbnailUrl) {
      return NextResponse.json({ error: "Missing required item fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("saved_library_items")
      .upsert(
        {
          user_id: user.id,
          nasa_id: nasaId,
          title,
          description: description || "",
          thumbnail_url: thumbnailUrl,
          asset_url: assetUrl || thumbnailUrl,
          media_type: mediaType || "image",
          date_created: dateCreated || new Date().toISOString(),
        },
        { onConflict: "user_id, nasa_id" }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: data });
  } catch (error) {
    console.error("Save item error:", error);
    return NextResponse.json({ error: "Failed to save library item" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const supabase = createServerSupabaseClient();

    if (!supabase || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const nasaId = searchParams.get("nasaId");

    if (!nasaId) {
      return NextResponse.json({ error: "nasaId parameter required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("saved_library_items")
      .delete()
      .eq("user_id", user.id)
      .eq("nasa_id", nasaId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete saved item error:", error);
    return NextResponse.json({ error: "Failed to remove saved item" }, { status: 500 });
  }
}
