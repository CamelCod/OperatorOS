import { create } from 'zustand';
import type { DailyEntry, DecisionEntry, UserStats } from '@shared/schema';

type StatsState = {
  streak: number;
  decisionsTracked: number;
  contentPieces: number;
};

type Store = {
  // App state
  hasOnboarded: boolean | null; // null = not yet loaded
  entries: DailyEntry[];
  decisions: DecisionEntry[];
  stats: StatsState;
  
  // Demo mode
  isDemoMode: boolean;
  demoSnapshot: {
    entries: DailyEntry[];
    decisions: DecisionEntry[];
    stats: StatsState;
    hasOnboarded: boolean | null;
  } | null;

  // Actions
  setHasOnboarded: (value: boolean) => void;
  setEntries: (entries: DailyEntry[]) => void;
  setDecisions: (decisions: DecisionEntry[]) => void;
  setStats: (stats: StatsState) => void;
  
  addEntry: (entry: DailyEntry) => void;
  updateEntry: (id: string, updates: Partial<DailyEntry>) => void;
  getEntryByDate: (date: string) => DailyEntry | undefined;
  
  addDecision: (decision: DecisionEntry) => void;
  
  toggleDemoMode: () => void;
  generateDemoData: () => void;
};

export const useStore = create<Store>((set, get) => ({
  hasOnboarded: null,
  entries: [],
  decisions: [],
  stats: {
    streak: 0,
    decisionsTracked: 0,
    contentPieces: 0,
  },
  isDemoMode: false,
  demoSnapshot: null,

  setHasOnboarded: (value) => set({ hasOnboarded: value }),
  setEntries: (entries) => set({ entries }),
  setDecisions: (decisions) => set({ decisions }),
  setStats: (stats) => set({ stats }),

  addEntry: (entry) => 
    set((state) => ({
      entries: [entry, ...state.entries]
    })),

  updateEntry: (id, updates) =>
    set((state) => ({
      entries: state.entries.map((e) => e.id === id ? { ...e, ...updates } : e)
    })),

  getEntryByDate: (date) => get().entries.find((e) => e.date === date),

  addDecision: (decision) => 
    set((state) => ({
      decisions: [decision, ...state.decisions]
    })),

  toggleDemoMode: () => {
    const { isDemoMode, entries, decisions, stats, hasOnboarded, demoSnapshot } = get();
    
    if (!isDemoMode) {
      // Entering demo mode - save current state and generate demo data
      set({
        demoSnapshot: { entries, decisions, stats, hasOnboarded },
        isDemoMode: true,
        hasOnboarded: true
      });
      get().generateDemoData();
    } else {
      // Exiting demo mode - restore saved state
      if (demoSnapshot) {
        set({
          isDemoMode: false,
          entries: demoSnapshot.entries,
          decisions: demoSnapshot.decisions,
          stats: demoSnapshot.stats,
          hasOnboarded: demoSnapshot.hasOnboarded,
          demoSnapshot: null
        });
      } else {
        set({ isDemoMode: false });
      }
    }
  },

  generateDemoData: () => {
    const today = new Date();
    const demoEntries: DailyEntry[] = [];
    
    // Generate 14 days of entries showing behavioral evolution
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Old behavior (days 8-14): reactive, scattered, low leverage
      if (i > 7) {
        demoEntries.push({
          id: `demo-${i}`,
          userId: 'demo',
          date: dateStr,
          friction: "Too many meetings, felt drained. Couldn't focus on the main product launch.",
          decisions: "Agreed to 3 coffee chats. Delayed the database migration again.",
          assumptions: "I need to network more to get sales. More features = more revenue.",
          outputs: {
            personalPattern: "You're prioritizing social validation over deep work. Classic avoidance behavior.",
            businessLeverage: "Calendar audit required. Cap meetings to PM only. Ship the pricing update NOW.",
            contentIdeas: [
              "Why Coffee Chats are Killing Your Startup",
              "The Trap of 'BusyWork'"
            ]
          },
          createdAt: date
        });
      } 
      // New behavior (days 0-7): strategic, leveraged, decisive
      else {
        demoEntries.push({
          id: `demo-${i}`,
          userId: 'demo',
          date: dateStr,
          friction: "Felt resistance deploying the new pricing model. Fear of user churn.",
          decisions: "Shipped the pricing update. Declined 2 podcast invites to focus on product.",
          assumptions: "Users will churn if I increase prices. But I've validated willingness to pay.",
          outputs: {
            personalPattern: "You fear rejection, but action cures fear. This is growth in real-time.",
            businessLeverage: "Price increase is the highest leverage decision available right now. 2x revenue, 0 extra work.",
            contentIdeas: [
              "How I Doubled Prices Overnight (And What Happened)",
              "Fear Setting for Founders: A Framework"
            ]
          },
          createdAt: date
        });
      }
    }

    set({
      entries: demoEntries,
      stats: {
        streak: 14,
        decisionsTracked: 23,
        contentPieces: 28
      }
    });
  }
}));
