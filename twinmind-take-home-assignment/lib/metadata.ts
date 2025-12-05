import { getOpenAIClient } from "./openai";

export interface AudioMetadata {
  keywords: string[];
  speakers?: string[];
  summary?: string;
  language?: string;
  topics?: string[];
  actionItems?: string[]; // Action items or decisions made
  meetingTitle?: string; // Title or subject of the meeting
  participants?: string[]; // List of participants
  decisions?: string[]; // Key decisions made
}

export interface GenericMetadata {
  keywords: string[];
  summary?: string;
  topics?: string[];
  [key: string]: any; // Allow additional metadata fields
}

export async function extractMetadata(
  transcriptionText: string,
  duration?: number,
): Promise<AudioMetadata> {
  console.log(`   📝 Transcription length: ${transcriptionText.length} chars`);
  console.log(`   ⏱️  Duration: ${duration ? `${duration}s` : "unknown"}`);
  console.log(`   🤖 Calling GPT-4o-mini for metadata extraction...`);

  const openai = getOpenAIClient();

  const prompt = `Analyze the following audio transcription and extract structured metadata. This appears to be a meeting, conversation, or audio recording.

Transcription:
${transcriptionText}

Please provide:
1. Key topics/keywords (5-10 most important)
2. Speakers mentioned or detected (if any) - extract names or speaker identifiers
3. A brief summary (1-2 sentences)
4. Main topics discussed
5. Action items or tasks mentioned (if any) - things that need to be done
6. Key decisions made (if any)
7. Meeting title or subject (if identifiable)
8. Participants mentioned (if any)

Respond in JSON format:
{
  "keywords": ["keyword1", "keyword2", ...],
  "speakers": ["speaker1", "speaker2"] or null,
  "summary": "brief summary",
  "topics": ["topic1", "topic2", ...],
  "actionItems": ["action 1", "action 2"] or null,
  "decisions": ["decision 1", "decision 2"] or null,
  "meetingTitle": "title" or null,
  "participants": ["participant1", "participant2"] or null
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a metadata extraction assistant. Always respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const metadata = JSON.parse(content) as AudioMetadata;

    console.log(`   ✅ Metadata extraction complete:`);
    console.log(`      - Keywords: ${metadata.keywords.length} (${metadata.keywords.slice(0, 5).join(", ")}${metadata.keywords.length > 5 ? "..." : ""})`);
    console.log(`      - Speakers: ${metadata.speakers?.length || 0}`);
    console.log(`      - Topics: ${metadata.topics?.length || 0}`);
    console.log(`      - Action items: ${metadata.actionItems?.length || 0}`);
    console.log(`      - Decisions: ${metadata.decisions?.length || 0}`);
    if (metadata.meetingTitle) {
      console.log(`      - Meeting title: ${metadata.meetingTitle}`);
    }
    if (metadata.summary) {
      console.log(`      - Summary: ${metadata.summary.substring(0, 100)}...`);
    }

    return metadata;
  } catch (error) {
    console.error(`   ⚠️  Error extracting metadata with GPT, using fallback:`, error);
    // Fallback: extract basic keywords from text
    console.log(`   🔄 Falling back to frequency-based keyword extraction...`);
    const words = transcriptionText
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 4);
    const wordFreq: Record<string, number> = {};
    words.forEach((w) => {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    });
    const topKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    return {
      keywords: topKeywords,
      summary: transcriptionText.substring(0, 200) + "...",
    };
  }
}

/**
 * Extract metadata from any text content (for documents, web, plain text)
 */
export async function extractGenericMetadata(
  text: string,
  contentType: string = "text",
): Promise<GenericMetadata> {
  console.log(`   📝 Text length: ${text.length} chars`);
  console.log(`   📄 Content type: ${contentType}`);
  console.log(`   🤖 Calling GPT-4o-mini for metadata extraction...`);

  const openai = getOpenAIClient();

  const prompt = `Analyze the following ${contentType} content and extract structured metadata.

Content:
${text.substring(0, 8000)}${text.length > 8000 ? '...' : ''}

Please provide:
1. Key topics/keywords (5-10 most important)
2. A brief summary (1-2 sentences)
3. Main topics discussed

Respond in JSON format:
{
  "keywords": ["keyword1", "keyword2", ...],
  "summary": "brief summary",
  "topics": ["topic1", "topic2", ...]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a metadata extraction assistant. Always respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const metadata = JSON.parse(content) as GenericMetadata;

    console.log(`   ✅ Metadata extraction complete:`);
    console.log(`      - Keywords: ${metadata.keywords?.length || 0} (${metadata.keywords?.slice(0, 5).join(", ") || ""}${(metadata.keywords?.length || 0) > 5 ? "..." : ""})`);
    console.log(`      - Topics: ${metadata.topics?.length || 0}`);
    if (metadata.summary) {
      console.log(`      - Summary: ${metadata.summary.substring(0, 100)}...`);
    }

    return metadata;
  } catch (error) {
    console.error(`   ⚠️  Error extracting metadata with GPT, using fallback:`, error);
    // Fallback: extract basic keywords from text
    console.log(`   🔄 Falling back to frequency-based keyword extraction...`);
    const words = text
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 4);
    const wordFreq: Record<string, number> = {};
    words.forEach((w) => {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    });
    const topKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    return {
      keywords: topKeywords,
      summary: text.substring(0, 200) + "...",
    };
  }
}

