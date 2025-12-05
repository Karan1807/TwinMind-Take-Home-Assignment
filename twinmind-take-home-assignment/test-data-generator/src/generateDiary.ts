import fs from 'fs-extra';
import path from 'path';
import { DiaryEntry } from './types';
import { DIARY_DIR } from './config';

function getDiaryEntries(): DiaryEntry[] {
  const baseDate = new Date('2024-01-15'); // Monday
  
  const entries: DiaryEntry[] = [];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dayOfWeek = daysOfWeek[i];
    
    let content = '';
    
    switch (i) {
      case 0: // Monday
        content = `Monday, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

Started the week with a morning run. The weather was perfect - crisp and clear. 
Had a productive team meeting where we discussed the Q1 roadmap. Sarah presented 
some interesting ideas about improving our development workflow.

Work was intense today. Spent most of the afternoon debugging a tricky issue with 
the authentication system. Finally figured it out around 4 PM - it was a timezone 
conversion bug. Classic mistake.

Evening was relaxing. Made pasta for dinner and watched an episode of that new 
sci-fi series everyone's talking about. The plot is getting interesting.

Tomorrow I need to:
- Review the PR from Mike
- Prepare slides for Thursday's presentation
- Call mom (she's been asking)

Feeling good about the week ahead.`;
        break;
        
      case 1: // Tuesday
        content = `Tuesday, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

Woke up feeling a bit tired, but coffee helped. Had a great conversation with 
Lisa about the new design system. She's really pushing for better consistency 
across our products, and I completely agree.

Lunch with the team was fun. We tried that new Thai place downtown. The pad thai 
was amazing. Talked about weekend plans - some people are going hiking, others 
are planning a game night.

Afternoon was focused on code reviews. Found a few potential security issues that 
we should address. Made a note to discuss with the security team.

Did some reading before bed - currently working through "The Pragmatic Programmer". 
Some really good insights about software craftsmanship.

Gratitude today:
- Great team collaboration
- Solved a complex problem
- Good food and good company`;
        break;
        
      case 2: // Wednesday
        content = `Wednesday, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

Mid-week already! Time is flying. Had a client call this morning that went really 
well. They're excited about the new features we're building. It's always rewarding 
to see positive feedback.

Spent time working on the presentation for tomorrow. Still need to refine a few 
slides, but the core content is solid. The data visualization looks good.

Took a walk during lunch break. The park near the office is beautiful this time of 
year. Saw some people playing frisbee - reminded me of college days.

Evening coding session was productive. Implemented a new feature that I've been 
thinking about for a while. The architecture feels clean and maintainable.

Random thought: I should start learning that new framework everyone's talking about. 
Maybe this weekend I'll do a tutorial.

Sleep schedule is getting better. Going to bed before midnight feels like an 
achievement these days.`;
        break;
        
      case 3: // Thursday
        content = `Thursday, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

Presentation day! It went really well. The team asked great questions and we had 
a productive discussion about implementation strategies. Feeling confident about 
the direction we're heading.

Had a one-on-one with my manager. We discussed career goals and potential growth 
opportunities. It's nice to have a supportive manager who actually cares about 
development.

After work, met up with some friends for trivia night at the local pub. Our team 
came in second place - not bad! The science round was our strong suit, but we 
struggled with pop culture questions.

Got home late but not too late. Watched a bit of TV and then called it a night.

Reflection: I'm getting better at public speaking. The practice is paying off. 
Maybe I should look into giving a talk at a local meetup.`;
        break;
        
      case 4: // Friday
        content = `Friday, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

TGIF! Wrapped up the week with a sprint retrospective. The team is in good spirits. 
We identified some process improvements that should help next sprint.

Deployed the new feature to staging. Everything looks good. Planning to push to 
production on Monday after final testing.

Had a team happy hour after work. It's nice to socialize outside of work context. 
We talked about everything except work - movies, travel plans, random life stuff.

Weekend plans:
- Saturday: Hiking with friends (weather looks perfect)
- Sunday: Brunch, then maybe some coding or reading

Feeling accomplished about the week. Made good progress on multiple fronts. The 
work-life balance feels right.

Time to unwind and enjoy the weekend!`;
        break;
        
      case 5: // Saturday
        content = `Saturday, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

Perfect Saturday! Went hiking with a group of friends. The trail was challenging 
but the views were absolutely worth it. Took lots of photos - the mountains look 
incredible this time of year.

Had a picnic at the summit. Everyone brought something to share. Good food, good 
conversation, good company. These are the moments that matter.

Got back home around 4 PM, tired but happy. Took a long shower and then just 
relaxed on the couch. Sometimes doing nothing is exactly what you need.

Ordered pizza for dinner and watched a movie. Simple pleasures.

Didn't think about work at all today, which is exactly how it should be. The 
mental break is important.

Tomorrow I might do some light coding on that side project, but no pressure. 
The weekend is for recharging.`;
        break;
        
      case 6: // Sunday
        content = `Sunday, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

Lazy Sunday morning. Slept in, made pancakes, and just took it easy. Read the 
news with coffee - trying to stay informed without getting overwhelmed.

Did some meal prep for the week. Cooking is therapeutic for me. Made a big batch 
of soup and some roasted vegetables. Future me will be grateful.

Spent a couple hours on that side project. Made some progress on the UI. It's 
coming together nicely. Sometimes working on something just for fun is the best 
kind of work.

Called my parents. They're doing well. Mom's garden is thriving, dad's working 
on a new woodworking project. Good to catch up.

Evening was quiet. Did some reading, organized my workspace for the week ahead, 
and just generally prepared for Monday.

Weekend reflection: Good balance of activity and rest. Feeling ready for the week 
ahead. The hiking was a highlight - nature is the best reset button.

Goals for next week:
- Finish the authentication refactor
- Write that blog post I've been putting off
- Start that online course I signed up for

Here's to a productive week!`;
        break;
    }
    
    entries.push({
      date,
      dayOfWeek,
      content,
    });
  }
  
  return entries;
}

export async function generateDiary(): Promise<void> {
  console.log('\n📔 Generating Diary Entries...\n');
  
  await fs.ensureDir(DIARY_DIR);
  
  const entries = getDiaryEntries();
  
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const filename = `diary-${entry.dayOfWeek.toLowerCase()}-${entry.date.toISOString().split('T')[0]}.txt`;
    const outputPath = path.join(DIARY_DIR, filename);
    
    console.log(`📔 ${entry.dayOfWeek}, ${entry.date.toISOString().split('T')[0]}`);
    
    await fs.writeFile(outputPath, entry.content);
    console.log(`   ✅ Saved: ${filename}`);
    
    // Also save metadata
    const metadata = {
      date: entry.date.toISOString(),
      dayOfWeek: entry.dayOfWeek,
      filename: filename,
      wordCount: entry.content.split(/\s+/).length,
    };
    const metadataPath = path.join(DIARY_DIR, `diary-${i + 1}-metadata.json`);
    await fs.writeJSON(metadataPath, metadata, { spaces: 2 });
  }
  
  console.log(`\n✅ Diary generation complete! Files saved to: ${DIARY_DIR}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateDiary().catch(console.error);
}

