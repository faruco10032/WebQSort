import { create } from 'zustand';
import {
  AppPhase,
  Deck,
  PileConfig,
  PrelimPile,
  SessionMetadata,
  CompletedSession,
  OperationLogEntry,
  DECK_CONFIGS,
} from '../types';

interface SortStore {
  // App state
  phase: AppPhase;
  setPhase: (phase: AppPhase) => void;
  lang: 'ja' | 'en';
  setLang: (lang: 'ja' | 'en') => void;

  // Session
  metadata: SessionMetadata;
  setMetadata: (m: Partial<SessionMetadata>) => void;

  // Deck
  deck: Deck | null;
  setDeck: (d: Deck) => void;
  pileConfig: PileConfig[];
  setPileConfig: (pc: PileConfig[]) => void;

  // Preliminary sort
  prelimAssignments: Record<number, PrelimPile>;
  currentPrelimIndex: number;
  assignPrelim: (itemId: number, pile: PrelimPile) => void;
  undoPrelim: () => void;
  setCurrentPrelimIndex: (i: number) => void;

  // Final sort
  finalAssignments: Record<number, number>;
  assignFinal: (itemId: number, pileIndex: number) => void;
  removeFinal: (itemId: number) => void;
  moveFinal: (itemId: number, fromPile: number, toPile: number) => void;

  // Operation log
  operationLog: OperationLogEntry[];
  addLogEntry: (entry: Omit<OperationLogEntry, 'timestamp'>) => void;

  // Session history
  completedSessions: CompletedSession[];
  loadCompletedSessions: () => void;
  completeSession: () => void;
  deleteSession: (id: string) => void;

  // Persistence
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
  clearCurrentSession: () => void;

  // Sort vector
  getSortVector: () => number[];
}

const defaultMetadata: SessionMetadata = {
  targetId: '',
  raterId: '',
  participantName: '',
  conditionAvatar: false,
  conditionVoice: false,
  trial: 1,
  deckName: '',
  ratingMode: 'self',
  notes: '',
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
    set({ deck: d });
    // Auto-configure piles if known deck
    const baseName = d.name.replace(/_ja$/, '');
    const config = DECK_CONFIGS[baseName];
    if (config) {
      const pileConfig: PileConfig[] = config.capacities.map((cap, i) => ({
        index: i,
        label: config.labels[i],
        value: i + 1,
        capacity: cap,
      }));
      set({ pileConfig });
    } else if (d.pileCapacities && d.pileLabels) {
      const pileConfig: PileConfig[] = d.pileCapacities.map((cap, i) => ({
        index: i,
        label: d.pileLabels![i] ?? `Pile ${i + 1}`,
        value: i + 1,
        capacity: cap,
      }));
      set({ pileConfig });
    }
  },
  pileConfig: [],
  setPileConfig: (pc) => set({ pileConfig: pc }),

  prelimAssignments: {},
  currentPrelimIndex: 0,
  assignPrelim: (itemId, pile) => {
    const state = get();
    set({
      prelimAssignments: { ...state.prelimAssignments, [itemId]: pile },
      currentPrelimIndex: state.currentPrelimIndex + 1,
    });
    get().addLogEntry({ action: 'prelim_place', itemId, to: pile });
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
  setCurrentPrelimIndex: (i) => set({ currentPrelimIndex: i }),

  finalAssignments: {},
  assignFinal: (itemId, pileIndex) => {
    set((s) => ({
      finalAssignments: { ...s.finalAssignments, [itemId]: pileIndex },
    }));
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
    set((s) => ({
      finalAssignments: { ...s.finalAssignments, [itemId]: toPile },
    }));
    get().addLogEntry({
      action: 'final_move',
      itemId,
      from: String(fromPile),
      to: String(toPile),
    });
  },

  operationLog: [],
  addLogEntry: (entry) =>
    set((s) => ({
      operationLog: [...s.operationLog, { ...entry, timestamp: new Date().toISOString() }],
    })),

  completedSessions: [],
  loadCompletedSessions: () => {
    try {
      const raw = localStorage.getItem('webqsort_sessions');
      if (raw) set({ completedSessions: JSON.parse(raw) });
    } catch { /* ignore */ }
  },
  completeSession: () => {
    const state = get();
    if (!state.deck) return;
    const now = new Date().toISOString();
    const session: CompletedSession = {
      id: `${state.metadata.targetId}_${state.metadata.raterId}_T${state.metadata.trial}_${Date.now()}`,
      metadata: { ...state.metadata, finishedAt: now },
      deck: state.deck,
      sortVector: state.getSortVector(),
      pileConfig: state.pileConfig,
      operationLog: state.operationLog,
      completedAt: now,
    };
    const sessions = [...state.completedSessions, session];
    localStorage.setItem('webqsort_sessions', JSON.stringify(sessions));
    localStorage.removeItem('webqsort_current');
    set({ completedSessions: sessions });
  },
  deleteSession: (id) => {
    set((s) => {
      const sessions = s.completedSessions.filter((ss) => ss.id !== id);
      localStorage.setItem('webqsort_sessions', JSON.stringify(sessions));
      return { completedSessions: sessions };
    });
  },

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
    set({
      phase: 'setup',
      metadata: { ...defaultMetadata },
      deck: null,
      pileConfig: [],
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
