import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabaseClient";

const allowedModalities = ["audio", "document", "plain text", "images"];

// Normalize modality for database (spaces to underscores)
function normalizeModalityForDB(modality: string): string {
  return modality.replace(/\s+/g, "_");
}

// Denormalize modality from database (map back to frontend format)
function denormalizeModalityFromDB(modality: string): string {
  // Map database format back to frontend format
  const reverseMap: Record<string, string> = {
    "audio": "audio",
    "document": "document",
    "text": "plain text",  // Map "text" back to "plain text"
    "images": "images",
  };
  return reverseMap[modality] || modality.replace(/_/g, " ");
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "userId query param is required" },
      { status: 400 },
    );
  }

  try {
    const supabase = getServerSupabaseClient();
    const { data, error } = await supabase
      .from("ingestion_jobs")
      .select(
        "id, modality, status, source_name, external_url, storage_path, created_at, error_message, metadata",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch jobs error:", error);
      return NextResponse.json(
        { error: "Failed to fetch jobs" },
        { status: 500 },
      );
    }

    // Denormalize modalities for frontend (underscores to spaces, capitalize)
    const jobs = (data ?? []).map(job => ({
      ...job,
      modality: denormalizeModalityFromDB(job.modality),
    }));

    return NextResponse.json({ jobs });
  } catch (err) {
    console.error("Jobs GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      modality,
      sourceName,
      externalUrl,
      storagePath,
      notes,
    } = body ?? {};

    if (typeof userId !== "string" || userId.length === 0) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    if (typeof modality !== "string" || !allowedModalities.includes(modality)) {
      return NextResponse.json(
        { error: "Invalid modality" },
        { status: 400 },
      );
    }

    const supabase = getServerSupabaseClient();
    // Map modality to database format
    // The constraint likely expects: 'audio', 'document', 'text', 'images'
    // (not 'plain_text' or 'plain text')
    const modalityMap: Record<string, string> = {
      "audio": "audio",
      "document": "document",
      "plain text": "text",  // Map "plain text" to "text" for database
      "images": "images",
    };
    
    const dbModality = modalityMap[modality] || modality.toLowerCase().replace(/\s+/g, "_");
    
    const { data, error } = await supabase
      .from("ingestion_jobs")
      .insert({
        user_id: userId,
        modality: dbModality,
        source_name: sourceName ?? null,
        external_url: externalUrl ?? null,
        storage_path: storagePath ?? null,
        metadata: notes ? { notes } : {},
      })
      .select(
        "id, modality, status, source_name, external_url, storage_path, created_at, error_message, metadata",
      )
      .single();

    if (error) {
      console.error("Supabase insert job error:", error);
      return NextResponse.json(
        { error: "Failed to create job" },
        { status: 500 },
      );
    }

    // Denormalize modality for response (underscores to spaces)
    const job = {
      ...data,
      modality: denormalizeModalityFromDB(data.modality),
    };

    // Auto-trigger processing for all modalities (fire and forget)
    const shouldProcess = 
      (modality === "audio" && job.storage_path) ||
      (modality === "document" && job.storage_path) ||
      (modality === "images" && job.storage_path) ||
      (modality === "plain text" && job.storage_path);
    
    if (shouldProcess) {
      // Trigger processing asynchronously - don't await, let it run in background
      void fetch(`${req.nextUrl.origin}/api/jobs/${job.id}/process`, {
        method: "POST",
      }).catch((err) => {
        console.error("Failed to trigger processing:", err);
      });
    }

    return NextResponse.json({ job }, { status: 201 });
  } catch (err) {
    console.error("Jobs POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}


