import fs from 'fs-extra';
import path from 'path';
import { getOpenAIClient, IMAGES_DIR } from './config';

const openai = getOpenAIClient();

interface ImageDescription {
  title: string;
  description: string;
  date: Date;
}

function getImageDescriptions(): ImageDescription[] {
  const baseDate = new Date('2024-01-10');
  
  return [
    {
      title: 'Team Meeting Photo',
      description: 'A professional team meeting in a modern office conference room. Diverse group of 5-6 people sitting around a table with laptops, notebooks, and coffee cups. Natural lighting, business casual attire.',
      date: new Date(baseDate),
    },
    {
      title: 'Whiteboard with Architecture Diagram',
      description: 'A whiteboard covered with a software architecture diagram. Shows boxes, arrows, and labels for microservices, databases, and APIs. Colorful markers, clean handwriting, technical drawing style.',
      date: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Code on Computer Screen',
      description: 'Close-up of a computer screen showing TypeScript/JavaScript code. Modern IDE with syntax highlighting, clean code with functions and comments. Dark theme, professional development environment.',
      date: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Project Timeline Chart',
      description: 'A project management timeline chart on a wall. Colorful sticky notes and lines showing milestones, deadlines, and dependencies. Organized, visual project planning.',
      date: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Coffee and Laptop Workspace',
      description: 'A cozy workspace setup with a laptop, coffee cup, notebook, and pen. Natural morning light, minimalist desk, productive work environment aesthetic.',
      date: new Date(baseDate.getTime() + 10 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Data Visualization Dashboard',
      description: 'A computer screen displaying a data analytics dashboard. Charts, graphs, metrics, and KPIs. Modern UI design with blue and green color scheme, professional business intelligence tool.',
      date: new Date(baseDate.getTime() + 12 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Handwritten Meeting Notes',
      description: 'A page of handwritten meeting notes on lined paper. Bullet points, action items, diagrams, and doodles. Casual, authentic note-taking style with blue pen.',
      date: new Date(baseDate.getTime() + 15 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'API Documentation Screenshot',
      description: 'A screenshot of API documentation in a browser. Shows endpoints, request/response examples, code snippets. Clean, well-formatted technical documentation.',
      date: new Date(baseDate.getTime() + 18 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Team Collaboration Session',
      description: 'A team of developers pair programming. Two people at a computer, one typing, one pointing at the screen. Casual office environment, collaborative atmosphere.',
      date: new Date(baseDate.getTime() + 20 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'GitHub Repository View',
      description: 'A GitHub repository page on a computer screen. Shows file tree, README, commit history, and code. Popular open-source project with many stars and contributors.',
      date: new Date(baseDate.getTime() + 22 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Mobile App Mockup',
      description: 'A mobile app mockup on a phone screen. Modern UI design with cards, icons, and clean typography. Blue and white color scheme, professional app design.',
      date: new Date(baseDate.getTime() + 25 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Database Schema Diagram',
      description: 'A database schema diagram showing tables, relationships, and foreign keys. Entity-relationship diagram style, clear labels, professional database design documentation.',
      date: new Date(baseDate.getTime() + 28 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Error Log and Debugging',
      description: 'A computer screen showing error logs and debugging information. Stack traces, error messages, and code. Developer troubleshooting a technical issue.',
      date: new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Cloud Infrastructure Diagram',
      description: 'A cloud architecture diagram showing AWS services, servers, databases, and connections. Modern cloud infrastructure design with icons and labels.',
      date: new Date(baseDate.getTime() + 32 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Test Results and Coverage Report',
      description: 'A test results report on a computer screen. Shows test cases, pass/fail status, coverage percentages, and metrics. Green and red indicators, quality assurance dashboard.',
      date: new Date(baseDate.getTime() + 35 * 24 * 60 * 60 * 1000),
    },
  ];
}

export async function generateImages(): Promise<void> {
  console.log('\n🖼️  Generating Images...\n');
  
  await fs.ensureDir(IMAGES_DIR);
  
  const descriptions = getImageDescriptions();
  
  console.log('⚠️  Note: Image generation requires OpenAI DALL-E API access.');
  console.log('   This will generate 15 images, which may take several minutes and incur API costs.\n');
  
  for (let i = 0; i < descriptions.length; i++) {
    const img = descriptions[i];
    console.log(`🖼️  Image ${i + 1}/${descriptions.length}: ${img.title}`);
    console.log(`   Date: ${img.date.toISOString().split('T')[0]}`);
    
    try {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: img.description,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      });
      
      if (!response.data || response.data.length === 0) {
        throw new Error('No image data returned');
      }
      
      const imageUrl = response.data[0].url;
      if (!imageUrl) {
        throw new Error('No image URL returned');
      }
      
      // Download the image
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      
      const filename = `image-${i + 1}-${img.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
      const outputPath = path.join(IMAGES_DIR, filename);
      
      await fs.writeFile(outputPath, imageBuffer);
      console.log(`   ✅ Saved: ${filename}`);
      
      // Save metadata
      const metadata = {
        title: img.title,
        description: img.description,
        date: img.date.toISOString(),
        filename: filename,
        generatedAt: new Date().toISOString(),
      };
      const metadataPath = path.join(IMAGES_DIR, `image-${i + 1}-metadata.json`);
      await fs.writeJSON(metadataPath, metadata, { spaces: 2 });
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`   ❌ Error generating image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log(`   💡 Tip: You can skip image generation or use placeholder images instead.`);
      
      // Create a placeholder metadata file
      const metadata = {
        title: img.title,
        description: img.description,
        date: img.date.toISOString(),
        filename: `image-${i + 1}-placeholder.png`,
        note: 'Image generation failed - placeholder needed',
      };
      const metadataPath = path.join(IMAGES_DIR, `image-${i + 1}-metadata.json`);
      await fs.writeJSON(metadataPath, metadata, { spaces: 2 });
    }
  }
  
  console.log(`\n✅ Image generation complete! Files saved to: ${IMAGES_DIR}\n`);
  console.log('💡 Note: If some images failed to generate, you can:');
  console.log('   1. Check your OpenAI API key and credits');
  console.log('   2. Use placeholder images from a service like placeholder.com');
  console.log('   3. Manually add images to the images directory\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateImages().catch(console.error);
}

