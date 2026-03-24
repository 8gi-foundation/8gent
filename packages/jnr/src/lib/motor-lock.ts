/**
 * Motor Planning Lock System
 *
 * AAC Golden Rule: Once a word is positioned on a grid, it NEVER moves.
 *
 * This module enforces position immutability for core words.
 * Positions are seeded once and are read-only thereafter.
 * No setter exists by design — positions cannot be changed at runtime.
 *
 * Why this matters:
 * - Enables muscle memory (the child learns WHERE a word is, not what it looks like)
 * - Builds automaticity — faster communication over time
 * - Research: Hill & Romich (2002) — motor planning consistency critical for fluency
 */

// =============================================================================
// Types
// =============================================================================

/** Immutable grid coordinate for a locked word */
export interface LockedGridPosition {
  readonly row: number;
  readonly col: number;
}

/** A word with a permanently locked grid position */
export interface LockedWord {
  readonly id: string;
  readonly text: string;
  readonly position: LockedGridPosition;
  readonly locked: true;
}

/** Minimal interface for words that can be seeded into the registry */
export interface SeedableWord {
  id: string;
  text?: string;
  coreGridPosition?: { row: number; col: number };
}

// =============================================================================
// Position Registry (immutable after creation)
// =============================================================================

/**
 * Internal frozen map of word ID -> grid position.
 * Built once from core vocabulary, then sealed.
 */
let _positionRegistry: ReadonlyMap<string, LockedGridPosition> | null = null;

/**
 * Initialize the position registry from a core vocabulary array.
 * Call ONCE at app startup. Subsequent calls are no-ops (positions are permanently locked).
 */
export function seedPositionRegistry(words: readonly SeedableWord[]): void {
  if (_positionRegistry !== null) {
    return; // Already seeded — positions are locked
  }

  const map = new Map<string, LockedGridPosition>();

  for (const word of words) {
    if (word.coreGridPosition) {
      map.set(word.id, Object.freeze({
        row: word.coreGridPosition.row,
        col: word.coreGridPosition.col,
      }));
    }
  }

  _positionRegistry = map;
  Object.freeze(_positionRegistry);
}

// =============================================================================
// Read-only Accessors
// =============================================================================

/**
 * Get the fixed grid position for a word.
 * Returns undefined if the word has no assigned position.
 * There is intentionally NO setter. Positions are immutable.
 */
export function getWordPosition(wordId: string): LockedGridPosition | undefined {
  if (!_positionRegistry) {
    throw new Error(
      'Motor lock: Position registry not initialized. Call seedPositionRegistry() at app startup.'
    );
  }
  return _positionRegistry.get(wordId);
}

/**
 * Check if a word's position is locked.
 * Returns true for core vocabulary words with assigned positions.
 * Returns false for fringe vocabulary or if registry is uninitialized.
 */
export function isLocked(wordId: string): boolean {
  if (!_positionRegistry) {
    return false;
  }
  return _positionRegistry.has(wordId);
}

/**
 * Get all locked words with their positions.
 * Useful for rendering the fixed core word grid.
 */
export function getAllLockedPositions(): ReadonlyMap<string, LockedGridPosition> {
  if (!_positionRegistry) {
    throw new Error(
      'Motor lock: Position registry not initialized. Call seedPositionRegistry() at app startup.'
    );
  }
  return _positionRegistry;
}

/**
 * Build a 2D grid array from locked positions.
 * Returns a sparse array where grid[row][col] = wordId or undefined.
 */
export function buildLockedGrid(
  rows: number,
  cols: number,
): (string | undefined)[][] {
  if (!_positionRegistry) {
    throw new Error(
      'Motor lock: Position registry not initialized. Call seedPositionRegistry() at app startup.'
    );
  }

  const grid: (string | undefined)[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => undefined)
  );

  _positionRegistry.forEach((pos, wordId) => {
    if (pos.row < rows && pos.col < cols) {
      grid[pos.row][pos.col] = wordId;
    }
  });

  return grid;
}

/**
 * Validate that no two words occupy the same grid cell.
 * Call during development/testing to catch seed data errors.
 */
export function validatePositions(): { valid: boolean; conflicts: string[] } {
  if (!_positionRegistry) {
    return { valid: false, conflicts: ['Registry not initialized'] };
  }

  const occupied = new Map<string, string>();
  const conflicts: string[] = [];

  _positionRegistry.forEach((pos, wordId) => {
    const key = `${pos.row},${pos.col}`;
    const existing = occupied.get(key);
    if (existing) {
      conflicts.push(`Position (${pos.row},${pos.col}) claimed by both "${existing}" and "${wordId}"`);
    } else {
      occupied.set(key, wordId);
    }
  });

  return { valid: conflicts.length === 0, conflicts };
}

// =============================================================================
// Reset (TESTING ONLY)
// =============================================================================

/**
 * Reset the registry. ONLY for use in tests.
 * In production, positions are permanent.
 */
export function __resetForTesting(): void {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot reset motor lock registry in production');
  }
  _positionRegistry = null;
}
