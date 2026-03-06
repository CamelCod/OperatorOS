import { describe, it, expect } from "vitest";

// Diff Engine: detect behavioral changes across time-series entries
interface BehaviorEntry {
  date: string;
  friction: string;
  decisions: string;
  assumptions: string;
}

interface GrowthRule {
  pattern: string;
  frequency: number;
  suggestion: string;
}

function detectPatterns(entries: BehaviorEntry[]): GrowthRule[] {
  if (entries.length < 2) return [];

  const frictionWords = entries.flatMap(e =>
    e.friction.toLowerCase().split(/\s+/).filter(w => w.length > 4)
  );

  const wordFreq: Record<string, number> = {};
  for (const word of frictionWords) {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  }

  const repeatedWords = Object.entries(wordFreq)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1]);

  return repeatedWords.map(([word, frequency]) => ({
    pattern: `Recurring friction around "${word}"`,
    frequency,
    suggestion: `Address the root cause of "${word}" to reduce recurring friction.`,
  }));
}

function diffBehavior(older: BehaviorEntry, newer: BehaviorEntry): {
  changed: boolean;
  improvements: string[];
  regressions: string[];
} {
  const olderWords = new Set(older.friction.toLowerCase().split(/\s+/));
  const newerWords = new Set(newer.friction.toLowerCase().split(/\s+/));

  const resolved = [...olderWords].filter(w => !newerWords.has(w) && w.length > 4);
  const newFrictions = [...newerWords].filter(w => !olderWords.has(w) && w.length > 4);

  return {
    changed: resolved.length > 0 || newFrictions.length > 0,
    improvements: resolved.map(w => `Friction "${w}" resolved`),
    regressions: newFrictions.map(w => `New friction "${w}" detected`),
  };
}

describe("Diff Engine", () => {
  const sampleEntries: BehaviorEntry[] = [
    {
      date: "2024-01-01",
      friction: "meetings taking too much time context switching",
      decisions: "decided to block deep work time",
      assumptions: "team will respect blocked time",
    },
    {
      date: "2024-01-02",
      friction: "meetings still blocking deep work context switching",
      decisions: "added calendar buffers",
      assumptions: "calendar blocks will help",
    },
    {
      date: "2024-01-03",
      friction: "email overload distracting from work",
      decisions: "set email check times",
      assumptions: "email batching reduces distraction",
    },
  ];

  it("returns empty array for fewer than 2 entries", () => {
    expect(detectPatterns([])).toEqual([]);
    expect(detectPatterns([sampleEntries[0]])).toEqual([]);
  });

  it("detects recurring friction patterns across entries", () => {
    const rules = detectPatterns(sampleEntries);
    expect(rules.length).toBeGreaterThan(0);
    const patterns = rules.map(r => r.pattern);
    expect(patterns.some(p => p.includes("meetings") || p.includes("context") || p.includes("switching"))).toBe(true);
  });

  it("returns growth rules with frequency >= 2", () => {
    const rules = detectPatterns(sampleEntries);
    expect(rules.every(r => r.frequency >= 2)).toBe(true);
  });

  it("diffs behavior between two entries and detects changes", () => {
    const result = diffBehavior(sampleEntries[0], sampleEntries[2]);
    expect(result.changed).toBe(true);
  });

  it("identifies improvements when friction words disappear", () => {
    const older: BehaviorEntry = {
      date: "2024-01-01",
      friction: "procrastination blocking productivity",
      decisions: "set deadlines",
      assumptions: "deadlines help",
    };
    const newer: BehaviorEntry = {
      date: "2024-01-07",
      friction: "meetings overrunning schedule",
      decisions: "timeboxed meetings",
      assumptions: "timeboxing works",
    };
    const result = diffBehavior(older, newer);
    expect(result.improvements.some(i => i.includes("procrastination") || i.includes("blocking") || i.includes("productivity"))).toBe(true);
  });
});
