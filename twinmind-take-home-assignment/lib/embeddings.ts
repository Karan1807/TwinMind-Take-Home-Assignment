import crypto from "crypto";
import { getOpenAIClient } from "./openai";
import { getQdrantClient, ensureCollection } from "./qdrant";
import { TextChunk } from "./chunking";
import { AudioMetadata, GenericMetadata } from "./metadata";

export interface ChunkWithEmbedding extends TextChunk {
  embedding: number[];
  metadata: {
    jobId: string;
    userId: string;
    modality: string;
    chunkIndex: number;
    keywords: string[];
    speakers?: string[];
    summary?: string;
    topics?: string[];
    sourceName?: string;
    sourceDate?: string; // ISO date string from source (e.g., meeting date, article publish date)
    processedAt: string; // ISO date string when chunk was processed
  };
}

export async function createEmbeddingsAndStore(
  chunks: TextChunk[],
  jobId: string,
  userId: string,
  modality: string,
  metadata: AudioMetadata | GenericMetadata,
  sourceName?: string,
  sourceDate?: Date, // Optional source date (e.g., meeting date, article publish date)
): Promise<number> {
  console.log(`   📊 Total chunks to process: ${chunks.length}`);
  console.log(`   🗄️  Qdrant collection: twinmind_${userId}`);
  console.log(`   🤖 Embedding model: text-embedding-3-small`);
  console.log(`   📦 Batch size: 10 chunks`);

  const openai = getOpenAIClient();
  const collectionName = `twinmind_${userId}`;

  // Ensure collection exists
  console.log(`   🔍 Ensuring Qdrant collection exists...`);
  await ensureCollection(collectionName);
  console.log(`   ✅ Collection ready`);

  const qdrant = getQdrantClient();

  let storedCount = 0;

  // Process chunks in batches to avoid rate limits
  const batchSize = 10;
  const totalBatches = Math.ceil(chunks.length / batchSize);
  
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    
    console.log(`   📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} chunks)...`);

    // Create embeddings for batch
    const texts = batch.map((chunk) => chunk.text);
    console.log(`      🤖 Calling OpenAI embeddings API...`);
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
    });
    console.log(`      ✅ Received ${embeddingResponse.data.length} embeddings`);

    // Store each chunk with its embedding
    // Qdrant requires point IDs to be UUIDs (strings) or integers
    // Using a hash-based approach to create unique integer IDs
    const points = batch.map((chunk, idx) => {
      const embedding = embeddingResponse.data[idx].embedding;
      // Create a deterministic integer ID from jobId and chunk index
      // Hash the combination and convert to a positive integer
      const pointIdString = `${jobId}_chunk_${i + idx}`;
      const hash = crypto.createHash("sha256").update(pointIdString).digest("hex");
      // Convert first 15 hex chars to integer (safe for JavaScript numbers)
      const pointId = parseInt(hash.substring(0, 15), 16);

      const now = new Date().toISOString();
      return {
        id: pointId,
        vector: embedding,
        payload: {
          text: chunk.text,
          jobId,
          userId,
          modality,
          chunkIndex: i + idx,
          tokenCount: chunk.tokenCount,
          keywords: metadata.keywords || [],
          speakers: (metadata as AudioMetadata).speakers || [],
          speaker: chunk.speaker || null, // Primary speaker for this chunk
          chunkSpeakers: chunk.speakers || [], // All speakers in this chunk
          summary: metadata.summary,
          topics: metadata.topics || [],
          sourceName: sourceName || null,
          createdAt: now, // When chunk was created/processed
          processedAt: now, // When chunk was processed
          sourceDate: sourceDate ? sourceDate.toISOString() : null, // Original source date (e.g., meeting date)
        },
      };
    });

    console.log(`      💾 Storing ${points.length} points in Qdrant...`);
    console.log(`      📋 Sample point ID: ${points[0]?.id}`);
    console.log(`      📋 Sample vector size: ${points[0]?.vector?.length || 0}`);
    
    try {
      await qdrant.upsert(collectionName, {
        wait: true,
        points,
      });
    } catch (error: any) {
      console.error(`      ❌ Qdrant upsert error details:`);
      console.error(`         Status: ${error.status || "unknown"}`);
      console.error(`         Message: ${error.message || "unknown"}`);
      if (error.data) {
        console.error(`         Error data:`, JSON.stringify(error.data, null, 2));
      }
      if (error.response?.data) {
        console.error(`         Response data:`, JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }

    storedCount += batch.length;
    console.log(`      ✅ Batch ${batchNum} complete: ${storedCount}/${chunks.length} chunks stored`);
  }

  console.log(`   🎉 All ${storedCount} chunks successfully stored in Qdrant`);
  return storedCount;
}

