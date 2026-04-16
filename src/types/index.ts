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
  raterId: string;
  participantName: string;
  conditionAvatar: boolean;
  conditionVoice: boolean;
  trial: number;
  deckName: string;
  ratingMode: 'self' | 'other';
  notes: string;
  startedAt: string;
  finishedAt: string;
}

export type PrelimPile = 'uncharacteristic' | 'neutral' | 'characteristic';

export interface SortState {
  prelimAssignments: Record<number, PrelimPile>;
  finalAssignments: Record<number, number>; // itemId -> pile index (0-8)
  currentPrelimIndex: number;
}

export type AppPhase = 'setup' | 'preliminary' | 'final' | 'export' | 'history';

export interface CompletedSession {
  id: string;
  metadata: SessionMetadata;
  deck: Deck;
  sortVector: number[];   // pile values (1-9) indexed by item order
  pileConfig: PileConfig[];
  operationLog: OperationLogEntry[];
  completedAt: string;
}

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
