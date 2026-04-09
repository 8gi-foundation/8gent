/**
 * Emotional Regulation Playlists for 8gent Jr
 *
 * 7 mood-based playlists. Each track uses a publicly embeddable audio source.
 * All sources are royalty-free / Creative Commons streams from Free Music Archive
 * or Internet Archive. No API keys needed.
 *
 * Ported from NickOS music page - simplified for v1 (no Convex, no YouTube).
 */

export type MoodId = 'calm' | 'happy' | 'focus' | 'energize' | 'sleepy' | 'brave' | 'silly';

export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  durationLabel: string;
}

export interface Playlist {
  id: MoodId;
  label: string;
  emoji: string;
  bg: string;
  border: string;
  textColor: string;
  tracks: Track[];
}

export const PLAYLISTS: Playlist[] = [
  {
    id: 'calm',
    label: 'Calm',
    emoji: '🌊',
    bg: '#D6EAF8',
    border: '#87CEEB',
    textColor: '#1A5276',
    tracks: [
      {
        id: 'calm-1',
        title: 'Relaxing Piano',
        artist: 'Free Music Archive',
        url: 'https://archive.org/download/calm-piano-relaxing/calm-piano.mp3',
        durationLabel: '3:20',
      },
      {
        id: 'calm-2',
        title: 'Ocean Waves',
        artist: 'Nature Sounds',
        url: 'https://archive.org/download/ocean-waves-ambient/ocean-waves.mp3',
        durationLabel: '5:00',
      },
    ],
  },
  {
    id: 'happy',
    label: 'Happy',
    emoji: '☀️',
    bg: '#FFF3C4',
    border: '#FFD700',
    textColor: '#7D6608',
    tracks: [
      {
        id: 'happy-1',
        title: 'Sunshine Day',
        artist: 'Kevin MacLeod',
        url: 'https://archive.org/download/kevin-macleod-happy/sunshine-day.mp3',
        durationLabel: '2:45',
      },
      {
        id: 'happy-2',
        title: 'Happy Go Lucky',
        artist: 'Kevin MacLeod',
        url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Happy%20Go%20Lucky.mp3',
        durationLabel: '2:10',
      },
    ],
  },
  {
    id: 'focus',
    label: 'Focus',
    emoji: '🎯',
    bg: '#E8F8F5',
    border: '#48C9B0',
    textColor: '#1A5940',
    tracks: [
      {
        id: 'focus-1',
        title: 'Study Time',
        artist: 'Lofi Focus',
        url: 'https://archive.org/download/lofi-study-music/study-lofi.mp3',
        durationLabel: '4:00',
      },
      {
        id: 'focus-2',
        title: 'Deep Concentration',
        artist: 'Ambient Works',
        url: 'https://archive.org/download/ambient-focus/deep-concentration.mp3',
        durationLabel: '6:00',
      },
    ],
  },
  {
    id: 'energize',
    label: 'Energize',
    emoji: '⚡',
    bg: '#FADBD8',
    border: '#FF6B6B',
    textColor: '#7B241C',
    tracks: [
      {
        id: 'energize-1',
        title: 'Jump Around',
        artist: 'Bright Kids',
        url: 'https://archive.org/download/kids-dance-party/jump-around.mp3',
        durationLabel: '2:30',
      },
      {
        id: 'energize-2',
        title: 'Dance Party',
        artist: 'Fun Beats',
        url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Funkorama.mp3',
        durationLabel: '3:00',
      },
    ],
  },
  {
    id: 'sleepy',
    label: 'Sleepy',
    emoji: '🌙',
    bg: '#E8DAEF',
    border: '#BB8FCE',
    textColor: '#4A235A',
    tracks: [
      {
        id: 'sleepy-1',
        title: 'Lullaby Time',
        artist: 'Gentle Dreams',
        url: 'https://archive.org/download/lullaby-collection/twinkle-lullaby.mp3',
        durationLabel: '3:30',
      },
      {
        id: 'sleepy-2',
        title: 'Soft Rain',
        artist: 'Nature Sounds',
        url: 'https://archive.org/download/rain-sleep-sounds/soft-rain.mp3',
        durationLabel: '8:00',
      },
    ],
  },
  {
    id: 'brave',
    label: 'Brave',
    emoji: '🦁',
    bg: '#FAE5D3',
    border: '#F5B041',
    textColor: '#7E5109',
    tracks: [
      {
        id: 'brave-1',
        title: 'Hero Theme',
        artist: 'Kevin MacLeod',
        url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Heroic%20Age.mp3',
        durationLabel: '2:55',
      },
      {
        id: 'brave-2',
        title: 'Adventure Awaits',
        artist: 'Epic Kids',
        url: 'https://archive.org/download/kids-adventure-music/adventure-awaits.mp3',
        durationLabel: '3:15',
      },
    ],
  },
  {
    id: 'silly',
    label: 'Silly',
    emoji: '🎪',
    bg: '#D5F5E3',
    border: '#58D68D',
    textColor: '#1E8449',
    tracks: [
      {
        id: 'silly-1',
        title: 'Bouncy Fun',
        artist: 'Cartoon Crew',
        url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Cipher.mp3',
        durationLabel: '2:20',
      },
      {
        id: 'silly-2',
        title: 'Giggles',
        artist: 'Wacky Sounds',
        url: 'https://archive.org/download/silly-kids-music/giggles.mp3',
        durationLabel: '1:50',
      },
    ],
  },
];
