import { 
  type DailyEntry,
  type InsertDailyEntry,
  type DecisionEntry,
  type InsertDecisionEntry,
  type UserStats,
  type InsertUserStats,
  type GeneratedContent,
  type InsertGeneratedContent,
  type DecisionAnalysis,
  type InsertDecisionAnalysis,
  type LeverageDiffResult,
  type InsertLeverageDiffResult,
  dailyEntries,
  decisionEntries,
  userStats,
  generatedContent,
  decisionAnalyses,
  leverageDiffResults
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Daily Entries
  getDailyEntries(userId: string): Promise<DailyEntry[]>;
  getDailyEntry(id: string, userId: string): Promise<DailyEntry | undefined>;
  createDailyEntry(entry: InsertDailyEntry): Promise<DailyEntry>;
  updateDailyEntry(id: string, userId: string, updates: Partial<InsertDailyEntry>): Promise<DailyEntry | undefined>;
  
  // Decision Entries
  getDecisionEntries(userId: string): Promise<DecisionEntry[]>;
  getDecisionEntry(id: string, userId: string): Promise<DecisionEntry | undefined>;
  createDecisionEntry(entry: InsertDecisionEntry): Promise<DecisionEntry>;
  
  // User Stats
  getUserStats(userId: string): Promise<UserStats | undefined>;
  updateUserStats(userId: string, stats: Partial<InsertUserStats>): Promise<UserStats>;

  // Generated Content
  getGeneratedContent(userId: string): Promise<GeneratedContent[]>;
  createGeneratedContent(content: InsertGeneratedContent): Promise<GeneratedContent>;
  
  // Decision Analyses
  getDecisionAnalyses(userId: string): Promise<DecisionAnalysis[]>;
  createDecisionAnalysis(analysis: InsertDecisionAnalysis): Promise<DecisionAnalysis>;
  
  // Leverage Diff Results
  getLeverageDiffResults(userId: string): Promise<LeverageDiffResult[]>;
  createLeverageDiffResult(result: InsertLeverageDiffResult): Promise<LeverageDiffResult>;
}

export class DatabaseStorage implements IStorage {
  // Daily Entries
  async getDailyEntries(userId: string): Promise<DailyEntry[]> {
    return await db.select().from(dailyEntries)
      .where(eq(dailyEntries.userId, userId))
      .orderBy(desc(dailyEntries.date));
  }

  async getDailyEntry(id: string, userId: string): Promise<DailyEntry | undefined> {
    const result = await db.select().from(dailyEntries)
      .where(and(eq(dailyEntries.id, id), eq(dailyEntries.userId, userId)))
      .limit(1);
    return result[0];
  }

  async createDailyEntry(entry: InsertDailyEntry): Promise<DailyEntry> {
    const result = await db.insert(dailyEntries).values(entry).returning();
    
    // Update user stats
    const stats = await this.getUserStats(entry.userId);
    if (stats) {
      const contentCount = entry.outputs?.contentIdeas?.length || 0;
      await this.updateUserStats(entry.userId, {
        streak: stats.streak + 1,
        contentPieces: stats.contentPieces + contentCount
      });
    }
    
    return result[0];
  }

  async updateDailyEntry(id: string, userId: string, updates: Partial<InsertDailyEntry>): Promise<DailyEntry | undefined> {
    const result = await db.update(dailyEntries)
      .set(updates)
      .where(and(eq(dailyEntries.id, id), eq(dailyEntries.userId, userId)))
      .returning();
    return result[0];
  }

  // Decision Entries
  async getDecisionEntries(userId: string): Promise<DecisionEntry[]> {
    return await db.select().from(decisionEntries)
      .where(eq(decisionEntries.userId, userId))
      .orderBy(desc(decisionEntries.date));
  }

  async getDecisionEntry(id: string, userId: string): Promise<DecisionEntry | undefined> {
    const result = await db.select().from(decisionEntries)
      .where(and(eq(decisionEntries.id, id), eq(decisionEntries.userId, userId)))
      .limit(1);
    return result[0];
  }

  async createDecisionEntry(entry: InsertDecisionEntry): Promise<DecisionEntry> {
    const result = await db.insert(decisionEntries).values(entry).returning();
    
    // Update user stats
    const stats = await this.getUserStats(entry.userId);
    if (stats) {
      await this.updateUserStats(entry.userId, {
        decisionsTracked: stats.decisionsTracked + 1
      });
    }
    
    return result[0];
  }

  // User Stats
  async getUserStats(userId: string): Promise<UserStats | undefined> {
    const result = await db.select().from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);
    return result[0];
  }

  async updateUserStats(userId: string, updates: Partial<InsertUserStats>): Promise<UserStats> {
    // Check if stats exist for this user
    const existing = await this.getUserStats(userId);
    
    if (existing) {
      // Update existing record
      const result = await db.update(userStats)
        .set(updates)
        .where(eq(userStats.userId, userId))
        .returning();
      return result[0];
    } else {
      // Create new record with defaults + updates
      const result = await db.insert(userStats)
        .values({
          userId,
          streak: 0,
          decisionsTracked: 0,
          contentPieces: 0,
          hasOnboarded: 0,
          ...updates
        })
        .returning();
      return result[0];
    }
  }

  // Generated Content
  async getGeneratedContent(userId: string): Promise<GeneratedContent[]> {
    return await db.select().from(generatedContent)
      .where(eq(generatedContent.userId, userId))
      .orderBy(desc(generatedContent.createdAt));
  }

  async createGeneratedContent(content: InsertGeneratedContent): Promise<GeneratedContent> {
    const result = await db.insert(generatedContent).values(content).returning();
    
    // Update user stats
    const stats = await this.getUserStats(content.userId);
    if (stats) {
      await this.updateUserStats(content.userId, {
        contentPieces: stats.contentPieces + 1
      });
    }
    
    return result[0];
  }

  // Decision Analyses
  async getDecisionAnalyses(userId: string): Promise<DecisionAnalysis[]> {
    return await db.select().from(decisionAnalyses)
      .where(eq(decisionAnalyses.userId, userId))
      .orderBy(desc(decisionAnalyses.createdAt));
  }

  async createDecisionAnalysis(analysis: InsertDecisionAnalysis): Promise<DecisionAnalysis> {
    const result = await db.insert(decisionAnalyses).values(analysis).returning();
    return result[0];
  }

  // Leverage Diff Results
  async getLeverageDiffResults(userId: string): Promise<LeverageDiffResult[]> {
    return await db.select().from(leverageDiffResults)
      .where(eq(leverageDiffResults.userId, userId))
      .orderBy(desc(leverageDiffResults.createdAt));
  }

  async createLeverageDiffResult(result: InsertLeverageDiffResult): Promise<LeverageDiffResult> {
    const inserted = await db.insert(leverageDiffResults).values(result).returning();
    return inserted[0];
  }
}

export const storage = new DatabaseStorage();
