import { Deck, PileConfig } from '../types';

export function validateDeckCapacity(deck: Deck, capacities: number[]): string | null {
  const totalCapacity = capacities.reduce((a, b) => a + b, 0);
  if (totalCapacity !== deck.items.length) {
    return `Item count (${deck.items.length}) does not match total pile capacity (${totalCapacity})`;
  }
  return null;
}

export function validateSortComplete(
  assignments: Record<number, number>,
  deck: Deck,
  pileConfig: PileConfig[]
): string[] {
  const errors: string[] = [];

  // Check all items assigned
  const assignedCount = Object.keys(assignments).length;
  if (assignedCount !== deck.items.length) {
    errors.push(`${deck.items.length - assignedCount} items not yet assigned`);
  }

  // Check pile capacities
  const pileCounts: Record<number, number> = {};
  for (const pileIdx of Object.values(assignments)) {
    pileCounts[pileIdx] = (pileCounts[pileIdx] ?? 0) + 1;
  }

  for (const pile of pileConfig) {
    const count = pileCounts[pile.index] ?? 0;
    if (count !== pile.capacity) {
      errors.push(`Pile ${pile.index + 1} (${pile.label}): ${count}/${pile.capacity}`);
    }
  }

  return errors;
}

export function validateTargetId(id: string): boolean {
  return /^[A-Za-z0-9_]+$/.test(id);
}

export function validateRaterId(id: string): boolean {
  return /^[A-Za-z0-9_]+$/.test(id);
}
