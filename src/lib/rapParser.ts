import { Deck, DeckItem } from '../types';

/**
 * Parse a deck text file. Supports two formats:
 *
 * Format A (Japanese): Lines like "1\tItem text" (number TAB text)
 * Format B (RAP English): Header with pile labels/capacities, then items like "Item text. NUMBER"
 */
export function parseDeckFile(content: string, fileName: string): Deck {
  const lines = content.split(/\r?\n/).filter((l) => l.trim() !== '');
  const name = fileName.replace(/\.[^.]+$/, '');

  // Detect format: if first line is a single digit, it's RAP format
  const firstLine = lines[0].trim();
  if (/^\d+$/.test(firstLine) && parseInt(firstLine) <= 9) {
    return parseRapFormat(lines, name);
  }

  // Otherwise, assume tab-delimited Japanese format
  return parseTabFormat(lines, name);
}

function parseTabFormat(lines: string[], name: string): Deck {
  const items: DeckItem[] = [];
  for (const line of lines) {
    const match = line.match(/^(\d+)\t(.+)$/);
    if (match) {
      items.push({ id: parseInt(match[1]), text: match[2].trim() });
    }
  }
  if (items.length === 0) {
    throw new Error('No items found in deck file');
  }
  return { name, items };
}

function parseRapFormat(lines: string[], name: string): Deck {
  const pileLabels: string[] = [];
  const pileCapacities: number[] = [];
  const items: DeckItem[] = [];
  let i = 0;

  // Parse header: alternating lines of pile count and pile label (9 piles)
  while (i < lines.length && pileLabels.length < 9) {
    const numLine = lines[i].trim();
    if (/^\d+$/.test(numLine)) {
      pileCapacities.push(parseInt(numLine));
      i++;
      if (i < lines.length) {
        pileLabels.push(lines[i].trim());
        i++;
      }
    } else {
      break;
    }
  }

  // Parse items: "Item text NUMBER" at end
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }
    // Match "Some text. NUMBER" or "Some text NUMBER"
    const match = line.match(/^(.+?)\s+(\d+)$/);
    if (match) {
      items.push({ id: parseInt(match[2]), text: match[1].trim() });
    }
    i++;
  }

  if (items.length === 0) {
    throw new Error('No items found in RAP deck file');
  }

  // Sort by ID
  items.sort((a, b) => a.id - b.id);

  return { name, items, pileLabels, pileCapacities };
}

/**
 * Parse a RAP result .txt file
 * Format: "SESSION_ID 5 1 5 2 ..." (space-separated pile values)
 */
export function parseResultFile(content: string): { sessionId: string; sortVector: number[] } {
  const trimmed = content.trim();
  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) {
    throw new Error('Invalid result file format');
  }
  const sessionId = parts[0];
  const sortVector = parts.slice(1).map((v) => {
    const n = parseInt(v);
    if (isNaN(n) || n < 1 || n > 9) throw new Error(`Invalid pile value: ${v}`);
    return n;
  });
  return { sessionId, sortVector };
}
