import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDailyEntrySchema, insertDecisionEntrySchema, insertGeneratedContentSchema, insertLeverageDiffResultSchema } from "@shared/schema";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { synthesizeDailyEntry, synthesizeDecision, generateContent, enhanceContent, generateLeverageAnalysis } from "./replit_integrations/synthesis";

const APP_URL = process.env.REPLIT_DEV_DOMAIN 
  ? `https://${process.env.REPLIT_DEV_DOMAIN}`
  : (process.env.REPLIT_DEPLOYMENT_ID 
    ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER?.toLowerCase()}.repl.co`
    : 'https://operatoros.replit.app');

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup Replit Auth (BEFORE registering other routes)
  await setupAuth(app);
  registerAuthRoutes(app);

  // Helper to get user ID from Replit Auth session
  const getUserId = (req: any): string => {
    return req.user?.claims?.sub;
  };
  
  // ======= USER STATS ROUTES =======
  
  app.get('/api/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const stats = await storage.getUserStats(userId);
      if (!stats) {
        return res.json({
          streak: 0,
          decisionsTracked: 0,
          contentPieces: 0,
          hasOnboarded: false
        });
      }
      res.json({
        ...stats,
        hasOnboarded: stats.hasOnboarded === 1
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  app.patch('/api/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const updates = req.body;
      if (typeof updates.hasOnboarded === 'boolean') {
        updates.hasOnboarded = updates.hasOnboarded ? 1 : 0;
      }
      const stats = await storage.updateUserStats(userId, updates);
      res.json({
        ...stats,
        hasOnboarded: stats.hasOnboarded === 1
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update stats' });
    }
  });

  // ======= DAILY ENTRIES ROUTES =======
  
  app.get('/api/entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const entries = await storage.getDailyEntries(userId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch entries' });
    }
  });

  app.get('/api/entries/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const entry = await storage.getDailyEntry(req.params.id, userId);
      if (!entry) {
        return res.status(404).json({ error: 'Entry not found' });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch entry' });
    }
  });

  app.post('/api/entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const entryData = insertDailyEntrySchema.parse({
        ...req.body,
        userId
      });
      const entry = await storage.createDailyEntry(entryData);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ error: 'Invalid entry data' });
    }
  });

  app.patch('/api/entries/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const updates = req.body;
      const entry = await storage.updateDailyEntry(req.params.id, userId, updates);
      if (!entry) {
        return res.status(404).json({ error: 'Entry not found' });
      }
      res.json(entry);
    } catch (error) {
      res.status(400).json({ error: 'Invalid update data' });
    }
  });

  // ======= DECISION ENTRIES ROUTES =======
  
  app.get('/api/decisions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const decisions = await storage.getDecisionEntries(userId);
      res.json(decisions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch decisions' });
    }
  });

  app.get('/api/decisions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const decision = await storage.getDecisionEntry(req.params.id, userId);
      if (!decision) {
        return res.status(404).json({ error: 'Decision not found' });
      }
      res.json(decision);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch decision' });
    }
  });

  app.post('/api/decisions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const decisionData = insertDecisionEntrySchema.parse({
        ...req.body,
        userId
      });
      const decision = await storage.createDecisionEntry(decisionData);
      res.json(decision);
    } catch (error) {
      res.status(400).json({ error: 'Invalid decision data' });
    }
  });

  // ======= AI SYNTHESIS ROUTES =======
  
  app.post('/api/synthesize/daily', isAuthenticated, async (req: any, res) => {
    try {
      const { friction, decisions, assumptions } = req.body;
      if (!friction && !decisions && !assumptions) {
        return res.status(400).json({ error: 'At least one field is required' });
      }
      const synthesis = await synthesizeDailyEntry({ friction, decisions, assumptions });
      res.json(synthesis);
    } catch (error) {
      console.error('Daily synthesis error:', error);
      res.status(500).json({ error: 'Failed to synthesize daily entry' });
    }
  });

  app.post('/api/synthesize/decision', isAuthenticated, async (req: any, res) => {
    try {
      const { title, timeHorizon, context, options, worstCase } = req.body;
      if (!title || !worstCase) {
        return res.status(400).json({ error: 'Title and worst case are required' });
      }
      const mitigation = await synthesizeDecision({ title, timeHorizon, context, options, worstCase });
      res.json({ mitigation });
    } catch (error) {
      console.error('Decision synthesis error:', error);
      res.status(500).json({ error: 'Failed to synthesize decision' });
    }
  });

  app.post('/api/generate-content', isAuthenticated, async (req: any, res) => {
    try {
      const { contentIdea, context } = req.body;
      if (!contentIdea) {
        return res.status(400).json({ error: 'Content idea is required' });
      }
      const content = await generateContent(contentIdea, context || { friction: '', decisions: '', assumptions: '' });
      res.json(content);
    } catch (error) {
      console.error('Content generation error:', error);
      res.status(500).json({ error: 'Failed to generate content' });
    }
  });

  app.post('/api/synthesize/content-enhance', isAuthenticated, async (req: any, res) => {
    try {
      const { title, body } = req.body;
      const enhanced = await enhanceContent(title || '', body || '');
      res.json(enhanced);
    } catch (error) {
      console.error('Content enhancement error:', error);
      res.status(500).json({ error: 'Failed to enhance content' });
    }
  });

  app.post('/api/synthesize/leverage', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const entries = await storage.getDailyEntries(userId);
      const analysis = await generateLeverageAnalysis(entries);
      
      // Save the leverage diff result to database
      await storage.createLeverageDiffResult({
        userId,
        shiftBefore: analysis.shift.before,
        shiftAfter: analysis.shift.after,
        summaryChanged: analysis.summary.changed,
        summaryImportance: analysis.summary.importance,
        summaryNewProtocol: analysis.summary.newProtocol,
        compoundingRule: analysis.compoundingRule,
        proofPost: analysis.proofPost
      });
      
      res.json(analysis);
    } catch (error) {
      console.error('Leverage analysis error:', error);
      res.status(500).json({ error: 'Failed to generate leverage analysis' });
    }
  });

  // ======= GENERATED CONTENT ROUTES =======
  
  app.get('/api/content', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const content = await storage.getGeneratedContent(userId);
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch content' });
    }
  });

  app.post('/api/content', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const contentData = insertGeneratedContentSchema.parse({
        ...req.body,
        userId
      });
      const content = await storage.createGeneratedContent(contentData);
      res.json(content);
    } catch (error) {
      console.error('Create content error:', error);
      res.status(400).json({ error: 'Invalid content data' });
    }
  });

  app.post('/api/content/generate-and-save', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { contentIdea, context, sourceEntryId } = req.body;
      if (!contentIdea) {
        return res.status(400).json({ error: 'Content idea is required' });
      }
      
      // Generate content using AI
      const generated = await generateContent(contentIdea, context || { friction: '', decisions: '', assumptions: '' });
      
      // Save all three types of content
      const savedContent = await Promise.all([
        storage.createGeneratedContent({
          userId,
          sourceEntryId: sourceEntryId || null,
          contentType: 'twitter_thread',
          title: contentIdea,
          content: JSON.stringify(generated.twitterThread),
          sourceIdea: contentIdea
        }),
        storage.createGeneratedContent({
          userId,
          sourceEntryId: sourceEntryId || null,
          contentType: 'linkedin_post',
          title: contentIdea,
          content: generated.linkedinPost,
          sourceIdea: contentIdea
        }),
        storage.createGeneratedContent({
          userId,
          sourceEntryId: sourceEntryId || null,
          contentType: 'article_outline',
          title: contentIdea,
          content: generated.articleOutline,
          sourceIdea: contentIdea
        })
      ]);
      
      res.json({
        ...generated,
        savedIds: savedContent.map(c => c.id)
      });
    } catch (error) {
      console.error('Content generation error:', error);
      res.status(500).json({ error: 'Failed to generate content' });
    }
  });

  // ======= LEVERAGE DIFF HISTORY ROUTES =======
  
  app.get('/api/leverage-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const results = await storage.getLeverageDiffResults(userId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch leverage history' });
    }
  });

  // ======= SHARE UTILITIES =======
  
  app.post('/api/share-text', isAuthenticated, async (req: any, res) => {
    try {
      const { content, type } = req.body;
      const watermark = `\n\n---\nGenerated by OperatorOS\nStart building leverage today: ${APP_URL}`;
      res.json({ 
        shareText: `${content}${watermark}`,
        appUrl: APP_URL
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate share text' });
    }
  });

  return httpServer;
}
