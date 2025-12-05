import OpenAI from 'openai';

export const getOpenAIClient = (): OpenAI => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  return new OpenAI({ apiKey });
};

export const OUTPUT_DIR = './output';
export const AUDIO_DIR = `${OUTPUT_DIR}/audio`;
export const DOCUMENTS_DIR = `${OUTPUT_DIR}/documents`;
export const WEBSITES_DIR = `${OUTPUT_DIR}/websites`;
export const DIARY_DIR = `${OUTPUT_DIR}/diary`;
export const IMAGES_DIR = `${OUTPUT_DIR}/images`;

// OpenAI TTS voices (different voices for different speakers)
export const TTS_VOICES = {
  'alloy': 'alloy',
  'echo': 'echo',
  'fable': 'fable',
  'onyx': 'onyx',
  'nova': 'nova',
  'shimmer': 'shimmer',
} as const;

