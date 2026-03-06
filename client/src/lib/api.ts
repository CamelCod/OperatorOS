import type { DailyEntry, DecisionEntry, GeneratedContent, LeverageDiffResult } from "@shared/schema";

export type UserStatsResponse = {
  streak: number;
  decisionsTracked: number;
  contentPieces: number;
  hasOnboarded: boolean;
};

export type GeneratedContentWithParsed = GeneratedContent & {
  parsedContent?: string[];
};

class ApiClient {
  private baseUrl = '/api';

  // User Stats
  async getStats(): Promise<UserStatsResponse> {
    const res = await fetch(`${this.baseUrl}/stats`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  }

  async updateStats(updates: Partial<UserStatsResponse>): Promise<UserStatsResponse> {
    const res = await fetch(`${this.baseUrl}/stats`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update stats');
    return res.json();
  }

  // Daily Entries
  async getEntries(): Promise<DailyEntry[]> {
    const res = await fetch(`${this.baseUrl}/entries`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch entries');
    return res.json();
  }

  async getEntry(id: string): Promise<DailyEntry> {
    const res = await fetch(`${this.baseUrl}/entries/${id}`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch entry');
    return res.json();
  }

  async createEntry(entry: Partial<DailyEntry>): Promise<DailyEntry> {
    const res = await fetch(`${this.baseUrl}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(entry)
    });
    if (!res.ok) throw new Error('Failed to create entry');
    return res.json();
  }

  async updateEntry(id: string, updates: Partial<DailyEntry>): Promise<DailyEntry> {
    const res = await fetch(`${this.baseUrl}/entries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update entry');
    return res.json();
  }

  // Decision Entries
  async getDecisions(): Promise<DecisionEntry[]> {
    const res = await fetch(`${this.baseUrl}/decisions`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch decisions');
    return res.json();
  }

  async getDecision(id: string): Promise<DecisionEntry> {
    const res = await fetch(`${this.baseUrl}/decisions/${id}`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch decision');
    return res.json();
  }

  async createDecision(decision: Partial<DecisionEntry>): Promise<DecisionEntry> {
    const res = await fetch(`${this.baseUrl}/decisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(decision)
    });
    if (!res.ok) throw new Error('Failed to create decision');
    return res.json();
  }

  // AI Synthesis
  async synthesizeDaily(input: { friction: string; decisions: string; assumptions: string }): Promise<{
    personalPattern: string;
    businessLeverage: string;
    contentIdeas: string[];
  }> {
    const res = await fetch(`${this.baseUrl}/synthesize/daily`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input)
    });
    if (!res.ok) throw new Error('Failed to synthesize daily entry');
    return res.json();
  }

  async synthesizeDecision(input: { 
    title: string; 
    timeHorizon: string; 
    context: string; 
    options: string[]; 
    worstCase: string 
  }): Promise<{ mitigation: string }> {
    const res = await fetch(`${this.baseUrl}/synthesize/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input)
    });
    if (!res.ok) throw new Error('Failed to synthesize decision');
    return res.json();
  }

  async generateContent(contentIdea: string, context: { friction: string; decisions: string; assumptions: string }): Promise<{
    twitterThread: string[];
    linkedinPost: string;
    articleOutline: string;
  }> {
    const res = await fetch(`${this.baseUrl}/generate-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ contentIdea, context })
    });
    if (!res.ok) throw new Error('Failed to generate content');
    return res.json();
  }

  // Generated Content Library
  async getGeneratedContent(): Promise<GeneratedContent[]> {
    const res = await fetch(`${this.baseUrl}/content`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch content');
    return res.json();
  }

  async generateAndSaveContent(contentIdea: string, context: { friction: string; decisions: string; assumptions: string }, sourceEntryId?: string): Promise<{
    twitterThread: string[];
    linkedinPost: string;
    articleOutline: string;
    savedIds: string[];
  }> {
    const res = await fetch(`${this.baseUrl}/content/generate-and-save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ contentIdea, context, sourceEntryId })
    });
    if (!res.ok) throw new Error('Failed to generate and save content');
    return res.json();
  }

  // Leverage Diff History
  async getLeverageHistory(): Promise<LeverageDiffResult[]> {
    const res = await fetch(`${this.baseUrl}/leverage-history`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch leverage history');
    return res.json();
  }

  // Share with watermark
  async getShareText(content: string, type: string): Promise<{ shareText: string; appUrl: string }> {
    const res = await fetch(`${this.baseUrl}/share-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content, type })
    });
    if (!res.ok) throw new Error('Failed to get share text');
    return res.json();
  }
}

export const api = new ApiClient();
