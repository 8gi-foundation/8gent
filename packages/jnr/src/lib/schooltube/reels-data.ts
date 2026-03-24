/**
 * SchoolTube Reels Data - Extended feed with videos + games
 * Ported from Nick prototype, rebuilt for 8gent Jr warm palette
 *
 * Uses the shared Reel type from data.ts but adds:
 * - YouTube video entries with embed URLs
 * - Topics array for multi-category filtering
 * - Daily routine schedule (2-week rotating)
 */

import type { Reel } from './data';
import { REELS_DATA } from './data';

// ── Extended reel with topics for feed filtering ──

export type FeedReel = Reel & {
  topics: string[];
};

/** Convert base Reel[] into FeedReel[] by deriving topics from category */
export function toFeedReels(reels: Reel[]): FeedReel[] {
  return reels.map((r) => ({
    ...r,
    topics: [r.category],
  }));
}

// ── Video entries (YouTube educational content) ──

export const VIDEO_REELS: FeedReel[] = [
  {
    id: 'vid-numbers-balls',
    title: 'Learn Numbers with Colorful Balls',
    emoji: '',
    type: 'video',
    category: 'numbers',
    videoUrl: 'https://www.youtube.com/watch?v=jJ1oH59faX4',
    duration: '21:40',
    topics: ['numbers', 'colors'],
  },
  {
    id: 'vid-counting-objects',
    title: 'Counting 1 to 10 with Objects',
    emoji: '',
    type: 'video',
    category: 'numbers',
    videoUrl: 'https://www.youtube.com/watch?v=IIiet2JJVcA',
    duration: '8:32',
    topics: ['numbers'],
  },
  {
    id: 'vid-abc-song',
    title: 'ABC Song with Dancing Letters',
    emoji: '',
    type: 'video',
    category: 'letters',
    videoUrl: 'https://www.youtube.com/watch?v=Kp0bTDOnXYM',
    duration: '3:45',
    topics: ['letters'],
  },
  {
    id: 'vid-alphabet-dance',
    title: 'Alphabet Dance Party',
    emoji: '',
    type: 'video',
    category: 'letters',
    videoUrl: 'https://www.youtube.com/watch?v=c3m0-6K1bY0',
    duration: '4:20',
    topics: ['letters'],
  },
  {
    id: 'vid-rainbow-colors',
    title: 'Colors of the Rainbow',
    emoji: '',
    type: 'video',
    category: 'colors',
    videoUrl: 'https://www.youtube.com/watch?v=PN0u1hqfZXw',
    duration: '5:20',
    topics: ['colors'],
  },
  {
    id: 'vid-rainbow-song',
    title: 'Rainbow Song - Learn All Colors',
    emoji: '',
    type: 'video',
    category: 'colors',
    videoUrl: 'https://www.youtube.com/watch?v=wW1iKYKhLyY',
    duration: '3:15',
    topics: ['colors'],
  },
  {
    id: 'vid-shapes',
    title: 'Shapes All Around Us',
    emoji: '',
    type: 'video',
    category: 'shapes',
    videoUrl: 'https://www.youtube.com/watch?v=jlzX8jt0Now',
    duration: '8:15',
    topics: ['shapes'],
  },
  {
    id: 'vid-shapes-song',
    title: 'Squares, Circles & Triangles Song',
    emoji: '',
    type: 'video',
    category: 'shapes',
    videoUrl: 'https://www.youtube.com/watch?v=BwFmDGOAS6s',
    duration: '3:50',
    topics: ['shapes'],
  },
];

/** All feed reels: games from data.ts + video entries */
export const ALL_FEED_REELS: FeedReel[] = [
  ...toFeedReels(REELS_DATA),
  ...VIDEO_REELS,
];

// ── Daily Routine (2-week rotating schedule) ──

export type DayActivity = {
  day: string;
  theme: string;
  activity: string;
  duration: number;
  description: string;
  games: string[];
  color: string;
};

const WEEK_1: DayActivity[] = [
  { day: 'Monday', theme: 'Language Development', activity: 'Animal Names & Sounds', duration: 15, description: 'Learn animal names and the sounds they make!', games: ['animalSounds'], color: '#E8610A' },
  { day: 'Tuesday', theme: 'Emotional Expression', activity: 'Explore Feelings', duration: 12, description: 'Learn about emotions and how to express them!', games: ['feelings'], color: '#D4A574' },
  { day: 'Wednesday', theme: 'Phonics Practice', activity: 'Letter & Sound Recognition', duration: 14, description: 'Learn letters and the sounds they make!', games: ['letterTrace'], color: '#8B6914' },
  { day: 'Thursday', theme: 'Nature Exploration', activity: 'Naming Objects in Nature', duration: 15, description: 'Discover things we see in nature!', games: ['natureExplore'], color: '#6B8E23' },
  { day: 'Friday', theme: 'Speech Practice', activity: 'Word Repetition', duration: 14, description: 'Practice saying words clearly!', games: ['wordRepeat'], color: '#B87333' },
  { day: 'Saturday', theme: 'Sequencing', activity: 'What Comes Next?', duration: 17, description: 'Figure out patterns and what comes next!', games: ['patternComplete', 'numberOrder'], color: '#CD853F' },
  { day: 'Sunday', theme: 'Coordination Game', activity: 'Copy the Move', duration: 18, description: 'Watch and copy movements with speech!', games: ['copyMove'], color: '#E8610A' },
];

const WEEK_2: DayActivity[] = [
  { day: 'Monday', theme: 'Storytelling', activity: 'Build Short Sentences', duration: 16, description: 'Create simple sentences with pictures!', games: ['sentenceBuilder'], color: '#D4A574' },
  { day: 'Tuesday', theme: 'Movement & Speech', activity: 'Jumping & Numbers', duration: 15, description: 'Move your body while learning numbers!', games: ['jumpCount'], color: '#E8610A' },
  { day: 'Wednesday', theme: 'Music & Rhyming', activity: 'Rhyming & Rhythm', duration: 11, description: 'Make music and find words that rhyme!', games: ['musicalBalls'], color: '#8B6914' },
  { day: 'Thursday', theme: 'Logic Skills', activity: 'Match & Pair Items', duration: 13, description: 'Find things that go together!', games: ['memoryMatch', 'matching'], color: '#6B8E23' },
  { day: 'Friday', theme: 'Speech Practice', activity: 'Word Repetition', duration: 14, description: 'Practice saying words clearly!', games: ['wordRepeat'], color: '#B87333' },
  { day: 'Saturday', theme: 'Sensory Play', activity: 'Calming Activities', duration: 15, description: 'Relax with satisfying sensory games!', games: ['ballRain', 'bubbleWrap', 'spinFidget', 'rainbowPaint'], color: '#CD853F' },
  { day: 'Sunday', theme: 'Free Play', activity: 'Choose Your Favorite', duration: 20, description: 'Play any game you want today!', games: [], color: '#E8610A' },
];

export function getTodayActivity(): DayActivity {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const weekOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
  const schedule = weekOfYear % 2 === 0 ? WEEK_1 : WEEK_2;
  const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  return schedule[dayIndex];
}

export function getWeekSchedule(): DayActivity[] {
  const today = new Date();
  const weekOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
  return weekOfYear % 2 === 0 ? WEEK_1 : WEEK_2;
}

export function getCurrentWeek(): 1 | 2 {
  const today = new Date();
  const weekOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
  return weekOfYear % 2 === 0 ? 1 : 2;
}
