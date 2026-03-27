/**
 * 8gent Jr - Nursery Rhyme Sing-Along Playlist
 *
 * All songs are public domain. No copyright issues.
 * For v1, `audioUrl` is a placeholder path. The player can fall back to
 * Web Audio synthesis using the `notes` array: [frequency_hz, duration_ms][].
 *
 * GLP note: Nursery rhymes are prime gestalt scripts - whole melodic phrases
 * absorbed as single units, building prosody and rhythm before grammar.
 */

// =============================================================================
// Types
// =============================================================================

export interface NurseryRhymeTrack {
  id: string;
  title: string;
  /** Duration in seconds */
  duration: number;
  /** Placeholder path - swap for CDN URL when real recordings are available */
  audioUrl: string;
  /** Web Audio synthesis fallback: [frequency_hz, duration_ms][] */
  notes: Array<[number, number]>;
  bpm: number;
}

export interface SingAlongPlaylist {
  id: string;
  label: string;
  description: string;
  icon: string;
  colors: [string, string];
  tempo: 'slow' | 'medium' | 'fast';
  energy: 'low' | 'medium' | 'high';
  bpmRange: [number, number];
  tracks: NurseryRhymeTrack[];
  glpNote: string;
}

// =============================================================================
// Note helpers (frequencies in Hz, durations in ms at ~110 bpm)
// =============================================================================

// prettier-ignore
const [C4,D4,E4,F4,G4,A4,B4,C5,D5,E5,G5] =
  [261.63,293.66,329.63,349.23,392.00,440.00,493.88,523.25,587.33,659.25,783.99];
const [Q, H, E] = [545, 1090, 272]; // quarter, half, eighth ms

// =============================================================================
// Sing Along Playlist
// =============================================================================

export const SING_ALONG_PLAYLIST: SingAlongPlaylist = {
  id: 'sing-along',
  label: 'Sing Along',
  description: 'Classic nursery rhymes for singing together',
  icon: 'music',
  colors: ['#FF8FAB', '#FFB3C1'],
  tempo: 'medium',
  energy: 'medium',
  bpmRange: [100, 130],
  glpNote:
    'Nursery rhymes are foundational gestalt scripts - children absorb full ' +
    'melodic phrases as single units, building prosody and rhythm before grammar.',
  tracks: [
    {
      id: 'twinkle-twinkle',
      title: 'Twinkle Twinkle Little Star',
      duration: 32, bpm: 100,
      audioUrl: '/audio/nursery/twinkle-twinkle.mp3',
      notes: [[C4,Q],[C4,Q],[G4,Q],[G4,Q],[A4,Q],[A4,Q],[G4,H],[F4,Q],[F4,Q],[E4,Q],[E4,Q],[D4,Q],[D4,Q],[C4,H]],
    },
    {
      id: 'wheels-on-the-bus',
      title: 'Wheels on the Bus',
      duration: 36, bpm: 120,
      audioUrl: '/audio/nursery/wheels-on-the-bus.mp3',
      notes: [[G4,Q],[E4,Q],[E4,H],[E4,Q],[F4,Q],[F4,Q],[G4,Q],[G4,H],[G4,Q],[E4,H]],
    },
    {
      id: 'old-macdonald',
      title: 'Old MacDonald Had a Farm',
      duration: 40, bpm: 110,
      audioUrl: '/audio/nursery/old-macdonald.mp3',
      notes: [[G4,Q],[G4,Q],[G4,Q],[D4,Q],[E4,Q],[E4,Q],[D4,H],[B4,Q],[B4,Q],[A4,Q],[A4,Q],[G4,H]],
    },
    {
      id: 'head-shoulders-knees-toes',
      title: 'Head Shoulders Knees and Toes',
      duration: 28, bpm: 130,
      audioUrl: '/audio/nursery/head-shoulders.mp3',
      notes: [[E4,Q],[E4,Q],[E4,Q],[C4,Q],[E4,Q],[G4,H],[A4,Q],[A4,Q],[G4,Q],[E4,Q],[C4,H]],
    },
    {
      id: 'if-youre-happy',
      title: "If You're Happy and You Know It",
      duration: 38, bpm: 120,
      audioUrl: '/audio/nursery/if-youre-happy.mp3',
      notes: [[G4,Q],[G4,Q],[G4,Q],[E4,Q],[G4,Q],[G4,Q],[A4,H],[A4,Q],[G4,Q],[G4,H]],
    },
    {
      id: 'row-your-boat',
      title: 'Row Row Row Your Boat',
      duration: 30, bpm: 100,
      audioUrl: '/audio/nursery/row-your-boat.mp3',
      notes: [[C4,Q],[C4,Q],[C4,E],[D4,E],[E4,Q],[E4,E],[D4,E],[E4,E],[F4,E],[G4,H]],
    },
    {
      id: 'itsy-bitsy-spider',
      title: 'Itsy Bitsy Spider',
      duration: 34, bpm: 100,
      audioUrl: '/audio/nursery/itsy-bitsy-spider.mp3',
      notes: [[G4,Q],[C5,Q],[C5,Q],[C5,Q],[D5,Q],[E5,H],[E5,Q],[D5,Q],[E5,Q],[G5,Q],[C5,H]],
    },
    {
      id: 'baa-baa-black-sheep',
      title: 'Baa Baa Black Sheep',
      duration: 30, bpm: 110,
      audioUrl: '/audio/nursery/baa-baa-black-sheep.mp3',
      notes: [[C4,Q],[C4,Q],[G4,Q],[G4,Q],[A4,Q],[G4,H],[F4,Q],[F4,Q],[E4,Q],[D4,Q],[C4,H]],
    },
    {
      id: 'humpty-dumpty',
      title: 'Humpty Dumpty',
      duration: 28, bpm: 100,
      audioUrl: '/audio/nursery/humpty-dumpty.mp3',
      notes: [[E4,Q],[G4,Q],[G4,Q],[A4,Q],[G4,Q],[E4,Q],[C4,H],[D4,Q],[F4,Q],[F4,Q],[G4,Q],[E4,H]],
    },
    {
      id: 'ring-around-the-rosie',
      title: 'Ring Around the Rosie',
      duration: 26, bpm: 120,
      audioUrl: '/audio/nursery/ring-around-rosie.mp3',
      notes: [[E4,Q],[D4,Q],[C4,Q],[D4,Q],[E4,Q],[E4,Q],[E4,H],[D4,Q],[D4,Q],[D4,H],[E4,Q],[G4,Q],[G4,H]],
    },
  ],
};

// =============================================================================
// Helpers
// =============================================================================

export function getSingAlongTrack(id: string): NurseryRhymeTrack | undefined {
  return SING_ALONG_PLAYLIST.tracks.find((t) => t.id === id);
}

export function getSingAlongTotalDuration(): number {
  return SING_ALONG_PLAYLIST.tracks.reduce((acc, t) => acc + t.duration, 0);
}
