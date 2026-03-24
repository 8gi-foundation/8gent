/**
 * 8gent Jr - Emotional Regulation Playlists
 *
 * Grounded in GLP (Gestalt Language Processing) research:
 * - GLPs are "intonation babies" who learn language through MELODY first
 * - Music preserves prosody and rhythm, which are primary language pathways
 * - Emotional playlists support co-regulation and sensory needs
 */

// =============================================================================
// Types
// =============================================================================

export interface EmotionalPlaylist {
  id: string;
  mood: string;
  label: string;
  description: string;
  tempo: 'slow' | 'medium' | 'fast';
  energy: 'low' | 'medium' | 'high';
  colors: [string, string];
  icon: string;
  bpmRange: [number, number];
  tracks: string[];
  glpNote: string;
}

export type MoodKey = 'calm' | 'happy' | 'focus' | 'energize' | 'sleepy' | 'brave' | 'silly';

// =============================================================================
// Playlists
// =============================================================================

export const EMOTIONAL_PLAYLISTS: Record<MoodKey, EmotionalPlaylist> = {
  calm: {
    id: 'mood-calm',
    mood: 'calm',
    label: 'Calm Down',
    description: 'When the child needs to relax or self-regulate',
    tempo: 'slow',
    energy: 'low',
    colors: ['#81D4FA', '#B3E5FC'],
    icon: 'cloud',
    bpmRange: [50, 70],
    tracks: [],
    glpNote: 'Slow, predictable melodies support co-regulation and reduce sensory overload',
  },
  happy: {
    id: 'mood-happy',
    mood: 'happy',
    label: 'Happy Time',
    description: 'Celebrating and joy -- reinforces positive moments',
    tempo: 'medium',
    energy: 'high',
    colors: ['#FFF176', '#FFD54F'],
    icon: 'sun',
    bpmRange: [100, 130],
    tracks: [],
    glpNote: 'Upbeat songs with repetitive choruses support gestalt phrase acquisition',
  },
  focus: {
    id: 'mood-focus',
    mood: 'focus',
    label: 'Focus Music',
    description: 'Concentration time -- learning and therapy sessions',
    tempo: 'medium',
    energy: 'medium',
    colors: ['#A5D6A7', '#81C784'],
    icon: 'leaf',
    bpmRange: [70, 90],
    tracks: [],
    glpNote: 'Steady rhythm without lyrics helps maintain attention for AAC use',
  },
  energize: {
    id: 'mood-energize',
    mood: 'energize',
    label: 'Move & Dance',
    description: 'Movement and physical activity -- gross motor play',
    tempo: 'fast',
    energy: 'high',
    colors: ['#FF8A65', '#FF7043'],
    icon: 'zap',
    bpmRange: [120, 150],
    tracks: [],
    glpNote: 'Fast tempo + movement helps integrate proprioceptive input with vocal play',
  },
  sleepy: {
    id: 'mood-sleepy',
    mood: 'sleepy',
    label: 'Sleepy Time',
    description: 'Winding down for bed or rest',
    tempo: 'slow',
    energy: 'low',
    colors: ['#CE93D8', '#BA68C8'],
    icon: 'moon',
    bpmRange: [40, 60],
    tracks: [],
    glpNote: 'Lullabies and gentle melodies preserve intonation patterns from daily routines',
  },
  brave: {
    id: 'mood-brave',
    mood: 'brave',
    label: 'Brave Music',
    description: 'When courage is needed -- transitions, new situations',
    tempo: 'medium',
    energy: 'medium',
    colors: ['#90CAF9', '#42A5F5'],
    icon: 'shield',
    bpmRange: [80, 110],
    tracks: [],
    glpNote: 'Empowering melodies with clear lyrics support scripted self-talk for transitions',
  },
  silly: {
    id: 'mood-silly',
    mood: 'silly',
    label: 'Silly Songs',
    description: 'Fun and laughter -- playful interaction time',
    tempo: 'fast',
    energy: 'high',
    colors: ['#F48FB1', '#EC407A'],
    icon: 'sparkles',
    bpmRange: [110, 140],
    tracks: [],
    glpNote: 'Silly songs encourage vocal experimentation and joint attention with caregivers',
  },
};

// =============================================================================
// Helpers
// =============================================================================

export function getPlaylist(mood: MoodKey): EmotionalPlaylist {
  return EMOTIONAL_PLAYLISTS[mood];
}

export function getAllPlaylists(): EmotionalPlaylist[] {
  return Object.values(EMOTIONAL_PLAYLISTS).sort((a, b) => {
    const order = { low: 0, medium: 1, high: 2 };
    return order[a.energy] - order[b.energy];
  });
}

export function suggestPlaylist(context: {
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  activity?: 'therapy' | 'play' | 'meal' | 'transition' | 'bedtime';
}): MoodKey {
  const { timeOfDay, activity } = context;
  if (activity === 'bedtime') return 'sleepy';
  if (activity === 'therapy') return 'focus';
  if (activity === 'transition') return 'brave';
  if (activity === 'play') return 'happy';
  if (activity === 'meal') return 'calm';
  if (timeOfDay === 'night') return 'sleepy';
  if (timeOfDay === 'morning') return 'energize';
  if (timeOfDay === 'evening') return 'calm';
  return 'happy';
}

export function getMoodGradient(mood: MoodKey): string {
  const p = EMOTIONAL_PLAYLISTS[mood];
  return `linear-gradient(135deg, ${p.colors[0]}, ${p.colors[1]})`;
}
