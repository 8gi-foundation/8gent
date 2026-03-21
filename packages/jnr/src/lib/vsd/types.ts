/**
 * Visual Scene Display (VSD) Types
 *
 * Photo-based AAC where real photos have interactive hotspots
 * that speak whole language chunks. Critical for GLP Stage 1-2 learners.
 *
 * Ported from Nick OS (Linda Burkhart's VSD research)
 */

export interface VisualScene {
  id: string;
  title: string;
  imageUrl: string; // Photo of real scene (kitchen, playground, etc.)
  hotspots: Hotspot[];
  glpStage: 1 | 2; // VSDs are primarily for Stage 1-2
  category: string; // "home", "school", "park", "mealtime", etc.
}

export interface Hotspot {
  id: string;
  x: number; // percentage 0-100 (left edge of hotspot)
  y: number; // percentage 0-100 (top edge of hotspot)
  width: number; // percentage of scene width
  height: number; // percentage of scene height
  phrase: string; // Whole gestalt phrase, e.g. "I want juice"
  symbolId?: number; // Optional ARASAAC symbol ID
  audioUrl?: string; // Optional pre-recorded audio (parent voice)
}
