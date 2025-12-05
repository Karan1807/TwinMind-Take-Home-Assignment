import { generateAudioFiles } from './generateAudio';
import { generateDocuments } from './generateDocuments';
import { generateWebsites } from './generateWebsites';
import { generateDiary } from './generateDiary';
import { generateImages } from './generateImages';
import { OUTPUT_DIR } from './config';
import fs from 'fs-extra';

async function main() {
  console.log('🚀 TwinMind Test Data Generator');
  console.log('================================\n');
  
  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️  Warning: OPENAI_API_KEY not set.');
    console.log('   Audio and image generation will fail without it.\n');
  }
  
  // Create output directory
  await fs.ensureDir(OUTPUT_DIR);
  console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);
  
  try {
    // Generate all test data
    console.log('Starting test data generation...\n');
    
    // 1. Generate documents (10)
    await generateDocuments();
    
    // 2. Generate diary entries (7)
    await generateDiary();
    
    // 3. Generate websites (2)
    await generateWebsites();
    
    // 4. Generate images (10-15)
    // Note: This requires OpenAI API and may take time/cost money
    console.log('⚠️  Image generation requires OpenAI DALL-E API.');
    console.log('   This will generate 15 images. Continue? (This will proceed automatically in 5 seconds...)');
    await new Promise(resolve => setTimeout(resolve, 5000));
    await generateImages();
    
    // 5. Generate audio files (5)
    // Note: This requires OpenAI TTS API
    console.log('⚠️  Audio generation requires OpenAI TTS API.');
    console.log('   This will generate 5 meeting audio files. Continue? (This will proceed automatically in 5 seconds...)');
    await new Promise(resolve => setTimeout(resolve, 5000));
    await generateAudioFiles();
    
    console.log('\n✅ All test data generation complete!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Documents: 10 files in ${OUTPUT_DIR}/documents`);
    console.log(`   - Diary entries: 7 files in ${OUTPUT_DIR}/diary`);
    console.log(`   - Websites: 2 files in ${OUTPUT_DIR}/websites`);
    console.log(`   - Images: 15 files in ${OUTPUT_DIR}/images`);
    console.log(`   - Audio: 5 meetings in ${OUTPUT_DIR}/audio`);
    console.log(`\n📝 Note: Audio files are generated as segments.`);
    console.log(`   Use ffmpeg to combine segments into full audio files if needed.`);
    console.log(`\n🎉 Ready for testing!\n`);
    
  } catch (error) {
    console.error('\n❌ Error during generation:', error);
    process.exit(1);
  }
}

main().catch(console.error);

