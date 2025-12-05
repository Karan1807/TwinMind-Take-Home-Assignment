import { getOpenAIClient } from "./openai";
import { TranscriptionSegment } from "./transcription";

/**
 * Infer speaker attribution for each segment using GPT
 * This is a pragmatic approach since Whisper doesn't provide speaker diarization
 * Prioritizes actual names over generic labels
 */
export async function inferSpeakerAttribution(
  segments: TranscriptionSegment[],
  allSpeakers?: string[], // Known speakers from metadata extraction
): Promise<TranscriptionSegment[]> {
  if (segments.length === 0) {
    return segments;
  }

  console.log(`   🎤 Inferring speaker attribution for ${segments.length} segments...`);
  if (allSpeakers && allSpeakers.length > 0) {
    console.log(`   📋 Known speakers: ${allSpeakers.join(', ')}`);
  }

  const openai = getOpenAIClient();

  // Group segments into batches to avoid token limits
  const batchSize = 20;
  const batches: TranscriptionSegment[][] = [];
  
  for (let i = 0; i < segments.length; i += batchSize) {
    batches.push(segments.slice(i, i + batchSize));
  }

  // Map to track speaker consistency across batches
  // Key: detected name/label, Value: normalized actual name
  const speakerMap = new Map<string, string>();
  
  // First, map known speakers to themselves
  if (allSpeakers) {
    allSpeakers.forEach(name => {
      speakerMap.set(name.toLowerCase(), name);
      speakerMap.set(name, name);
    });
  }

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx];
    console.log(`      Processing batch ${batchIdx + 1}/${batches.length} (${batch.length} segments)...`);

    // Build context: previous segments + current batch
    const contextSegments = batchIdx > 0 
      ? batches[batchIdx - 1].slice(-5) // Last 5 segments from previous batch for context
      : [];
    
    const allBatchSegments = [...contextSegments, ...batch];
    const transcriptText = allBatchSegments
      .map((seg, idx) => `[Segment ${idx + 1}] ${seg.text}`)
      .join('\n');

    const prompt = `Analyze this audio transcription and identify which speaker said each segment. 

Transcription segments:
${transcriptText}

${allSpeakers && allSpeakers.length > 0 
  ? `IMPORTANT: The following people are known to be in this conversation: ${allSpeakers.join(', ')}. 
     When identifying speakers, use their ACTUAL NAMES from this list whenever possible.
     Only use generic labels like "Speaker 1" if you cannot identify the actual person.
     Look for:
     - Direct mentions of names ("Hi John", "Sarah said", etc.)
     - Self-references ("I'm John", "This is Sarah")
     - Context clues that identify the speaker
     - Speaking patterns that match known participants`
  : `Identify different speakers based on speaking style, content, and context.
     Try to extract actual names from the conversation (e.g., "Hi, I'm John" or "Sarah mentioned").
     Only use generic labels like "Speaker 1" if actual names cannot be determined.`}

For each segment, determine which speaker said it. Prioritize actual names over generic labels.

Respond in JSON format:
{
  "speakers": {
    "Segment 1": "John" or "Sarah" or "Speaker 1" (only if name unknown),
    "Segment 2": "John" or "Sarah" or "Speaker 2" (only if name unknown),
    ...
  }
}

Only include segments from the current batch (not context segments).`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a speaker diarization assistant. Analyze transcriptions and identify which speaker said each segment. Always use actual names when identifiable, never generic labels unless absolutely necessary. Always respond with valid JSON only.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        console.log(`      ⚠️  No response for batch ${batchIdx + 1}, skipping speaker attribution`);
        continue;
      }

      const result = JSON.parse(content);
      const speakers = result.speakers || {};

      // Apply speaker labels to current batch (skip context segments)
      const contextLength = contextSegments.length;
      for (let i = 0; i < batch.length; i++) {
        const segmentIdx = contextLength + i + 1;
        let speakerLabel = speakers[`Segment ${segmentIdx}`] || speakers[`Segment ${i + 1}`];
        
        if (speakerLabel) {
          // Normalize and map to actual names
          const labelLower = speakerLabel.toLowerCase().trim();
          
          // Check if it's already mapped
          if (speakerMap.has(labelLower)) {
            speakerLabel = speakerMap.get(labelLower)!;
          } else {
            // Try to match with known speakers
            if (allSpeakers && allSpeakers.length > 0) {
              const knownMatch = allSpeakers.find(s => {
                const sLower = s.toLowerCase();
                return labelLower === sLower ||
                       labelLower.includes(sLower) ||
                       sLower.includes(labelLower) ||
                       labelLower.startsWith(sLower) ||
                       sLower.startsWith(labelLower);
              });
              
              if (knownMatch) {
                speakerLabel = knownMatch;
                speakerMap.set(labelLower, knownMatch);
                // Also map variations
                speakerMap.set(speakerLabel, knownMatch);
              } else if (!labelLower.startsWith('speaker ')) {
                // If it's not a generic "Speaker X" label, treat it as an actual name
                // Capitalize properly
                speakerLabel = speakerLabel.split(' ').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(' ');
                speakerMap.set(labelLower, speakerLabel);
                console.log(`      📝 Detected new speaker name: ${speakerLabel}`);
              } else {
                // Generic label - try to find a better match or keep as is
                speakerMap.set(labelLower, speakerLabel);
              }
            } else {
              // No known speakers, but if it's not "Speaker X", treat as name
              if (!labelLower.startsWith('speaker ')) {
                speakerLabel = speakerLabel.split(' ').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(' ');
                speakerMap.set(labelLower, speakerLabel);
                console.log(`      📝 Detected speaker name: ${speakerLabel}`);
              } else {
                speakerMap.set(labelLower, speakerLabel);
              }
            }
          }
          
          batch[i].speaker = speakerLabel;
        }
      }
    } catch (error) {
      console.error(`      ⚠️  Error inferring speakers for batch ${batchIdx + 1}:`, error);
      // Continue without speaker attribution for this batch
    }
  }

  const segmentsWithSpeakers = segments.filter(seg => seg.speaker);
  const uniqueSpeakers = new Set(segments.map(seg => seg.speaker).filter(Boolean));
  console.log(`   ✅ Speaker attribution complete: ${segmentsWithSpeakers.length}/${segments.length} segments have speaker labels`);
  console.log(`   👥 Unique speakers detected: ${Array.from(uniqueSpeakers).join(', ')}`);

  return segments;
}

