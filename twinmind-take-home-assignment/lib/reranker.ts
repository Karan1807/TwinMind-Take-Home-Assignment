import { getOpenAIClient } from "./openai";
import { SearchResult } from "./hybridSearch";

/**
 * Rerank search results using GPT-4o-mini
 * Scores (query, chunk) pairs for relevance - proper reranking approach
 * This is much smarter than embeddings because it understands nuances
 */
export async function rerankResults(
  query: string,
  results: SearchResult[],
  topN: number = 7,
): Promise<SearchResult[]> {
  if (results.length === 0) return [];
  if (results.length <= topN) return results;

  console.log(`\n🎯 ==========================================`);
  console.log(`🎯 Reranking ${results.length} results to top ${topN}`);
  console.log(`🎯 ==========================================`);
  console.log(`   Query: "${query.substring(0, 100)}${query.length > 100 ? "..." : ""}"`);
  console.log(`   Scoring (query, chunk) pairs for relevance...\n`);

  const openai = getOpenAIClient();

  // Score each (query, chunk) pair individually
  // This is the proper reranking approach - understands nuances better
  const scoredPairs: Array<{ result: SearchResult; relevanceScore: number }> = [];

  // Process in batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < results.length; i += batchSize) {
    const batch = results.slice(i, i + batchSize);
    console.log(`   📊 Scoring batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(results.length / batchSize)} (${batch.length} chunks)...`);

    const scoringPromises = batch.map(async (result, batchIdx) => {
      const chunkText = result.payload.text.substring(0, 800); // Limit chunk size for scoring

      const prompt = `You are a relevance scoring assistant. Score how relevant this text chunk is to the user's query.

User Query: "${query}"

Text Chunk:
"${chunkText}"

Rate the relevance on a scale of 0.0 to 1.0, where:
- 1.0 = Perfectly relevant, directly answers the query
- 0.7-0.9 = Highly relevant, contains important information
- 0.4-0.6 = Somewhat relevant, tangentially related
- 0.1-0.3 = Minimally relevant, barely related
- 0.0 = Not relevant at all

Return ONLY a JSON object with a "score" field (number between 0.0 and 1.0).
Example: {"score": 0.85}`;

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a relevance scoring assistant. Always respond with valid JSON containing a 'score' number between 0.0 and 1.0.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          return { result, relevanceScore: 0 };
        }

        const parsed = JSON.parse(content);
        const score = typeof parsed.score === "number" ? parsed.score : 0;
        return { result, relevanceScore: Math.max(0, Math.min(1, score)) }; // Clamp to 0-1
      } catch (error) {
        console.error(`      ⚠️  Error scoring chunk ${i + batchIdx + 1}:`, error);
        return { result, relevanceScore: 0 };
      }
    });

    const batchScores = await Promise.all(scoringPromises);
    scoredPairs.push(...batchScores);
  }

  // Sort by relevance score (highest first)
  scoredPairs.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Update results with rerank scores and return top N
  const reranked = scoredPairs
    .slice(0, topN)
    .map((pair) => ({
      ...pair.result,
      score: pair.relevanceScore, // Update with rerank score
    }));

  console.log(`   ✅ Reranking complete:`);
  console.log(`      - Top relevance score: ${reranked[0]?.score.toFixed(4)}`);
  console.log(`      - Bottom relevance score: ${reranked[reranked.length - 1]?.score.toFixed(4)}`);
  console.log(`      - Selected ${reranked.length} chunks`);
  console.log(`🎯 ==========================================\n`);

  return reranked;
}

