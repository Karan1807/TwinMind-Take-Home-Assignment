# Test Data Generator for TwinMind Second Brain

This tool generates comprehensive test data for testing the TwinMind second brain prototype, including:

- **5 Audio Files**: Meeting recordings (5 minutes each) with transcripts, speaker names, and timestamps
- **10 Documents**: PDFs with different dates and topics (agendas, bills, reports, proposals, memos)
- **2 Website URLs**: HTML files with article content
- **7 Diary Entries**: Plain text files (one for each day of the week)
- **10-15 Images**: Generated images with metadata

## Prerequisites

1. **Node.js** (v18 or higher)
2. **OpenAI API Key** (for audio and image generation)
3. **ffmpeg** (optional, for combining audio segments)

## Setup

1. Install dependencies:

```bash
cd test-data-generator
npm install
```

2. Set your OpenAI API key:

```bash
export OPENAI_API_KEY=your-api-key-here
```

Or create a `.env` file:

```
OPENAI_API_KEY=your-api-key-here
```

## Usage

### Generate All Test Data

```bash
npm run generate
```

This will generate all test data types in the `output/` directory.

### Generate Individual Data Types

```bash
# Generate only audio files
npm run generate:audio

# Generate only documents
npm run generate:documents

# Generate only websites
npm run generate:websites

# Generate only diary entries
npm run generate:diary

# Generate only images
npm run generate:images
```

## Output Structure

```
output/
├── audio/
│   ├── meeting-1-transcript.json
│   ├── meeting-1-transcript.txt
│   ├── meeting-1-segment-1.mp3
│   ├── meeting-1-segment-2.mp3
│   └── ...
├── documents/
│   ├── document-1-*.pdf
│   ├── document-1-*.txt
│   └── ...
├── websites/
│   ├── website-1-*.html
│   ├── website-1-metadata.json
│   └── ...
├── diary/
│   ├── diary-monday-2024-01-15.txt
│   ├── diary-1-metadata.json
│   └── ...
└── images/
    ├── image-1-*.png
    ├── image-1-metadata.json
    └── ...
```

## Audio Files

Audio files are generated as individual segments for each speaker turn. **All meetings are centered around Karan as the main participant** - Karan is a consistent speaker in all 5 meetings with a consistent voice. Other speakers vary by meeting.

To combine segments into full audio files, use ffmpeg:

```bash
# Example: Combine segments for meeting 1
cd output/audio
ffmpeg -f concat -safe 0 -i <(printf "file '%s'\n" meeting-1-segment-*.mp3) -c copy meeting-1-combined.mp3
```

Or use the provided script (if available).

## Notes

- **API Costs**: Image and audio generation use OpenAI APIs and will incur costs
- **Generation Time**: Full generation may take 10-20 minutes depending on API response times
- **Audio Segments**: Audio is generated as segments that need to be combined (see above)
- **Image Generation**: Requires DALL-E 3 API access. If it fails, you can use placeholder images

## Customization

You can modify the content in:

- `src/generateAudio.ts` - Meeting transcripts and speakers
- `src/generateDocuments.ts` - Document content and types
- `src/generateWebsites.ts` - Website content
- `src/generateDiary.ts` - Diary entry content
- `src/generateImages.ts` - Image descriptions

## Troubleshooting

### OpenAI API Errors

- Verify your API key is set correctly
- Check your API credits/usage limits
- Ensure you have access to TTS and DALL-E APIs

### Audio Generation Issues

- Audio segments are generated separately
- Use ffmpeg to combine segments if needed
- Check file permissions in the output directory

### Image Generation Fails

- Verify DALL-E 3 API access
- Check API rate limits
- Consider using placeholder images instead

## Cleanup

To remove all generated test data:

```bash
rm -rf output/
```

## License

This is a test data generator for the TwinMind take-home assignment.
