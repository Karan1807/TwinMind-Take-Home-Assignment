#!/usr/bin/env node
/**
 * Helper script to combine audio segments into full meeting audio files
 * Requires ffmpeg to be installed
 */

import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { AUDIO_DIR } from './config';

const execAsync = promisify(exec);

async function combineAudioSegments() {
  console.log('\n🔊 Combining Audio Segments...\n');
  
  if (!await fs.pathExists(AUDIO_DIR)) {
    console.error(`❌ Audio directory not found: ${AUDIO_DIR}`);
    console.log('   Run audio generation first!');
    process.exit(1);
  }
  
  // Check if ffmpeg is available
  try {
    await execAsync('ffmpeg -version');
  } catch (error) {
    console.error('❌ ffmpeg not found. Please install ffmpeg to combine audio files.');
    console.log('   Install: brew install ffmpeg (macOS) or apt-get install ffmpeg (Linux)');
    process.exit(1);
  }
  
  // Find all meeting transcript files
  const files = await fs.readdir(AUDIO_DIR);
  const meetingNumbers = new Set<number>();
  
  files.forEach(file => {
    const match = file.match(/meeting-(\d+)-transcript\.json/);
    if (match) {
      meetingNumbers.add(parseInt(match[1]));
    }
  });
  
  for (const meetingNum of Array.from(meetingNumbers).sort()) {
    console.log(`📝 Combining segments for Meeting ${meetingNum}...`);
    
    // Find all segments for this meeting
    const segments = files
      .filter(f => f.startsWith(`meeting-${meetingNum}-segment-`) && f.endsWith('.mp3'))
      .sort((a, b) => {
        const numA = parseInt(a.match(/segment-(\d+)/)?.[1] || '0');
        const numB = parseInt(b.match(/segment-(\d+)/)?.[1] || '0');
        return numA - numB;
      });
    
    if (segments.length === 0) {
      console.log(`   ⚠️  No segments found for meeting ${meetingNum}`);
      continue;
    }
    
    // Create a file list for ffmpeg concat
    const fileListPath = path.join(AUDIO_DIR, `meeting-${meetingNum}-filelist.txt`);
    const fileListContent = segments
      .map(seg => `file '${path.join(AUDIO_DIR, seg)}'`)
      .join('\n');
    
    await fs.writeFile(fileListPath, fileListContent);
    
    // Combine using ffmpeg
    const outputPath = path.join(AUDIO_DIR, `meeting-${meetingNum}-combined.mp3`);
    
    try {
      await execAsync(
        `ffmpeg -f concat -safe 0 -i "${fileListPath}" -c copy "${outputPath}"`
      );
      console.log(`   ✅ Combined: meeting-${meetingNum}-combined.mp3`);
      
      // Clean up file list
      await fs.remove(fileListPath);
    } catch (error) {
      console.error(`   ❌ Error combining audio: ${error}`);
    }
  }
  
  console.log('\n✅ Audio combination complete!\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  combineAudioSegments().catch(console.error);
}

