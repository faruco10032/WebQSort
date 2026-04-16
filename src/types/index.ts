export interface DeckItem {
  id: number;
  text: string;
}

export interface Deck {
  name: string;
  items: DeckItem[];
  pileLabels?: string[];
  pileCapacities?: number[];
}

export interface PileConfig {
  index: number;       // 0-8 (9 piles)
  label: string;
  value: number;       // 1-9 score
  capacity: number;
}

export interface SessionMetadata {
  targetId: string;
  condition: string;
  trial: number;
  deckName: string;
  startedAt: string;
  finishedAt: string;
}

export type PrelimPile = 'uncharacteristic' | 'neutral' | 'characteristic';

export type AppPhase = 'setup' | 'preliminary' | 'final' | 'export';

export interface OperationLogEntry {
  timestamp: string;
  action: 'prelim_place' | 'final_place' | 'final_move';
  itemId: number;
  from?: string;
  to: string;
}

// Known deck configurations
export const DECK_CONFIGS: Record<string, { capacities: number[]; labels: string[] }> = {
  'RSQ3-15': {
    capacities: [3, 6, 11, 15, 19, 15, 11, 6, 3],
    labels: [
      'Extremely Uncharacteristic',
      'Quite Uncharacteristic',
      'Fairly Uncharacteristic',
      'Somewhat Uncharacteristic',
      'Relatively Neutral',
      'Somewhat Characteristic',
      'Fairly Characteristic',
      'Quite Characteristic',
      'Extremely Characteristic',
    ],
  },
  'RBQ3-11': {
    capacities: [3, 5, 7, 11, 16, 11, 7, 5, 3],
    labels: [
      'Extremely Uncharacteristic',
      'Quite Uncharacteristic',
      'Fairly Uncharacteristic',
      'Somewhat Uncharacteristic',
      'Relatively Neutral',
      'Somewhat Characteristic',
      'Fairly Characteristic',
      'Quite Characteristic',
      'Extremely Characteristic',
    ],
  },
  'CAQ': {
    capacities: [5, 8, 12, 16, 18, 16, 12, 8, 5],
    labels: [
      'Extremely Uncharacteristic',
      'Quite Uncharacteristic',
      'Fairly Uncharacteristic',
      'Somewhat Uncharacteristic',
      'Relatively Neutral',
      'Somewhat Characteristic',
      'Fairly Characteristic',
      'Quite Characteristic',
      'Extremely Characteristic',
    ],
  },
};

export const PILE_LABELS_JA = [
  '非常に当てはまらない',
  'かなり当てはまらない',
  'やや当てはまらない',
  'どちらかというと当てはまらない',
  'どちらでもない',
  'どちらかというと当てはまる',
  'やや当てはまる',
  'かなり当てはまる',
  '非常に当てはまる',
];
