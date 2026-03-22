// Shared utility functions and constants for SchoolTube games

export const GAME_COLORS = {
  red: "#FF6B6B",
  blue: "#4ECDC4",
  yellow: "#FFE66D",
  green: "#95E1D3",
  purple: "#DDA0DD",
  orange: "#FFB347",
  pink: "#FFB6C1",
  cyan: "#87CEEB",
} as const;

export const COLOR_NAMES = Object.keys(GAME_COLORS) as (keyof typeof GAME_COLORS)[];

export const SHAPES = ["circle", "square", "triangle", "star", "heart", "diamond"] as const;

export const SHAPE_PATHS: Record<string, string> = {
  circle: "M 50 10 A 40 40 0 1 1 50 90 A 40 40 0 1 1 50 10",
  square: "M 15 15 H 85 V 85 H 15 Z",
  triangle: "M 50 10 L 90 90 L 10 90 Z",
  star: "M 50 5 L 61 40 L 98 40 L 68 62 L 79 97 L 50 75 L 21 97 L 32 62 L 2 40 L 39 40 Z",
  heart: "M 50 88 C 20 55 5 35 5 25 A 20 20 0 0 1 50 25 A 20 20 0 0 1 95 25 C 95 35 80 55 50 88",
  diamond: "M 50 5 L 90 50 L 50 95 L 10 50 Z",
};

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Simple haptic feedback (web vibration API)
export const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// Shared game props type
export type GameProps = {
  onScore: () => void;
  onComplete: () => void;
};
