export interface MeetingTranscript {
  meetingTitle: string;
  date: Date;
  duration: number; // in seconds
  speakers: string[];
  segments: TranscriptSegment[];
}

export interface TranscriptSegment {
  speaker: string;
  timestamp: string; // MM:SS format
  text: string;
  timestampSeconds: number;
}

export interface DocumentData {
  title: string;
  date: Date;
  content: string;
  type: 'agenda' | 'bill' | 'report' | 'proposal' | 'memo';
}

export interface DiaryEntry {
  date: Date;
  dayOfWeek: string;
  content: string;
}

export interface WebsiteData {
  title: string;
  url: string;
  content: string;
  date: Date;
}

