import { getOpenAIClient } from "./openai";

export interface TranscriptionSegment {
  text: string;
  start: number;
  end: number;
  speaker?: string; // Will be inferred later
}

export interface TranscriptionResult {
  text: string;
  duration?: number;
  segments?: TranscriptionSegment[];
}

export async function transcribeAudio(
  audioBuffer: Buffer,
  filename: string,
): Promise<TranscriptionResult> {
  console.log(`   📄 File: ${filename}`);
  console.log(`   📦 Buffer size: ${audioBuffer.length} bytes`);
  console.log(`   🤖 Model: whisper-1`);
  console.log(`   ⏳ Calling OpenAI API...`);

  const openai = getOpenAIClient();

  // Determine MIME type from filename extension
  const getMimeType = (name: string): string => {
    const ext = name.toLowerCase().split('.').pop();
    if (ext === 'mp3') return 'audio/mpeg';
    if (ext === 'wav') return 'audio/wav';
    if (ext === 'm4a' || ext === 'mp4') return 'audio/mp4';
    return 'audio/mpeg'; // default
  };

  const mimeType = getMimeType(filename);
  console.log(`   🎵 Detected MIME type: ${mimeType}`);

  // Create a File-like object for OpenAI
  // Convert Buffer to Uint8Array for File constructor compatibility
  const file = new File([new Uint8Array(audioBuffer)], filename, {
    type: mimeType,
  });

  console.log(`   📤 Uploading to OpenAI Whisper API...`);
  const transcription = await openai.audio.transcriptions.create({
    file: file,
    model: "whisper-1",
    response_format: "verbose_json",
  });

  const text = transcription.text;
  const duration = transcription.duration;

  // Extract segments with timestamps if available
  const segments: TranscriptionSegment[] = [];
  if ((transcription as any).segments && Array.isArray((transcription as any).segments)) {
    for (const seg of (transcription as any).segments) {
      segments.push({
        text: seg.text || '',
        start: seg.start || 0,
        end: seg.end || 0,
      });
    }
    console.log(`   📊 Extracted ${segments.length} segments with timestamps`);
  }

  console.log(`   ✅ OpenAI response received`);
  console.log(`   📝 Transcription length: ${text.length} characters`);
  console.log(`   ⏱️  Audio duration: ${duration ? `${duration}s` : "unknown"}`);
  if (text.length > 0) {
    console.log(`   📄 Preview: "${text.substring(0, 100)}..."`);
  }

  return { text, duration, segments: segments.length > 0 ? segments : undefined };
}

