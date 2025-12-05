import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabaseClient";
import { transcribeAudio } from "@/lib/transcription";
import { smartChunkText } from "@/lib/chunking";
import { extractMetadata, extractGenericMetadata } from "@/lib/metadata";
import { createEmbeddingsAndStore } from "@/lib/embeddings";
import { processDocument } from "@/lib/documentProcessing";
import { inferSpeakerAttribution } from "@/lib/speakerDiarization";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const jobId = id;

  console.log(`\n🚀 ==========================================`);
  console.log(`🚀 Starting processing for job: ${jobId}`);
  console.log(`🚀 ==========================================\n`);

  const supabase = getServerSupabaseClient();

  try {
    // Step 1: Fetch job details
    console.log("📋 [STEP 1/8] Fetching job details from database...");
    const { data: job, error: jobError } = await supabase
      .from("ingestion_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      console.error("❌ [STEP 1] Job fetch error:", jobError);
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 },
      );
    }

    console.log(`✅ [STEP 1] Job found:`);
    console.log(`   - Modality: ${job.modality}`);
    console.log(`   - Source: ${job.source_name || "N/A"}`);
    console.log(`   - Storage path: ${job.storage_path || "N/A"}`);
    console.log(`   - User ID: ${job.user_id}`);

    // Update status to processing
    console.log(`📝 [STEP 1] Updating job status to "processing"...`);
    await supabase
      .from("ingestion_jobs")
      .update({ status: "processing" })
      .eq("id", jobId);
    console.log(`✅ [STEP 1] Job status updated to processing\n`);

    let extractedText = "";
    let metadata: any = {};
    let sourceDate: Date | undefined;
    let sourceName = job.source_name || undefined;
    let segmentsWithSpeakers: any = undefined; // For audio modality

    // Step 2: Process based on modality
    console.log(`📥 [STEP 2/8] Processing ${job.modality} content...`);

    // Normalize modality (handle both space and underscore formats)
    const normalizedModality = job.modality.toLowerCase().replace(/_/g, " ");

    switch (normalizedModality) {
      case "audio": {
        if (!job.storage_path) {
          throw new Error("No storage path found for audio job");
        }

        // Download audio file
        const { data: fileData, error: downloadError } = await supabase.storage
          .from("uploads")
          .download(job.storage_path);

        if (downloadError || !fileData) {
          throw new Error(`Failed to download audio: ${downloadError?.message}`);
        }

        const audioBuffer = Buffer.from(await fileData.arrayBuffer());
        console.log(`   ✅ Audio file downloaded (${(audioBuffer.length / (1024 * 1024)).toFixed(2)} MB)`);

        // Transcribe audio
        const transcriptionResult = await transcribeAudio(
          audioBuffer,
          job.source_name || "audio.mp3",
        );
        extractedText = transcriptionResult.text;

        // Extract audio-specific metadata first (to get speaker list)
        metadata = await extractMetadata(transcriptionResult.text, transcriptionResult.duration);

        // Infer speaker attribution per segment if segments are available
        if (transcriptionResult.segments && transcriptionResult.segments.length > 0) {
          console.log(`   🎤 [STEP 2.5/8] Inferring speaker attribution...`);
          segmentsWithSpeakers = await inferSpeakerAttribution(
            transcriptionResult.segments,
            metadata.speakers,
          );
          console.log(`   ✅ Speaker attribution complete\n`);
        }
        break;
      }

      case "document": {
        if (!job.storage_path) {
          throw new Error("No storage path found for document job");
        }

        // Download document file
        const { data: fileData, error: downloadError } = await supabase.storage
          .from("uploads")
          .download(job.storage_path);

        if (downloadError || !fileData) {
          throw new Error(`Failed to download document: ${downloadError?.message}`);
        }

        const documentBuffer = Buffer.from(await fileData.arrayBuffer());
        console.log(`   ✅ Document file downloaded (${(documentBuffer.length / (1024 * 1024)).toFixed(2)} MB)`);

        // Extract filename from storage_path (it has the actual uploaded filename with extension)
        const actualFilename = job.storage_path 
          ? job.storage_path.split('/').pop() || job.source_name || "document"
          : job.source_name || "document";
        
        console.log(`   🔍 Processing document: ${actualFilename}`);

        // Detect MIME type from file buffer (magic bytes) - more reliable than extension
        let detectedMimeType: string | undefined;
        if (documentBuffer.length >= 4) {
          const header = documentBuffer.subarray(0, 4).toString('ascii');
          if (header === '%PDF') {
            detectedMimeType = 'application/pdf';
            console.log(`   📄 Detected PDF from file header (magic bytes)`);
          }
        }

        // Process document - processDocument will use both filename extension and MIME type
        const processed = await processDocument(
          documentBuffer,
          actualFilename,
          detectedMimeType,
        );
        extractedText = processed.text;
        sourceDate = processed.metadata.creationDate || processed.metadata.modificationDate;
        sourceName = processed.metadata.title || sourceName;

        // Extract metadata
        metadata = await extractGenericMetadata(extractedText, processed.metadata.documentType || "document");
        break;
      }

      case "plain text":
      case "plain_text":
      case "text": {
        if (!job.storage_path) {
          // Text might be stored directly in metadata or as a file
          throw new Error("No storage path found for plain text job");
        }

        // Download text file
        const { data: fileData, error: downloadError } = await supabase.storage
          .from("uploads")
          .download(job.storage_path);

        if (downloadError || !fileData) {
          throw new Error(`Failed to download text file: ${downloadError?.message}`);
        }

        const textBuffer = Buffer.from(await fileData.arrayBuffer());
        const text = textBuffer.toString("utf-8");
        extractedText = text;

        // Extract metadata
        metadata = await extractGenericMetadata(extractedText, "text");
        break;
      }

      default:
        throw new Error(`Unsupported modality: ${job.modality}`);
    }

    console.log(`✅ [STEP 2] Content processed:`);
    console.log(`   - Text length: ${extractedText.length} characters`);
    console.log(`   - Keywords: ${metadata.keywords?.length || 0}`);
    if (sourceDate && sourceDate instanceof Date && !isNaN(sourceDate.getTime())) {
      console.log(`   - Source date: ${sourceDate.toISOString()}`);
    } else if (sourceDate) {
      console.log(`   - Source date: ${sourceDate} (not a valid date)`);
      sourceDate = undefined; // Clear invalid date
    }
    console.log();

    // Step 3: Smart chunking (with speaker info for audio)
    console.log("📝 [STEP 3/8] Chunking text...");
    const chunks = smartChunkText(extractedText, segmentsWithSpeakers);
    console.log(`✅ [STEP 3] Chunking complete: ${chunks.length} chunks`);
    if (chunks.some(c => c.speaker)) {
      console.log(`   📊 Chunks with speaker attribution: ${chunks.filter(c => c.speaker).length}`);
    }
    console.log();

    // Step 4: Create embeddings and store in Qdrant
    console.log("🔮 [STEP 4/8] Creating embeddings and storing in Qdrant...");
    const storedCount = await createEmbeddingsAndStore(
      chunks,
      jobId,
      job.user_id,
      job.modality,
      metadata,
      sourceName,
      sourceDate,
    );
    console.log(`✅ [STEP 4] Embeddings created and stored: ${storedCount} chunks\n`);

    // Step 5: Update job status and metadata
    console.log("💾 [STEP 5/8] Updating job status in database...");
    const updateData: any = {
      status: "completed",
      metadata: {
        ...(job.metadata || {}),
        textLength: extractedText.length,
        chunksCount: storedCount,
        keywords: metadata.keywords || [],
        summary: metadata.summary,
        topics: metadata.topics || [],
        sourceDate: sourceDate ? sourceDate.toISOString() : undefined,
        ...(job.modality === "audio" && {
          speakers: metadata.speakers || [],
          duration: metadata.duration,
        }),
        ...(job.modality === "document" && {
          documentType: metadata.documentType,
          pageCount: metadata.pageCount,
          wordCount: metadata.wordCount,
        }),
      },
    };

    const { error: updateError } = await supabase
      .from("ingestion_jobs")
      .update(updateData)
      .eq("id", jobId);

    if (updateError) {
      console.error(`❌ [STEP 5] Update error:`, updateError);
      throw updateError;
    }

    console.log(`✅ [STEP 5] Job status updated to "completed"`);
    console.log(`\n🎉 ==========================================`);
    console.log(`🎉 Processing complete for job: ${jobId}`);
    console.log(`🎉 ==========================================`);
    console.log(`   - Modality: ${job.modality}`);
    console.log(`   - Text: ${extractedText.length} characters`);
    console.log(`   - Chunks: ${storedCount}`);
    console.log(`   - Keywords: ${metadata.keywords?.length || 0}`);
    if (sourceDate) {
      console.log(`   - Source date: ${sourceDate.toISOString()}`);
    }
    console.log(`🎉 ==========================================\n`);

    return NextResponse.json({
      success: true,
      jobId,
      textLength: extractedText.length,
      chunksCount: storedCount,
      metadata,
      sourceDate: sourceDate?.toISOString(),
    });
  } catch (error: any) {
    console.error(`\n❌ ==========================================`);
    console.error(`❌ Processing error for job ${jobId}:`, error);
    console.error(`❌ ==========================================\n`);

    // Update job status to failed
    await supabase
      .from("ingestion_jobs")
      .update({
        status: "failed",
        error_message: error.message || "Processing failed",
      })
      .eq("id", jobId);

    return NextResponse.json(
      { error: error.message || "Processing failed" },
      { status: 500 },
    );
  }
}
