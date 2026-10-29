import { NextRequest, NextResponse } from "next/server";
import { chatRequestSchema } from "@/lib/validation";
import { checkRateLimit, sanitizeText } from "@/lib/security";
import { createServerSupabaseClient, getAuthenticatedUser } from "@/lib/supabase/server";
import { analyzeSatelliteImage } from "@/lib/openai";
import { saveLocalConversation, saveLocalMessage, getLocalConversation } from "@/lib/storage/local-store";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const ip = request.headers.get("x-forwarded-for") || "local-client";
    const rateCheck = checkRateLimit(`chat-${ip}`, 30, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many analysis requests. Please retry in ${Math.ceil(rateCheck.resetMs / 1000)}s.` },
        { status: 429 }
      );
    }

    // 2. Validate Payload with Zod
    const body = await request.json();
    const parseResult = chatRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { message, aoi } = parseResult.data;
    const attachments = (parseResult.data.attachments || []) as unknown as import("@/types").Attachment[];
    let conversationId = parseResult.data.conversationId;

    // 3. User Authentication
    const user = await getAuthenticatedUser();
    const supabase = createServerSupabaseClient();

    // 4. Local File-backed Persistence (Zero-config local mode)
    if (!supabase || !user) {
      const sanitizedQuestion = sanitizeText(message);
      const aoiText = aoi ? `Type: ${aoi.type}, Coordinates: ${JSON.stringify(aoi.coordinates)}` : undefined;

      // Ensure conversation exists or initialize it
      const activeConvId = conversationId || "conv-" + Date.now();
      const existingConv = await getLocalConversation(activeConvId);

      if (!existingConv) {
        const summaryTitle = message.length > 50 ? `${message.slice(0, 47)}...` : message;
        await saveLocalConversation({
          id: activeConvId,
          userId: "local-user",
          title: summaryTitle,
          aoi: (aoi as import("@/types").AreaOfInterest) || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      // 1. Save user message
      const userMessageRecord = {
        id: "msg-user-" + Date.now(),
        conversationId: activeConvId,
        userId: "local-user",
        role: "user" as const,
        content: sanitizedQuestion,
        attachments: attachments || [],
        createdAt: new Date().toISOString(),
      };
      await saveLocalMessage(userMessageRecord);

      // 2. Fetch recent conversation history for context
      const existing = await getLocalConversation(activeConvId);
      const history = (existing?.messages || []).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      // 3. Execute AI Analysis
      const aiResponse = await analyzeSatelliteImage({
        question: sanitizedQuestion,
        attachments,
        conversationHistory: history,
        aoiText,
      });

      // 4. Save assistant response
      const assistantMessageRecord = {
        id: "msg-assistant-" + Date.now(),
        conversationId: activeConvId,
        userId: "satquery-ai",
        role: "assistant" as const,
        content: aiResponse.content,
        metadata: aiResponse.metadata,
        createdAt: new Date().toISOString(),
      };
      await saveLocalMessage(assistantMessageRecord);

      return NextResponse.json({
        conversationId: activeConvId,
        userMessage: userMessageRecord,
        assistantMessage: assistantMessageRecord,
      });
    }

    // 5. Database-backed Workflow (Supabase authenticated user)
    // Create new conversation if none provided
    if (!conversationId) {
      const summaryTitle = message.length > 50 ? `${message.slice(0, 47)}...` : message;
      const { data: convData, error: convError } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          title: summaryTitle,
          aoi: (aoi as import("@/types").AreaOfInterest) || null,
        })
        .select()
        .single();

      if (convError || !convData) {
        return NextResponse.json({ error: "Failed to initialize conversation in database" }, { status: 500 });
      }
      conversationId = convData.id;
    } else {
      // Verify conversation ownership
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("id")
        .eq("id", conversationId)
        .eq("user_id", user.id)
        .single();

      if (!existingConv) {
        return NextResponse.json({ error: "Conversation not found or unauthorized" }, { status: 404 });
      }
    }

    // 6. Fetch previous conversation messages for context
    const { data: history } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(8);

    // 7. Save user message to database
    const sanitizedQuestion = sanitizeText(message);
    const { data: userMessageRecord, error: userMsgError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: "user",
        content: sanitizedQuestion,
        attachments: attachments || [],
      })
      .select()
      .single();

    if (userMsgError) {
      return NextResponse.json({ error: "Failed to persist user message" }, { status: 500 });
    }

    // 8. Execute AI Analysis
    const aoiText = aoi ? `Type: ${aoi.type}, Coordinates: ${JSON.stringify(aoi.coordinates)}` : undefined;
    const aiResponse = await analyzeSatelliteImage({
      question: sanitizedQuestion,
      attachments,
      conversationHistory: (history as Array<{ role: "user" | "assistant"; content: string }>) || [],
      aoiText,
    });

    // 9. Save assistant message to database
    const { data: assistantMessageRecord, error: asstMsgError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: "assistant",
        content: aiResponse.content,
        metadata: aiResponse.metadata,
      })
      .select()
      .single();

    if (asstMsgError) {
      return NextResponse.json({ error: "Failed to persist assistant response" }, { status: 500 });
    }

    // 10. Update conversation timestamp
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    // 11. Record analysis audit log
    await supabase.from("analysis_runs").insert({
      conversation_id: conversationId,
      message_id: assistantMessageRecord.id,
      user_id: user.id,
      model: aiResponse.metadata.model,
      prompt: sanitizedQuestion,
      image_sha256: attachments?.[0]?.provenance?.sha256 || null,
      confidence_notes: aiResponse.metadata.uncertaintyNotes || null,
      execution_ms: aiResponse.metadata.executionMs,
    });

    return NextResponse.json({
      conversationId,
      userMessage: userMessageRecord,
      assistantMessage: assistantMessageRecord,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred processing your satellite imagery request." },
      { status: 500 }
    );
  }
}
