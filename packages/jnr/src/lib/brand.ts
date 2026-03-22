/**
 * 8gent Jr Brand Constants
 *
 * Single source of truth for brand identity across the app.
 * Product name: "8gent Jr" (no period except in logo treatment)
 */

export const BRAND = {
  name: '8gent Jr',
  tagline: 'No more gatekeeping. A voice for every kid.',
  accent: '#E8610A',
  accentHover: '#D15709',
  fonts: {
    display: 'Fraunces',
    body: 'Inter',
    mono: 'JetBrains Mono',
  },
  colors: {
    bg: '#FFFDF9',
    bgWarm: '#FFF8F0',
    bgAccent: '#FFF3E8',
    text: '#1A1612',
    textSoft: '#5C544A',
    textMuted: '#9A9088',
    border: '#E8E0D6',
    green: '#2D8A56',
  },
} as const;
