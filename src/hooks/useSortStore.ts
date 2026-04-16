import { create } from 'zustand';
import {
  AppPhase,
  Deck,
  PileConfig,
  PrelimPile,
  SessionMetadata,
  OperationLogEntry,
  DECK_CONFIGS,
} from '../types';

interface SortStore {
  phase: AppPhase;
  setPhase: (phase: AppPhase) => void;
  lang: 'ja' | 'en';
  setLang: (lang: 'ja' | 'en') => void;

  metadata: SessionMetadata;
  setMetadata: (m: Partial<SessionMetadata>) => void;

  deck: Deck | null;
  setDeck: (d: Deck) => void;
  pileConfig: PileConfig[];

  prelimAssignments: Record<number, PrelimPile>;
  currentPrelimIndex: number;
  assignPrelim: (itemId: number, pile: PrelimPile) => void;
  undoPrelim: () => void;

  finalAssignments: Record<number, number>;
  assignFinal: (itemId: number, pileIndex: number) => void;
  removeFinal: (itemId: number) => void;
  moveFinal: (itemId: number, fromPile: number, toPile: number) => void;

  operationLog: OperationLogEntry[];
  addLogEntry: (entry: Omit<OperationLogEntry, 'timestamp'>) => void;

  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
  clearCurrentSession: () => void;

  getSortVector: () => number[];
}

const defaultMetadata: SessionMetadata = {
  targetId: '',
  condition: '',
  trial: 1,
  deckName: '',
  startedAt: '',
  finishedAt: '',
};

export const useSortStore = create<SortStore>((set, get) => ({
  phase: 'setup',
  setPhase: (phase) => set({ phase }),
  lang: 'ja',
  setLang: (lang) => set({ lang }),

  metadata: { ...defaultMetadata },
  setMetadata: (m) => set((s) => ({ metadata: { ...s.metadata, ...m } })),

  deck: null,
  setDeck: (d) => {
    const baseName = d.name.replace(/_ja$/, '');
    const config = DECK_CONFIGS[baseName];
    let pileConfig: PileConfig[] = [];
    if (config) {
      pileConfig = config.capacities.map((cap, i) => ({
        index: i,
        label: config.labels[i],
        value: i + 1,
        capacity: cap,
      }));
    } else if (d.pileCapacities && d.pileLabels) {
      pileConfig = d.pileCapacities.map((cap, i) => ({
        index: i,
        label: d.pileLabels![i] ?? `Pile ${i + 1}`,
        value: i + 1,
        capacity: cap,
      }));
    }
    set({ deck: d, pileConfig, metadata: { ...get().metadata, deckName: d.name } });
  },
  pileConfig: [],

  prelimAssignments: {},
  currentPrelimIndex: 0,
  assignPrelim: (itemId, pile) => {
    const state = get();
    const newAssignments = { ...state.prelimAssignments, [itemId]: pile };
    const newIndex = state.currentPrelimIndex + 1;
    set({ prelimAssignments: newAssignments, currentPrelimIndex: newIndex });
    get().addLogEntry({ action: 'prelim_place', itemId, to: pile });
    // Auto-advance to final sort when all items are placed
    if (state.deck && newIndex >= state.deck.items.length) {
      get().saveToLocalStorage();
      set({ phase: 'final' });
    }
  },
  undoPrelim: () => {
    const state = get();
    if (state.currentPrelimIndex <= 0 || !state.deck) return;
    const prevIndex = state.currentPrelimIndex - 1;
    const prevItem = state.deck.items[prevIndex];
    if (!prevItem) return;
    const newAssignments = { ...state.prelimAssignments };
    delete newAssignments[prevItem.id];
    set({ prelimAssignments: newAssignments, currentPrelimIndex: prevIndex });
  },

  finalAssignments: {},
  assignFinal: (itemId, pileIndex) => {
    set((s) => ({ finalAssignments: { ...s.finalAssignments, [itemId]: pileIndex } }));
    get().addLogEntry({ action: 'final_place', itemId, to: String(pileIndex) });
  },
  removeFinal: (itemId) => {
    set((s) => {
      const newA = { ...s.finalAssignments };
      delete newA[itemId];
      return { finalAssignments: newA };
    });
  },
  moveFinal: (itemId, fromPile, toPile) => {
    set((s) => ({ finalAssignments: { ...s.finalAssignments, [itemId]: toPile } }));
    get().addLogEntry({ action: 'final_move', itemId, from: String(fromPile), to: String(toPile) });
  },

  operationLog: [],
  addLogEntry: (entry) =>
    set((s) => ({
      operationLog: [...s.operationLog, { ...entry, timestamp: new Date().toISOString() }],
    })),

  saveToLocalStorage: () => {
    const s = get();
    const data = {
      phase: s.phase,
      metadata: s.metadata,
      deck: s.deck,
      pileConfig: s.pileConfig,
      prelimAssignments: s.prelimAssignments,
      currentPrelimIndex: s.currentPrelimIndex,
      finalAssignments: s.finalAssignments,
      operationLog: s.operationLog,
    };
    localStorage.setItem('webqsort_current', JSON.stringify(data));
  },
  loadFromLocalStorage: () => {
    try {
      const raw = localStorage.getItem('webqsort_current');
      if (!raw) return false;
      const data = JSON.parse(raw);
      set({
        phase: data.phase,
        metadata: data.metadata,
        deck: data.deck,
        pileConfig: data.pileConfig,
        prelimAssignments: data.prelimAssignments,
        currentPrelimIndex: data.currentPrelimIndex,
        finalAssignments: data.finalAssignments,
        operationLog: data.operationLog ?? [],
      });
      return true;
    } catch {
      return false;
    }
  },
  clearCurrentSession: () => {
    localStorage.removeItem('webqsort_current');
    const currentDeck = get().deck;
    const currentPileConfig = get().pileConfig;
    set({
      phase: 'setup',
      metadata: { ...defaultMetadata, deckName: currentDeck?.name ?? '' },
      deck: currentDeck,
      pileConfig: currentPileConfig,
      prelimAssignments: {},
      currentPrelimIndex: 0,
      finalAssignments: {},
      operationLog: [],
    });
  },

  getSortVector: () => {
    const { deck, finalAssignments, pileConfig } = get();
    if (!deck) return [];
    return deck.items.map((item) => {
      const pileIdx = finalAssignments[item.id];
      if (pileIdx === undefined) return 0;
      return pileConfig[pileIdx]?.value ?? 0;
    });
  },
}));
