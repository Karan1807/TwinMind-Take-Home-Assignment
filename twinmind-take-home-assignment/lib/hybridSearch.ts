import { getQdrantClient } from "./qdrant";
import { getOpenAIClient } from "./openai";
import { buildDateRangeFilter } from "./temporalQuery";

export interface SearchResult {
  id: string | number;
  score: number;
  payload: {
    text: string;
    jobId: string;
    userId: string;
    modality: string;
    chunkIndex: number;
    keywords: string[];
    speakers?: string[]; // All speakers in the audio
    speaker?: string; // Primary speaker for this chunk
    chunkSpeakers?: string[]; // All speakers in this specific chunk
    summary?: string;
    topics?: string[];
    sourceName?: string;
    createdAt?: string;
    processedAt?: string;
    sourceDate?: string; // Original source date
  };
}

export interface HybridSearchOptions {
  userId: string;
  query: string;
  queryEmbedding: number[];
  topK: number;
  temporalRange?: {
    startDate?: Date;
    endDate?: Date;
  };
}

/**
 * Extract keywords from user query for keyword search
 */
function extractKeywords(query: string): string[] {
  // Simple keyword extraction - remove stop words and get meaningful terms
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "was", "are", "were", "be",
    "been", "being", "have", "has", "had", "do", "does", "did", "will",
    "would", "should", "could", "may", "might", "must", "can", "this",
    "that", "these", "those", "what", "which", "who", "whom", "whose",
    "where", "when", "why", "how", "about", "into", "through", "during",
  ]);

  const words = query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  return [...new Set(words)]; // Remove duplicates
}

/**
 * Perform keyword search on Qdrant metadata
 */
async function keywordSearch(
  collectionName: string,
  keywords: string[],
  userId: string,
  limit: number,
  temporalRange?: { startDate?: Date; endDate?: Date },
): Promise<SearchResult[]> {
  console.log(`   🔍 Keyword search for: ${keywords.join(", ")}`);

  if (keywords.length === 0) {
    console.log(`   ⚠️  No keywords extracted, skipping keyword search`);
    return [];
  }

  const qdrant = getQdrantClient();

  // Qdrant filter syntax - check if collection exists first
  try {
    await qdrant.getCollection(collectionName);
  } catch (error: any) {
    console.error(`   ⚠️  Collection ${collectionName} does not exist`);
    return [];
  }

  // Build base filter
  const mustConditions: any[] = [
    {
      key: "userId",
      match: { value: userId },
    },
    {
      key: "keywords",
      match: { any: keywords },
    },
  ];

  // Add temporal filter if provided
  const dateFilter = buildDateRangeFilter(
    temporalRange ? { startDate: temporalRange.startDate, endDate: temporalRange.endDate, isRelative: false } : undefined,
    'sourceDate', // Prefer sourceDate (original date) over createdAt (processing date)
  );

  if (dateFilter) {
    // If dateFilter is a single condition, wrap it; if it's already a must object, merge
    if (dateFilter.must) {
      mustConditions.push(...dateFilter.must);
    } else {
      mustConditions.push(dateFilter);
    }
  }

  const filter = {
    must: mustConditions,
  };

  try {
    // Use scroll to get all matching points with filters
    const results = await qdrant.scroll(collectionName, {
      filter,
      limit,
      with_payload: true,
      with_vector: false,
    });

    const searchResults: SearchResult[] = (results.points || []).map(
      (point) => {
        const payload = point.payload as SearchResult["payload"];
        // Calculate keyword match score based on how many keywords match
        const matchedKeywords = keywords.filter((kw) =>
          payload.keywords?.some((pk) =>
            pk.toLowerCase().includes(kw.toLowerCase()),
          ),
        );
        const keywordScore = matchedKeywords.length / keywords.length;

        return {
          id: point.id,
          score: keywordScore, // Score based on keyword match ratio
          payload,
        };
      },
    );

    // Sort by keyword match score
    searchResults.sort((a, b) => b.score - a.score);

    console.log(`   ✅ Found ${searchResults.length} keyword matches`);
    return searchResults;
  } catch (error: any) {
    console.error(`   ⚠️  Keyword search with filter failed:`, error.message || error);
    if (error.data) {
      console.error(`      Error details:`, JSON.stringify(error.data, null, 2));
    }
    if (error.response?.data) {
      console.error(`      Response details:`, JSON.stringify(error.response.data, null, 2));
    }
    
    // Fallback: scroll all points and filter in memory
    console.log(`   🔄 Trying keyword search without filter (scroll all)...`);
    try {
      const results = await qdrant.scroll(collectionName, {
        limit: 1000, // Get more points for keyword matching
        with_payload: true,
        with_vector: false,
      });

      const allPoints = (results.points || []).filter(
        (point) => (point.payload as any)?.userId === userId
      );

      const searchResults: SearchResult[] = allPoints
        .map((point) => {
          const payload = point.payload as SearchResult["payload"];
          // Calculate keyword match score based on how many keywords match
          const matchedKeywords = keywords.filter((kw) =>
            payload.keywords?.some((pk) =>
              pk.toLowerCase().includes(kw.toLowerCase()),
            ),
          );
          const keywordScore = matchedKeywords.length / keywords.length;

          return {
            id: point.id,
            score: keywordScore,
            payload,
          };
        })
        .filter((result) => result.score > 0) // Only include matches
        .sort((a, b) => b.score - a.score)
        .slice(0, limit); // Limit results

      console.log(`   ✅ Found ${searchResults.length} keyword matches (filtered in memory)`);
      return searchResults;
    } catch (fallbackError: any) {
      console.error(`   ❌ Keyword search fallback also failed:`, fallbackError.message || fallbackError);
      return [];
    }
  }
}

/**
 * Perform vector similarity search
 */
async function vectorSearch(
  collectionName: string,
  queryEmbedding: number[],
  userId: string,
  limit: number,
  temporalRange?: { startDate?: Date; endDate?: Date },
): Promise<SearchResult[]> {
  console.log(`   🔮 Vector similarity search (top ${limit})...`);

  const qdrant = getQdrantClient();

  // Check if collection exists first
  try {
    await qdrant.getCollection(collectionName);
  } catch (error: any) {
    console.error(`   ⚠️  Collection ${collectionName} does not exist`);
    return [];
  }

  // Build base filter
  const mustConditions: any[] = [
    {
      key: "userId",
      match: { value: userId },
    },
  ];

  // Add temporal filter if provided
  const dateFilter = buildDateRangeFilter(
    temporalRange ? { startDate: temporalRange.startDate, endDate: temporalRange.endDate, isRelative: false } : undefined,
    'sourceDate', // Prefer sourceDate (original date) over createdAt (processing date)
  );

  if (dateFilter) {
    if (dateFilter.must) {
      mustConditions.push(...dateFilter.must);
    } else {
      mustConditions.push(dateFilter);
    }
  }

  const filter = {
    must: mustConditions,
  };

  try {
    // Try search with filter
    const results = await qdrant.search(collectionName, {
      vector: queryEmbedding,
      filter,
      limit,
      with_payload: true,
    });

    const searchResults: SearchResult[] = results.map((result) => ({
      id: result.id,
      score: result.score || 0,
      payload: result.payload as SearchResult["payload"],
    }));

    console.log(`   ✅ Found ${searchResults.length} vector matches`);
    return searchResults;
  } catch (error: any) {
    console.error(`   ⚠️  Vector search with filter failed:`, error.message || error);
    if (error.data) {
      console.error(`      Error details:`, JSON.stringify(error.data, null, 2));
    }
    if (error.response?.data) {
      console.error(`      Response details:`, JSON.stringify(error.response.data, null, 2));
    }
    
    // Fallback: try without filter
    console.log(`   🔄 Trying vector search without filter...`);
    try {
      const results = await qdrant.search(collectionName, {
        vector: queryEmbedding,
        limit,
        with_payload: true,
      });

      // Filter results by userId in memory
      const searchResults: SearchResult[] = results
        .map((result) => ({
          id: result.id,
          score: result.score || 0,
          payload: result.payload as SearchResult["payload"],
        }))
        .filter((result) => result.payload.userId === userId);

      console.log(`   ✅ Found ${searchResults.length} vector matches (filtered in memory)`);
      return searchResults;
    } catch (fallbackError: any) {
      console.error(`   ❌ Vector search without filter also failed:`, fallbackError.message || fallbackError);
      return [];
    }
  }
}

/**
 * Normalize scores to 0-1 range
 */
function normalizeScores(results: SearchResult[]): SearchResult[] {
  if (results.length === 0) return results;

  const scores = results.map((r) => r.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const range = maxScore - minScore;

  if (range === 0) {
    // All scores are the same, set to 0.5
    return results.map((r) => ({ ...r, score: 0.5 }));
  }

  return results.map((r) => ({
    ...r,
    score: (r.score - minScore) / range, // Normalize to 0-1
  }));
}

/**
 * Score fusion: Combine keyword and vector search results with normalized scores
 * Formula: final_score = 0.3 * normalized_keyword_score + 0.7 * normalized_semantic_score
 */
function fuseScores(
  keywordResults: SearchResult[],
  vectorResults: SearchResult[],
  keywordWeight: number = 0.3,
  vectorWeight: number = 0.7,
): SearchResult[] {
  console.log(`   🔀 Fusing scores (keyword: ${keywordWeight}, vector: ${vectorWeight})...`);

  // Normalize both result sets to 0-1 range
  const normalizedKeywords = normalizeScores(keywordResults);
  const normalizedVectors = normalizeScores(vectorResults);

  console.log(`      - Keyword results: ${normalizedKeywords.length} (normalized)`);
  console.log(`      - Vector results: ${normalizedVectors.length} (normalized)`);

  const resultMap = new Map<string | number, SearchResult>();

  // Add keyword results with weight
  normalizedKeywords.forEach((result) => {
    resultMap.set(result.id, {
      ...result,
      score: result.score * keywordWeight,
    });
  });

  // Add/merge vector results with weight
  normalizedVectors.forEach((result) => {
    const existing = resultMap.get(result.id);
    if (existing) {
      // Combine scores if both found
      existing.score = existing.score + result.score * vectorWeight;
    } else {
      resultMap.set(result.id, {
        ...result,
        score: result.score * vectorWeight,
      });
    }
  });

  const fused = Array.from(resultMap.values()).sort(
    (a, b) => b.score - a.score,
  );

  console.log(`   ✅ Fused ${fused.length} unique results`);
  if (fused.length > 0) {
    console.log(`      - Top score: ${fused[0].score.toFixed(4)}`);
    console.log(`      - Bottom score: ${fused[fused.length - 1].score.toFixed(4)}`);
  }

  return fused;
}

/**
 * Hybrid search: Keyword + Vector with score fusion
 */
export async function hybridSearch(
  options: HybridSearchOptions,
): Promise<SearchResult[]> {
  const { userId, query, queryEmbedding, topK } = options;
  const collectionName = `twinmind_${userId}`;

  console.log(`\n🔎 ==========================================`);
  console.log(`🔎 Hybrid Search`);
  console.log(`🔎 ==========================================`);
  console.log(`   Query: "${query}"`);
  console.log(`   Collection: ${collectionName}`);
  console.log(`   Top K: ${topK}\n`);

  // Extract keywords from query
  const keywords = extractKeywords(query);
  console.log(`   📝 Extracted keywords: ${keywords.join(", ")}\n`);

  // Perform both searches in parallel
  const [keywordResults, vectorResults] = await Promise.all([
    keywordSearch(collectionName, keywords, userId, topK * 2, options.temporalRange),
    vectorSearch(collectionName, queryEmbedding, userId, topK * 2, options.temporalRange),
  ]);

  // Fuse scores
  const fusedResults = fuseScores(keywordResults, vectorResults);

  // Return top K
  const topResults = fusedResults.slice(0, topK);

  console.log(`\n✅ Hybrid search complete: ${topResults.length} results`);
  console.log(`🔎 ==========================================\n`);

  return topResults;
}

