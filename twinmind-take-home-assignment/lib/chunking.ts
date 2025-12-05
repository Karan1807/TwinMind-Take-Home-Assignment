// Smart chunking: split text into chunks of 300-400 tokens max
// Uses approximate token counting (1 token ≈ 4 characters for English)

const TOKEN_CHAR_RATIO = 4; // Approximate: 1 token ≈ 4 chars
const MIN_CHUNK_TOKENS = 300;
const MAX_CHUNK_TOKENS = 400;

function estimateTokens(text: string): number {
  return Math.ceil(text.length / TOKEN_CHAR_RATIO);
}

export interface TextChunk {
  text: string;
  tokenCount: number;
  startIndex: number;
  endIndex: number;
  speaker?: string; // Speaker who said this chunk (for audio)
  speakers?: string[]; // All speakers in this chunk (if multiple)
}

export function smartChunkText(
  text: string,
  segmentsWithSpeakers?: Array<{ text: string; start: number; end: number; speaker?: string }>,
): TextChunk[] {
  console.log(`   📏 Input text length: ${text.length} characters`);
  console.log(`   🎯 Target: 300-400 tokens per chunk`);
  console.log(`   🔪 Splitting into sentences...`);

  const chunks: TextChunk[] = [];
  let currentIndex = 0;
  let chunkNumber = 0;

  // Split by sentences first (periods, exclamation, question marks)
  const sentenceEnders = /[.!?]\s+/g;
  const sentences: { text: string; start: number; end: number }[] = [];

  let lastMatchEnd = 0;
  let match;
  while ((match = sentenceEnders.exec(text)) !== null) {
    const sentenceText = text.substring(lastMatchEnd, match.index + 1).trim();
    if (sentenceText.length > 0) {
      sentences.push({
        text: sentenceText,
        start: lastMatchEnd,
        end: match.index + 1,
      });
    }
    lastMatchEnd = match.index + match[0].length;
  }

  // Add remaining text if any
  if (lastMatchEnd < text.length) {
    const remaining = text.substring(lastMatchEnd).trim();
    if (remaining.length > 0) {
      sentences.push({
        text: remaining,
        start: lastMatchEnd,
        end: text.length,
      });
    }
  }

  console.log(`   ✅ Found ${sentences.length} sentences`);
  console.log(`   🔄 Grouping sentences into chunks...`);

  // Build chunks by grouping sentences until we hit 300-400 tokens
  let currentChunk = "";
  let currentStart = 0;
  const chunkSpeakers = new Set<string>(); // Track speakers in current chunk

  // Helper to find speakers for a text range (by character position)
  const findSpeakersForRange = (start: number, end: number): string[] => {
    if (!segmentsWithSpeakers) return [];
    
    const speakers = new Set<string>();
    // Find segments that overlap with this text range
    // We approximate by checking if segment text appears in the range
    const rangeText = text.substring(start, end).toLowerCase();
    
    for (const seg of segmentsWithSpeakers) {
      if (seg.speaker && seg.text) {
        const segTextLower = seg.text.toLowerCase();
        // Check if segment text appears in the range (simple substring match)
        if (rangeText.includes(segTextLower.substring(0, Math.min(50, segTextLower.length)))) {
          speakers.add(seg.speaker);
        }
      }
    }
    return Array.from(speakers);
  };

  for (const sentence of sentences) {
    const sentenceTokens = estimateTokens(sentence.text);
    const currentTokens = estimateTokens(currentChunk);

    // If adding this sentence would exceed max, finalize current chunk
    if (
      currentChunk.length > 0 &&
      currentTokens + sentenceTokens > MAX_CHUNK_TOKENS
    ) {
      // Ensure we meet minimum token requirement
      if (currentTokens >= MIN_CHUNK_TOKENS) {
        // Determine speaker(s) for this chunk
        const chunkSpeakerList = Array.from(chunkSpeakers);
        const primarySpeaker = chunkSpeakerList.length === 1 ? chunkSpeakerList[0] : undefined;
        
        chunks.push({
          text: currentChunk.trim(),
          tokenCount: currentTokens,
          startIndex: currentStart,
          endIndex: sentence.start,
          speaker: primarySpeaker,
          speakers: chunkSpeakerList.length > 0 ? chunkSpeakerList : undefined,
        });
        currentChunk = sentence.text;
        currentStart = sentence.start;
        chunkSpeakers.clear();
        
        // Add speakers for new chunk start
        const sentenceSpeakers = findSpeakersForRange(sentence.start, sentence.end);
        sentenceSpeakers.forEach(s => chunkSpeakers.add(s));
      } else {
        // If below min, keep adding sentences
        currentChunk += " " + sentence.text;
        const sentenceSpeakers = findSpeakersForRange(sentence.start, sentence.end);
        sentenceSpeakers.forEach(s => chunkSpeakers.add(s));
      }
    } else {
      // Add sentence to current chunk
      if (currentChunk.length === 0) {
        currentStart = sentence.start;
      }
      currentChunk += (currentChunk ? " " : "") + sentence.text;
      
      // Track speakers for this sentence
      const sentenceSpeakers = findSpeakersForRange(sentence.start, sentence.end);
      sentenceSpeakers.forEach(s => chunkSpeakers.add(s));
    }
  }

  // Add final chunk if any
  if (currentChunk.trim().length > 0) {
    const finalTokens = estimateTokens(currentChunk);
    const finalChunkSpeakers = Array.from(chunkSpeakers);
    const primarySpeaker = finalChunkSpeakers.length === 1 ? finalChunkSpeakers[0] : undefined;
    
    chunks.push({
      text: currentChunk.trim(),
      tokenCount: finalTokens,
      startIndex: currentStart,
      endIndex: text.length,
      speaker: primarySpeaker,
      speakers: finalChunkSpeakers.length > 0 ? finalChunkSpeakers : undefined,
    });
  }

  const avgTokens = chunks.length > 0
    ? Math.round(chunks.reduce((sum, c) => sum + c.tokenCount, 0) / chunks.length)
    : 0;
  const minTokens = chunks.length > 0 ? Math.min(...chunks.map(c => c.tokenCount)) : 0;
  const maxTokens = chunks.length > 0 ? Math.max(...chunks.map(c => c.tokenCount)) : 0;

  console.log(`   ✅ Chunking complete:`);
  console.log(`      - Total chunks: ${chunks.length}`);
  console.log(`      - Avg tokens/chunk: ${avgTokens}`);
  console.log(`      - Min tokens: ${minTokens}`);
  console.log(`      - Max tokens: ${maxTokens}`);

  return chunks;
}

