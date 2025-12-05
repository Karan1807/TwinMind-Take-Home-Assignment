import { getOpenAIClient } from "./openai";
import { createWorker } from "tesseract.js";

export interface ImageMetadata {
  description?: string;
  extractedText?: string;
  imageType?: string; // photo, screenshot, diagram, document, etc.
  width?: number;
  height?: number;
}

export interface ProcessedImage {
  text: string; // Combined OCR text + description
  metadata: ImageMetadata;
}

/**
 * Extract text from image using OCR (Tesseract)
 */
async function extractTextWithOCR(
  imageBuffer: Buffer,
  mimeType: string,
): Promise<string> {
  console.log(`   🔍 Running OCR on image...`);
  
  const worker = await createWorker('eng');
  
  try {
    const { data: { text } } = await worker.recognize(imageBuffer);
    
    const cleanText = text.trim();
    console.log(`   ✅ OCR complete: ${cleanText.length} characters extracted`);
    
    await worker.terminate();
    return cleanText;
  } catch (error: any) {
    await worker.terminate();
    console.error(`   ⚠️  OCR error:`, error.message);
    return '';
  }
}

/**
 * Generate image description using GPT-4 Vision
 */
async function describeImageWithVision(
  imageBuffer: Buffer,
  mimeType: string,
): Promise<string> {
  console.log(`   👁️  Generating image description with GPT-4 Vision...`);
  
  const openai = getOpenAIClient();
  
  try {
    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Image}`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Describe this image in detail. Include any text visible in the image, objects, people, scenes, diagrams, or any other relevant information. Be thorough but concise.",
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });
    
    const description = response.choices[0]?.message?.content || '';
    console.log(`   ✅ Image description generated: ${description.length} characters`);
    
    return description;
  } catch (error: any) {
    console.error(`   ⚠️  Vision API error:`, error.message);
    return '';
  }
}

/**
 * Detect image type based on content
 */
function detectImageType(
  description: string,
  extractedText: string,
): string {
  const lowerDesc = description.toLowerCase();
  const lowerText = extractedText.toLowerCase();
  
  // Check for document-like content
  if (lowerText.length > 100 || lowerDesc.includes('document') || lowerDesc.includes('text')) {
    return 'document';
  }
  
  // Check for screenshot
  if (lowerDesc.includes('screenshot') || lowerDesc.includes('screen') || lowerDesc.includes('interface')) {
    return 'screenshot';
  }
  
  // Check for diagram
  if (lowerDesc.includes('diagram') || lowerDesc.includes('chart') || lowerDesc.includes('graph')) {
    return 'diagram';
  }
  
  // Check for whiteboard
  if (lowerDesc.includes('whiteboard') || lowerDesc.includes('board')) {
    return 'whiteboard';
  }
  
  // Default to photo
  return 'photo';
}

/**
 * Process image: OCR + Vision API
 */
export async function processImage(
  imageBuffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<ProcessedImage> {
  console.log(`   🖼️  Processing image: ${filename}`);
  
  // Run OCR and Vision API in parallel for efficiency
  const [extractedText, description] = await Promise.all([
    extractTextWithOCR(imageBuffer, mimeType),
    describeImageWithVision(imageBuffer, mimeType),
  ]);
  
  // Combine OCR text and description
  const combinedText = [extractedText, description]
    .filter(Boolean)
    .join('\n\n');
  
  const imageType = detectImageType(description, extractedText);
  
  const metadata: ImageMetadata = {
    description: description || undefined,
    extractedText: extractedText || undefined,
    imageType,
  };
  
  console.log(`   ✅ Image processed:`);
  console.log(`      - Type: ${imageType}`);
  console.log(`      - OCR text: ${extractedText.length} chars`);
  console.log(`      - Description: ${description.length} chars`);
  
  return {
    text: combinedText || description || extractedText || 'No content extracted from image',
    metadata,
  };
}

