import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { hybridSearch } from "@/lib/hybridSearch";
import { rerankResults } from "@/lib/reranker";
import { parseTemporalQuery } from "@/lib/temporalQuery";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, query } = body;

    if (!userId || !query) {
      return NextResponse.json(
        { error: "userId and query are required" },
        { status: 400 },
      );
    }

    console.log(`\n💬 ==========================================`);
    console.log(`💬 Chat Request`);
    console.log(`💬 ==========================================`);
    console.log(`   User: ${userId}`);
    console.log(`   Query: "${query}"\n`);

    // Parse temporal query
    const { cleanedQuery, temporalRange } = parseTemporalQuery(query);
    if (temporalRange) {
      console.log(`📅 Temporal query detected:`);
      console.log(`   - Range: ${temporalRange.startDate?.toISOString()} to ${temporalRange.endDate?.toISOString()}`);
      console.log(`   - Text: "${temporalRange.relativeText}"`);
      console.log(`   - Cleaned query: "${cleanedQuery}"\n`);
    }

    const openai = getOpenAIClient();

    // Step 1: Generate query embedding (use cleaned query)
    console.log(`📊 [STEP 1/5] Generating query embedding...`);
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: cleanedQuery || query, // Use cleaned query if temporal part was removed
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;
    console.log(`✅ [STEP 1] Embedding generated (${queryEmbedding.length} dimensions)\n`);

    // Step 2: Hybrid Search (Keyword + Vector) with temporal filter
    console.log(`🔎 [STEP 2/5] Performing hybrid search...`);
    const searchResults = await hybridSearch({
      userId,
      query: cleanedQuery || query,
      queryEmbedding,
      topK: 20, // Get top 20 for reranking
      temporalRange: temporalRange ? {
        startDate: temporalRange.startDate,
        endDate: temporalRange.endDate,
      } : undefined,
    });
    console.log(`✅ [STEP 2] Found ${searchResults.length} results\n`);

    if (searchResults.length === 0) {
      return NextResponse.json({
        answer:
          "I don't have that information in my memory right now. Could you try rephrasing your question, or maybe upload the document or notes that might contain what you're looking for?",
      });
    }

    // Step 3: Rerank to top 5-7 chunks
    console.log(`🎯 [STEP 3/5] Reranking results...`);
    const rerankedResults = await rerankResults(query, searchResults, 7);
    console.log(`✅ [STEP 3] Reranked to ${rerankedResults.length} chunks\n`);

    // Step 4: Build context from reranked chunks with source attribution
    console.log(`📝 [STEP 4/5] Building context from chunks...`);
    const context = rerankedResults
      .map((result, idx) => {
        const sourceInfo: string[] = [];
        if (result.payload.sourceName) {
          sourceInfo.push(result.payload.sourceName);
        }
        if (result.payload.sourceDate) {
          const date = new Date(result.payload.sourceDate);
          sourceInfo.push(`(from ${date.toLocaleDateString()})`);
        }
        if (result.payload.modality) {
          sourceInfo.push(`[${result.payload.modality}]`);
        }
        const sourceLabel = sourceInfo.length > 0 
          ? `[Source ${idx + 1}: ${sourceInfo.join(" ")}]`
          : `[Source ${idx + 1}]`;
        return `${sourceLabel}\n${result.payload.text}`;
      })
      .join("\n\n---\n\n");

    const contextLength = context.length;
    console.log(`✅ [STEP 4] Context built (${contextLength} characters)\n`);

    // Step 5: Generate final answer with GPT
    console.log(`🤖 [STEP 5/5] Generating answer with GPT...`);
    const systemPrompt = `You are the user's personal second brain - a natural extension of their memory and thinking. You have access to their documents, meetings, notes, and information they've saved.

Your personality:
- Talk like a helpful friend or colleague who remembers things for them
- Be conversational and natural, not robotic or formal
- Write in complete sentences, not bullet points or lists
- Sound like you're recalling information from memory, not reading from a database
- Use "I remember" or "I recall" naturally when referencing past information
- Be warm and helpful, like a trusted assistant who knows them well

How to respond:
- Answer based only on the information provided in the context
- If you don't have enough information, say so naturally (e.g., "I don't have that information in my memory" or "I'm not sure about that")
- When referencing sources, weave them naturally into your response (e.g., "In that meeting from last month..." or "From the document you saved...")
- Don't explicitly cite sources with brackets unless absolutely necessary - just mention them naturally
- Be thorough but conversational - explain things as if you're helping a friend remember
- If multiple sources mention the same thing, synthesize them naturally`;

    const userPrompt = `Here's what I remember from your saved information:

${context}

You asked: ${query}

Answer naturally, as if you're recalling this from memory. Be conversational and helpful.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8, // Higher temperature for more natural, varied responses
      max_tokens: 1500, // Allow longer, more natural responses
    });

    const answer = completion.choices[0]?.message?.content || "I couldn't generate a response.";

    console.log(`✅ [STEP 5] Answer generated (${answer.length} characters)`);
    console.log(`\n💬 ==========================================`);
    console.log(`💬 Chat Response Complete`);
    console.log(`💬 ==========================================\n`);

    return NextResponse.json({
      answer,
      sources: rerankedResults.map((r) => ({
        sourceName: r.payload.sourceName,
        modality: r.payload.modality,
        sourceDate: r.payload.sourceDate,
        chunkIndex: r.payload.chunkIndex,
        score: r.score,
        jobId: r.payload.jobId,
      })),
      temporalRange: temporalRange ? {
        startDate: temporalRange.startDate?.toISOString(),
        endDate: temporalRange.endDate?.toISOString(),
        relativeText: temporalRange.relativeText,
      } : undefined,
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process chat request" },
      { status: 500 },
    );
  }
}

