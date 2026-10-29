import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, getAuthenticatedUser } from "@/lib/supabase/server";
import { conversationCreateSchema } from "@/lib/validation";
import { getLocalConversations, saveLocalConversation } from "@/lib/storage/local-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    const user = await getAuthenticatedUser();
    const supabase = createServerSupabaseClient();

    if (!supabase || !user) {
      const localList = await getLocalConversations(query);
      return NextResponse.json({ conversations: localList });
    }

    let dbQuery = supabase
      .from("conversations")
      .select("id, title, aoi, metadata, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (query) {
      dbQuery = dbQuery.ilike("title", `%${query}%`);
    }

    const { data, error } = await dbQuery;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ conversations: data || [] });
  } catch (error) {
    console.error("List conversations error:", error);
    return NextResponse.json({ error: "Failed to retrieve conversations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parseResult = conversationCreateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid conversation parameters" }, { status: 400 });
    }

    const { title, aoi } = parseResult.data;
    const user = await getAuthenticatedUser();
    const supabase = createServerSupabaseClient();

    if (!supabase || !user) {
      const localConv = await saveLocalConversation({
        id: "conv-" + Date.now(),
        userId: "local-user",
        title: title || "New Earth Observation Query",
        aoi: (aoi as import("@/types").AreaOfInterest) || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return NextResponse.json({ conversation: localConv });
    }

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        title,
        aoi: (aoi as import("@/types").AreaOfInterest) || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ conversation: data });
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
