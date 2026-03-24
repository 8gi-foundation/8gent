/**
 * Default Visual Scene Displays
 *
 * 5 seed scenes relevant to a GLP Stage 1-2 learner.
 * Each scene uses placeholder gradient backgrounds until
 * real photos are uploaded by parents/therapists.
 *
 * Hotspot areas are deliberately large (20%+ of scene)
 * for motor accessibility. Phrases are whole gestalts
 * per Linda Burkhart's VSD methodology.
 */

import type { VisualScene } from './types';

export const DEFAULT_SCENES: VisualScene[] = [
  {
    id: 'kitchen',
    title: 'Kitchen',
    imageUrl: '',
    glpStage: 1,
    category: 'home',
    hotspots: [
      { id: 'kitchen-juice', x: 5, y: 25, width: 22, height: 28, phrase: 'I want juice' },
      { id: 'kitchen-more', x: 38, y: 45, width: 24, height: 24, phrase: 'More please' },
      { id: 'kitchen-done', x: 68, y: 35, width: 24, height: 24, phrase: 'All done' },
      { id: 'kitchen-help', x: 30, y: 5, width: 28, height: 24, phrase: 'Help me' },
    ],
  },
  {
    id: 'playground',
    title: 'Playground',
    imageUrl: '',
    glpStage: 1,
    category: 'park',
    hotspots: [
      { id: 'playground-go', x: 3, y: 55, width: 24, height: 24, phrase: "Let's go" },
      { id: 'playground-turn', x: 28, y: 25, width: 24, height: 28, phrase: 'My turn' },
      { id: 'playground-push', x: 52, y: 20, width: 24, height: 28, phrase: 'Push me' },
      { id: 'playground-swing', x: 68, y: 55, width: 28, height: 28, phrase: 'I want to swing' },
    ],
  },
  {
    id: 'bedroom',
    title: 'Bedroom',
    imageUrl: '',
    glpStage: 1,
    category: 'home',
    hotspots: [
      { id: 'bedroom-book', x: 5, y: 15, width: 24, height: 28, phrase: 'Read a book' },
      { id: 'bedroom-night', x: 38, y: 35, width: 28, height: 28, phrase: 'Night night' },
      { id: 'bedroom-tired', x: 62, y: 15, width: 24, height: 28, phrase: "I'm tired" },
      { id: 'bedroom-light', x: 68, y: 55, width: 28, height: 24, phrase: 'Turn off light' },
    ],
  },
  {
    id: 'school',
    title: 'School',
    imageUrl: '',
    glpStage: 2,
    category: 'school',
    hotspots: [
      { id: 'school-hello', x: 3, y: 10, width: 24, height: 26, phrase: 'Hello teacher' },
      { id: 'school-help', x: 32, y: 30, width: 28, height: 28, phrase: 'I need help' },
      { id: 'school-go', x: 62, y: 10, width: 24, height: 26, phrase: 'Can I go' },
      { id: 'school-done', x: 32, y: 62, width: 30, height: 26, phrase: 'Finished work' },
    ],
  },
  {
    id: 'park',
    title: 'Park',
    imageUrl: '',
    glpStage: 1,
    category: 'park',
    hotspots: [
      { id: 'park-look', x: 5, y: 10, width: 24, height: 26, phrase: 'Look at that' },
      { id: 'park-play', x: 38, y: 35, width: 24, height: 28, phrase: "Let's play" },
      { id: 'park-icecream', x: 66, y: 45, width: 28, height: 26, phrase: 'I want ice cream' },
      { id: 'park-home', x: 5, y: 60, width: 24, height: 26, phrase: 'Go home' },
    ],
  },
];
