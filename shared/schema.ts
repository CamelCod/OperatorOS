import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Export Replit Auth models (users and sessions tables)
export * from "./models/auth";
import { users } from "./models/auth";

// Chat/Conversation tables for OpenAI integration
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const dailyEntries = pgTable("daily_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: text("date").notNull(),
  friction: text("friction").notNull(),
  decisions: text("decisions").notNull(),
  assumptions: text("assumptions").notNull(),
  outputs: jsonb("outputs").$type<{
    personalPattern: string;
    businessLeverage: string;
    contentIdeas: string[];
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const decisionEntries = pgTable("decision_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: text("date").notNull(),
  title: text("title").notNull(),
  timeHorizon: text("time_horizon").notNull(),
  context: text("context").notNull(),
  options: jsonb("options").$type<string[]>().notNull(),
  worstCase: text("worst_case").notNull(),
  mitigation: text("mitigation").notNull(),
  status: text("status").notNull().default('draft'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userStats = pgTable("user_stats", {
  userId: varchar("user_id").primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  streak: integer("streak").notNull().default(0),
  decisionsTracked: integer("decisions_tracked").notNull().default(0),
  contentPieces: integer("content_pieces").notNull().default(0),
  hasOnboarded: integer("has_onboarded").notNull().default(0),
});

export const generatedContent = pgTable("generated_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  sourceEntryId: varchar("source_entry_id").references(() => dailyEntries.id, { onDelete: 'set null' }),
  contentType: text("content_type").notNull(), // 'twitter_thread', 'linkedin_post', 'article_outline'
  title: text("title").notNull(),
  content: text("content").notNull(),
  sourceIdea: text("source_idea"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const decisionAnalyses = pgTable("decision_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  decisionEntryId: varchar("decision_entry_id").references(() => decisionEntries.id, { onDelete: 'cascade' }),
  analysis: text("analysis").notNull(),
  recommendation: text("recommendation"),
  riskLevel: text("risk_level"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leverageDiffResults = pgTable("leverage_diff_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  shiftBefore: text("shift_before").notNull(),
  shiftAfter: text("shift_after").notNull(),
  summaryChanged: text("summary_changed").notNull(),
  summaryImportance: text("summary_importance").notNull(),
  summaryNewProtocol: text("summary_new_protocol").notNull(),
  compoundingRule: text("compounding_rule").notNull(),
  proofPost: text("proof_post").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertDailyEntrySchema = createInsertSchema(dailyEntries).omit({
  id: true,
  createdAt: true,
});

export const insertDecisionEntrySchema = createInsertSchema(decisionEntries).omit({
  id: true,
  createdAt: true,
});

export const insertUserStatsSchema = createInsertSchema(userStats);

export const insertGeneratedContentSchema = createInsertSchema(generatedContent).omit({
  id: true,
  createdAt: true,
});

export const insertDecisionAnalysisSchema = createInsertSchema(decisionAnalyses).omit({
  id: true,
  createdAt: true,
});

export const insertLeverageDiffResultSchema = createInsertSchema(leverageDiffResults).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertDailyEntry = z.infer<typeof insertDailyEntrySchema>;
export type DailyEntry = typeof dailyEntries.$inferSelect;

export type InsertDecisionEntry = z.infer<typeof insertDecisionEntrySchema>;
export type DecisionEntry = typeof decisionEntries.$inferSelect;

export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type UserStats = typeof userStats.$inferSelect;

export type InsertGeneratedContent = z.infer<typeof insertGeneratedContentSchema>;
export type GeneratedContent = typeof generatedContent.$inferSelect;

export type InsertDecisionAnalysis = z.infer<typeof insertDecisionAnalysisSchema>;
export type DecisionAnalysis = typeof decisionAnalyses.$inferSelect;

export type InsertLeverageDiffResult = z.infer<typeof insertLeverageDiffResultSchema>;
export type LeverageDiffResult = typeof leverageDiffResults.$inferSelect;
