import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getOpenAIClient, OUTPUT_DIR, AUDIO_DIR, TTS_VOICES } from './config';
import { MeetingTranscript, TranscriptSegment } from './types';

const openai = getOpenAIClient();
const execAsync = promisify(exec);

// Helper function to create greeting segments
function createGreetings(speakers: string[]): Array<{ speaker: string; text: string }> {
  const karanIndex = speakers.indexOf('Karan');
  const otherSpeakers = speakers.filter(s => s !== 'Karan');
  
  const greetings: Array<{ speaker: string; text: string }> = [];
  
  // Karan greets everyone first
  if (karanIndex !== -1) {
    const greetingText = otherSpeakers.length > 0
      ? `Hi everyone, good morning. Thanks for joining. ${otherSpeakers.join(', ')}, great to have you all here. Let's get started.`
      : "Hi everyone, good morning. Thanks for joining. Let's get started.";
    greetings.push({ speaker: 'Karan', text: greetingText });
  }
  
  // Other speakers greet everyone
  for (const speaker of otherSpeakers) {
    const others = speakers.filter(s => s !== speaker);
    const greetingText = `Hi ${others.join(', ')}, good morning. Thanks for having me.`;
    greetings.push({ speaker, text: greetingText });
  }
  
  return greetings;
}

// Generate realistic meeting transcripts
function generateMeetingTranscripts(): MeetingTranscript[] {
  const baseDate = new Date('2024-01-15');
  
  return [
    {
      meetingTitle: 'Q4 Planning Discussion',
      date: new Date(baseDate),
      duration: 180, // 3 minutes
      speakers: ['Karan', 'Sarah Chen', 'Mike Rodriguez'],
      segments: generateSegments([
        // Greetings
        ...createGreetings(['Karan', 'Sarah Chen', 'Mike Rodriguez']),
        // Main discussion
        { speaker: 'Sarah Chen', text: "Thanks Karan. Let's start with our Q4 planning. Today is January 15th, 2024, and we need to finalize our roadmap. Karan, you've been working on this. Can you walk us through your recommendations?" },
        { speaker: 'Karan', text: "Thanks Sarah. I've been reviewing the backlog extensively since January 8th, and I think we should focus on the authentication improvements first. It's blocking several other features that we want to ship, including the new payment integration and the user profile enhancements. The current auth system is using outdated protocols and doesn't support multi-factor authentication, which is becoming a security requirement for many of our enterprise clients." },
        { speaker: 'Mike Rodriguez', text: "I completely agree with Karan. The auth system is becoming a significant bottleneck. We've had three incidents in January alone where authentication failures caused service disruptions. What's your estimate for the work, Karan?" },
        { speaker: 'Karan', text: "Looking at about 80K for the full authentication overhaul. That includes security audits by a third-party firm, comprehensive testing including penetration testing, and migration of existing users to the new system. I've broken it down in detail in the document I shared earlier. The timeline would be about 8 weeks, starting from January 22nd, with the first 4 weeks focused on development through mid-February, and the next 4 weeks on testing and migration, wrapping up by March 15th." },
        { speaker: 'Sarah Chen', text: "That makes sense. We have 200K allocated for Q4 2024 total. What else should we prioritize beyond the authentication work?" },
        { speaker: 'Karan', text: "I think we should also consider the mobile app redesign. It's been on hold since Q3 2023, and our mobile metrics are declining. User engagement on mobile has dropped by 15% over the past quarter, and we're seeing increased churn. The redesign would address usability issues and improve performance. That would be around 120K, which includes both iOS and Android development, design work, and user testing." },
        { speaker: 'Mike Rodriguez', text: "That leaves us with essentially no budget for other initiatives. Are there any smaller, high-impact items we can squeeze in?" },
        { speaker: 'Karan', text: "Yes, I've identified a few quick wins that would cost around 20K total. These include performance optimizations for our API endpoints, which should reduce response times by about 30%, and some UX improvements to the dashboard that users have been requesting. I can share the detailed breakdown of these items. They're all things we can complete in parallel with the larger projects." },
        { speaker: 'Sarah Chen', text: "Okay, so the plan is auth first, then mobile, then the quick wins. Karan, can you have a detailed timeline with milestones and dependencies by end of week? That would be Friday, January 19th." },
        { speaker: 'Karan', text: "Absolutely. I'll have the full breakdown with milestones, dependencies, and risk assessments ready by Friday, January 19th. I'll also include resource allocation details and potential blockers we should be aware of. Thanks everyone for the productive discussion." },
      ], 180)
    },
    {
      meetingTitle: 'Product Feature Brainstorming',
      date: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000), // +7 days
      duration: 180, // 3 minutes
      speakers: ['Karan', 'Emma Watson', 'James Taylor'],
      segments: generateSegments([
        // Greetings
        ...createGreetings(['Karan', 'Emma Watson', 'James Taylor']),
        // Main discussion
        { speaker: 'Karan', text: "Alright team, we're here to brainstorm new features for our platform. Today is January 22nd, 2024. I've been analyzing user analytics since December 2023, and we're seeing a significant drop in daily active users - about 20% compared to Q4 2023. The retention rate has also decreased, especially for users who joined between July and December 2023. What are your thoughts on what might be causing this and how we can address it?" },
        { speaker: 'Emma Watson', text: "I think we need a notification system. Users aren't coming back because they don't know when there's new content or when someone interacts with their posts. We're missing opportunities to re-engage users at the right moments." },
        { speaker: 'Karan', text: "That's a really good point, Emma. I've been thinking about that too. The question is, what would trigger these notifications? We need to be careful not to spam users, because that could make the problem worse. We should probably start with high-value notifications like direct messages, mentions, and important updates, then gradually expand based on user preferences." },
        { speaker: 'James Taylor', text: "What about gamification? Leaderboards, achievements, badges, that kind of thing? That could increase engagement and give users reasons to come back regularly. I've seen this work really well in other platforms." },
        { speaker: 'Karan', text: "I like both ideas actually. For notifications, I think we could notify users about new content from people they follow, friend activity, or personalized recommendations based on their interests and behavior. We could also implement a smart notification system that learns from user engagement patterns to optimize timing and frequency." },
        { speaker: 'Emma Watson', text: "The recommendation angle is particularly interesting. We could use machine learning to suggest relevant content, which would not only increase engagement but also help users discover new things they might like." },
        { speaker: 'Karan', text: "Exactly. I've been researching recommendation algorithms, and I think we could start with a simple collaborative filtering approach using user interaction data. Then we can improve it over time with more sophisticated models. The key is to make sure the recommendations are actually relevant and valuable. What do you think, James? How would gamification integrate with this?" },
        { speaker: 'James Taylor', text: "That sounds like a solid plan. I can help design and implement the gamification features - things like points for daily logins, badges for completing profile sections, leaderboards for top contributors. If you want to take the lead on recommendations, Karan, I think we can make these features complement each other really well." },
        { speaker: 'Karan', text: "Perfect. Emma, can you handle the notification infrastructure? I'll work on the recommendation system architecture and we can integrate them. I'm thinking we could have a unified system where notifications can include achievement unlocks, which ties the two features together nicely." },
        { speaker: 'Emma Watson', text: "Yes, absolutely. I'll coordinate with the backend team on the infrastructure. We'll need to set up a notification service, probably using a queue system to handle the volume. Let's reconvene on February 5th with prototypes and see how they work together." },
        { speaker: 'Karan', text: "Great. I'll have a working demo of the recommendation engine by February 5th, with some sample data to show how it would work. I'll also prepare a technical design document for both features. Thanks everyone for the great ideas and collaboration." },
      ], 180)
    },
    {
      meetingTitle: 'Sprint Retrospective',
      date: new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000), // +14 days
      duration: 180, // 3 minutes
      speakers: ['Karan', 'Priya Patel', 'Tom Anderson'],
      segments: generateSegments([
        // Greetings
        ...createGreetings(['Karan', 'Priya Patel', 'Tom Anderson']),
        // Main discussion
        { speaker: 'Karan', text: "Welcome to our sprint retrospective. Today is January 29th, 2024, and we're wrapping up our two-week sprint that started on January 15th. Let's start with what went well this sprint. I'll go first - I think our deployment process improved significantly. We've made some real progress there." },
        { speaker: 'Priya Patel', text: "I completely agree, Karan. We reduced deployment time from 30 minutes down to about 10 minutes. That's a huge improvement and it's made our releases much smoother." },
        { speaker: 'Karan', text: "Yeah, and the new CI/CD pipeline I set up on January 18th has been catching several bugs before they reach production. We've prevented at least 5 production issues this sprint alone. That's saved us a lot of debugging time and reduced the number of hotfixes we've had to deploy. The automated testing is really paying off." },
        { speaker: 'Tom Anderson', text: "Definitely. The code quality has improved too. Now, what could we improve? Karan, you mentioned documentation earlier this week, on January 25th I believe." },
        { speaker: 'Karan', text: "Right. I think we need better documentation, especially for the new features I've been working on. Some of the authentication refactoring and the new API endpoints aren't well documented, which has slowed down onboarding for new team members. I take full responsibility for that - I should have prioritized documentation alongside development." },
        { speaker: 'Priya Patel', text: "I can definitely help with that. Also, I've noticed our daily standups are running too long - we're consistently going over the 15-minute time box. Maybe we should be more strict about keeping them focused and moving longer discussions to separate meetings." },
        { speaker: 'Karan', text: "That's a really good point. I've noticed we're going over time too often, and it's affecting our productivity. Let's commit to improving documentation in the next sprint starting February 5th, and I'll help enforce the 15-minute standup rule. We can use a timer and be more disciplined about deferring detailed discussions." },
        { speaker: 'Tom Anderson', text: "I can create a documentation template that we can use for all new features. It would include sections for overview, architecture, API endpoints, testing instructions, and deployment notes. That way we have a consistent structure." },
        { speaker: 'Karan', text: "Perfect. I'll make sure to use it for all my upcoming work, starting with documenting the authentication changes. Priya, can you help review and maintain the docs? Let's make it a team effort so the documentation stays up to date." },
        { speaker: 'Priya Patel', text: "Absolutely. I'll set up a review process where we update docs as part of our PR process. Thanks for leading this initiative, Karan." },
        { speaker: 'Karan', text: "Thanks everyone. I think we've identified some good improvements. Let's keep the momentum going into the next sprint starting February 5th and make sure we follow through on these commitments." },
      ], 180)
    },
    {
      meetingTitle: 'Client Requirements Review',
      date: new Date(baseDate.getTime() + 21 * 24 * 60 * 60 * 1000), // +21 days
      duration: 180, // 3 minutes
      speakers: ['Karan', 'Rachel Green', 'Chris Brown'],
      segments: generateSegments([
        // Greetings
        ...createGreetings(['Karan', 'Rachel Green', 'Chris Brown']),
        // Main discussion
        { speaker: 'Rachel Green', text: "Thanks for joining, Karan. Today is February 5th, 2024, and we're here to review the requirements from our client for the new dashboard feature. Karan, you've been the lead on this project, so I'd like to start with your assessment of the requirements." },
        { speaker: 'Karan', text: "Thanks Rachel. I've reviewed the requirements document thoroughly since we received it on February 1st. They want real-time data visualization with custom date ranges, which is definitely doable. The dashboard needs to display metrics like user engagement, revenue trends, and conversion rates. They also want the ability to filter by different dimensions like geography, product category, and user segments. The real-time aspect means we'll need to update the charts as new data comes in, probably every few seconds." },
        { speaker: 'Chris Brown', text: "I've looked at the technical requirements as well. We'll need to set up WebSocket connections for real-time updates to avoid constant polling. Karan, have you worked with WebSockets in production before? There are some scalability considerations we need to think about." },
        { speaker: 'Karan', text: "Yes, I have experience with WebSockets. I've already started prototyping the WebSocket implementation using Socket.io, which handles reconnection and scaling pretty well. The main challenge will be handling the data sources - they want to integrate with their existing CRM system, which uses Salesforce, and their analytics platform, which is a custom solution. We'll need to build adapters for both." },
        { speaker: 'Rachel Green', text: "Can you handle that integration work, Karan? Or do we need additional resources?" },
        { speaker: 'Karan', text: "I've worked with the Salesforce API before on a previous project in December 2023, so that should be straightforward. I know their REST API and can set up OAuth authentication. The analytics platform might need some custom work though, since it's their proprietary system. I'll need access to their API documentation and possibly a sandbox environment to test the integration." },
        { speaker: 'Chris Brown', text: "I can help with the analytics integration if you need support, Karan. I've done similar work before and can handle the data transformation layer if that would be helpful." },
        { speaker: 'Karan', text: "Thanks Chris, that would be great. They also want export functionality - PDF and CSV formats. The PDF should include charts and be formatted nicely for presentations. I can use our existing libraries for that - we have PDF generation set up already, and CSV export is straightforward. The main work will be ensuring the exported data matches what's shown in the dashboard." },
        { speaker: 'Rachel Green', text: "Great. What's your timeline looking like, Karan? The client is hoping to see a prototype soon, ideally by the end of February." },
        { speaker: 'Karan', text: "I think we can have a working prototype ready by February 26th, which is three weeks from today. I'll have the WebSocket infrastructure and basic dashboard UI done by February 12th, then we can spend the following two weeks integrating the data sources and polishing the export functionality. I'll send weekly status updates every Monday so everyone stays in the loop." },
        { speaker: 'Rachel Green', text: "That timeline works well. I'll send a summary email to the client confirming the approach and timeline. Thanks Karan for leading this project." },
        { speaker: 'Karan', text: "No problem at all. I'm excited about this project. I'll keep everyone updated on progress and flag any blockers early. Thanks for the support, Chris." },
      ], 180)
    },
    {
      meetingTitle: 'Technical Architecture Discussion',
      date: new Date(baseDate.getTime() + 28 * 24 * 60 * 60 * 1000), // +28 days
      duration: 180, // 3 minutes
      speakers: ['Karan', 'Sophie Martin', 'Ryan O\'Connor'],
      segments: generateSegments([
        // Greetings
        ...createGreetings(['Karan', 'Sophie Martin', 'Ryan O\'Connor']),
        // Main discussion
        { speaker: 'Karan', text: "Thanks everyone for joining. Today is February 12th, 2024. We need to discuss our architecture for the new microservices migration. The current monolith is becoming hard to maintain - we're seeing deployment issues, scaling problems, and it's getting difficult for multiple teams to work on it simultaneously. I've been doing some research on container orchestration options since early February." },
        { speaker: 'Sophie Martin', text: "I've been looking into this too. Kubernetes seems like a good fit given its capabilities, but we need to consider the learning curve for the team. Not everyone has experience with Kubernetes, and it can be quite complex." },
        { speaker: 'Karan', text: "That's a very valid concern, Sophie. I've been evaluating both Kubernetes and Docker Swarm since February 1st. Kubernetes is definitely more powerful and feature-rich - it handles auto-scaling, service discovery, load balancing, rolling updates, and has a huge ecosystem. Docker Swarm is simpler and might be enough for our current scale, but it's less flexible and has fewer features. Given that we're planning to grow, I think Kubernetes would be the better long-term choice." },
        { speaker: 'Ryan O\'Connor', text: "What are our specific requirements exactly? That would help us make a more informed decision. Are we talking about just basic container orchestration, or do we need advanced features?" },
        { speaker: 'Karan', text: "Good question. We need auto-scaling based on CPU and memory metrics, service discovery so services can find each other, load balancing across multiple instances, health checks and automatic restarts, rolling updates without downtime, and the ability to handle secrets and configuration management. Kubernetes handles all of that out of the box with its native features. Docker Swarm can do some of this, but would require more manual configuration and third-party tools." },
        { speaker: 'Sophie Martin', text: "True, but we're a relatively small team - about 8 developers. The complexity of Kubernetes might slow us down more than help, especially in the beginning. What's our timeline for this migration, Karan?" },
        { speaker: 'Karan', text: "We have three months to complete the migration, starting from today, February 12th, which means we need to finish by May 12th, 2024. I think that's enough time to get comfortable with Kubernetes. I'm willing to lead this migration and invest the time to learn it deeply. I think the initial learning curve is worth it for the long-term benefits. Plus, Kubernetes skills are valuable and will help the team grow professionally." },
        { speaker: 'Ryan O\'Connor', text: "That would be really helpful. Can you create training materials and run workshops for the team? Maybe we could do a series of sessions to get everyone up to speed." },
        { speaker: 'Karan', text: "Absolutely. I'll create comprehensive training materials including tutorials, best practices, and common patterns. I'll also set up a local development environment using Minikube or Kind so everyone can practice. I'm thinking we start with a small service as a proof of concept - maybe the user service, since it's relatively self-contained. That way we can learn and iterate before doing the full migration." },
        { speaker: 'Sophie Martin', text: "That sounds like a solid plan. When can you have the POC ready? And what would success look like for the proof of concept?" },
        { speaker: 'Karan', text: "I can have the POC ready by February 26th, which is two weeks from today. Success would mean the user service running in Kubernetes, with auto-scaling working, health checks passing, and a successful deployment process. Then we can evaluate, gather feedback from the team, and decide on the full migration approach by early March. Sound good?" },
        { speaker: 'Ryan O\'Connor', text: "Perfect. I think that's a reasonable approach. Thanks for taking the lead on this, Karan. I'm happy to help with the training sessions or documentation." },
        { speaker: 'Karan', text: "No problem at all. I'm excited about this project. I'll keep everyone updated on progress and share learnings as we go. Thanks for the support." },
      ], 180)
    },
  ];
}

function generateSegments(
  rawSegments: Array<{ speaker: string; text: string }>,
  totalDuration: number
): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  let currentTime = 0;
  const timePerSegment = totalDuration / rawSegments.length;
  
  for (let i = 0; i < rawSegments.length; i++) {
    const segment = rawSegments[i];
    const timestampSeconds = Math.floor(currentTime);
    const minutes = Math.floor(timestampSeconds / 60);
    const seconds = timestampSeconds % 60;
    const timestamp = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    segments.push({
      speaker: segment.speaker,
      timestamp,
      text: segment.text,
      timestampSeconds,
    });
    
    // Estimate speaking time (average 150 words per minute, ~5 chars per word)
    const estimatedDuration = Math.max(3, Math.min(15, (segment.text.length / 5) / 2.5));
    currentTime += estimatedDuration;
  }
  
  return segments;
}

async function generateAudioFromText(text: string, voice: string, outputPath: string): Promise<void> {
  console.log(`   Generating audio with voice ${voice}...`);
  
  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice: voice as any,
    input: text,
  });
  
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(outputPath, buffer);
  console.log(`   ✅ Saved: ${outputPath}`);
}

async function combineAudioFiles(audioFiles: string[], outputPath: string): Promise<void> {
  console.log(`   Combining ${audioFiles.length} audio segments...`);
  
  // Check if ffmpeg is available
  try {
    await execAsync('ffmpeg -version');
  } catch (error) {
    console.log(`   ⚠️  ffmpeg not found. Skipping audio combination.`);
    console.log(`   Install ffmpeg to combine audio: brew install ffmpeg (macOS) or apt-get install ffmpeg (Linux)`);
    return;
  }
  
  // Create a temporary file list for ffmpeg concat
  const fileListPath = outputPath.replace('.mp3', '-filelist.txt');
  const fileListContent = audioFiles
    .map(file => `file '${path.resolve(file)}'`)
    .join('\n');
  
  await fs.writeFile(fileListPath, fileListContent);
  
  try {
    // Use ffmpeg to concatenate audio files
    await execAsync(
      `ffmpeg -f concat -safe 0 -i "${fileListPath}" -c copy "${outputPath}"`
    );
    console.log(`   ✅ Combined audio saved: ${path.basename(outputPath)}`);
    
    // Clean up temporary file list
    await fs.remove(fileListPath);
  } catch (error) {
    console.error(`   ❌ Error combining audio: ${error}`);
    // Clean up on error
    if (await fs.pathExists(fileListPath)) {
      await fs.remove(fileListPath);
    }
  }
}

export async function generateAudioFiles(): Promise<void> {
  console.log('\n🎵 Generating Audio Files...\n');
  
  await fs.ensureDir(AUDIO_DIR);
  
  const transcripts = generateMeetingTranscripts();
  const voiceKeys = Object.keys(TTS_VOICES);
  
  for (let i = 0; i < transcripts.length; i++) {
    const transcript = transcripts[i];
    console.log(`\n📝 Meeting ${i + 1}: ${transcript.meetingTitle}`);
    console.log(`   Date: ${transcript.date.toISOString().split('T')[0]}`);
    console.log(`   Speakers: ${transcript.speakers.join(', ')}`);
    
    // Create speaker voice mapping
    // Karan always gets the same voice (onyx - a consistent male voice)
    const speakerVoices: Record<string, string> = {};
    const karanVoice = 'onyx'; // Consistent voice for Karan across all meetings
    const otherVoices = voiceKeys.filter(v => v !== karanVoice);
    
    let otherVoiceIndex = 0;
    transcript.speakers.forEach((speaker) => {
      if (speaker === 'Karan') {
        speakerVoices[speaker] = karanVoice;
      } else {
        // Assign other voices to other speakers
        speakerVoices[speaker] = otherVoices[otherVoiceIndex % otherVoices.length];
        otherVoiceIndex++;
      }
    });
    
    // Generate audio for each segment
    const segmentFiles: string[] = [];
    
    for (let j = 0; j < transcript.segments.length; j++) {
      const segment = transcript.segments[j];
      const voice = speakerVoices[segment.speaker];
      const segmentFile = path.join(AUDIO_DIR, `meeting-${i + 1}-segment-${j + 1}.mp3`);
      
      await generateAudioFromText(segment.text, voice, segmentFile);
      segmentFiles.push(segmentFile);
    }
    
    // Save transcript as JSON
    const transcriptFile = path.join(AUDIO_DIR, `meeting-${i + 1}-transcript.json`);
    await fs.writeJSON(transcriptFile, transcript, { spaces: 2 });
    console.log(`   ✅ Transcript saved: ${transcriptFile}`);
    
    // Note: For full audio file, you'd combine segments using ffmpeg
    // For now, we'll create a combined transcript text file
    const combinedTranscript = transcript.segments
      .map(s => `[${s.timestamp}] ${s.speaker}: ${s.text}`)
      .join('\n\n');
    
    const combinedTextFile = path.join(AUDIO_DIR, `meeting-${i + 1}-transcript.txt`);
    await fs.writeFile(combinedTextFile, combinedTranscript);
    console.log(`   ✅ Combined transcript saved: ${combinedTextFile}`);
    
    // Combine audio segments into a single file
    const combinedAudioPath = path.join(AUDIO_DIR, `meeting-${i + 1}-combined.mp3`);
    await combineAudioFiles(segmentFiles, combinedAudioPath);
  }
  
  console.log(`\n✅ Audio generation complete! Files saved to: ${AUDIO_DIR}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateAudioFiles().catch(console.error);
}

