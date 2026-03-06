import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface DailyInput {
  friction: string;
  decisions: string;
  assumptions: string;
}

interface DailySynthesis {
  personalPattern: string;
  businessLeverage: string;
  contentIdeas: string[];
}

interface DecisionInput {
  title: string;
  timeHorizon: string;
  context: string;
  options: string[];
  worstCase: string;
}

export async function synthesizeDailyEntry(input: DailyInput): Promise<DailySynthesis> {
  const prompt = `You are an expert behavioral analyst and business strategist for operators and founders. Analyze the following daily reflection and provide actionable insights.

FRICTION POINTS:
${input.friction}

KEY DECISIONS:
${input.decisions}

ASSUMPTIONS:
${input.assumptions}

Based on this reflection, provide:
1. PERSONAL PATTERN: Identify a recurring behavioral pattern that may be causing friction or inefficiency. Be specific and actionable.
2. BUSINESS LEVERAGE: Suggest one high-impact action that could create outsized results based on the decisions and assumptions mentioned.
3. CONTENT IDEAS: Generate 3 content ideas (tweets, posts, or short articles) that could be created from these insights.

Respond in JSON format:
{
  "personalPattern": "One specific behavioral pattern observation (2-3 sentences)",
  "businessLeverage": "One actionable leverage point (2-3 sentences)",
  "contentIdeas": ["Idea 1 title", "Idea 2 title", "Idea 3 title"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 1024,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    
    return {
      personalPattern: parsed.personalPattern || "Analysis pending...",
      businessLeverage: parsed.businessLeverage || "Analysis pending...",
      contentIdeas: parsed.contentIdeas || ["Content idea generation pending..."]
    };
  } catch (error) {
    console.error("AI synthesis error:", error);
    return {
      personalPattern: "Unable to generate pattern analysis. Please try again.",
      businessLeverage: "Unable to generate leverage insights. Please try again.",
      contentIdeas: ["AI synthesis temporarily unavailable"]
    };
  }
}

interface ContentOutput {
  twitterThread: string[];
  linkedinPost: string;
  articleOutline: string;
}

export async function generateContent(contentIdea: string, context: { friction: string; decisions: string; assumptions: string }): Promise<ContentOutput> {
  const prompt = `You are an expert content creator for operators and founders. Based on the following content idea and context, generate three versions of content.

CONTENT IDEA: ${contentIdea}

CONTEXT (user's daily reflection):
- Friction: ${context.friction}
- Decisions: ${context.decisions}
- Assumptions: ${context.assumptions}

Generate content in the user's authentic voice based on their reflections. Make it personal, actionable, and valuable to other operators.

Respond in JSON format:
{
  "twitterThread": ["Tweet 1 (hook - max 280 chars)", "Tweet 2", "Tweet 3", "Tweet 4", "Tweet 5 (CTA)"],
  "linkedinPost": "A 150-200 word LinkedIn post with paragraph breaks. Professional but authentic tone.",
  "articleOutline": "A short article outline with: Title, Introduction hook, 3-4 main points with bullet details, Conclusion/takeaway"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 2048,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    
    return {
      twitterThread: parsed.twitterThread || ["Thread generation pending..."],
      linkedinPost: parsed.linkedinPost || "LinkedIn post generation pending...",
      articleOutline: parsed.articleOutline || "Article outline generation pending..."
    };
  } catch (error) {
    console.error("Content generation error:", error);
    return {
      twitterThread: ["Unable to generate Twitter thread. Please try again."],
      linkedinPost: "Unable to generate LinkedIn post. Please try again.",
      articleOutline: "Unable to generate article outline. Please try again."
    };
  }
}

export async function enhanceContent(title: string, body: string): Promise<{ title: string; body: string }> {
  const prompt = `You are an expert content editor for operators and founders. Enhance the following content idea to be more compelling, clear, and high-leverage.

TITLE: ${title}
BODY: ${body}

Focus on:
1. Impactful hooks
2. Removing fluff
3. Strengthening the call to action or main takeaway
4. Maintaining an authentic operator voice

Respond in JSON format:
{
  "title": "Enhanced title",
  "body": "Enhanced body text"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 1024,
    });

    const content = response.choices[0]?.message?.content || "{}";
    return JSON.parse(content);
  } catch (error) {
    console.error("Content enhancement error:", error);
    return { title, body };
  }
}

export async function generateLeverageAnalysis(entries: any[]): Promise<any> {
  const prompt = `You are an expert behavioral analyst. Analyze the following daily logs from the last 14 days and synthesize a leverage analysis.

LOGS:
${JSON.stringify(entries)}

Respond in JSON format:
{
  "shift": {
    "before": "Description of behavior at the start of the period",
    "after": "Description of behavior shift at the end of the period"
  },
  "summary": {
    "changed": "Short summary of what changed",
    "importance": "Why this matters for the business",
    "newProtocol": "A specific new rule to follow"
  },
  "compoundingRule": "A high-leverage rule to lock in",
  "proofPost": "A compelling social media post (X/LinkedIn style) that proves this growth with data points."
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });
    return JSON.parse(response.choices[0]?.message?.content || "{}");
  } catch (error) {
    console.error("Leverage analysis error:", error);
    throw error;
  }
}

export async function synthesizeDecision(input: DecisionInput): Promise<string> {
  const prompt = `You are a strategic advisor specializing in pre-mortem analysis for operators and founders. Analyze this decision and provide mitigation strategies.

DECISION: ${input.title}
TIME HORIZON: ${input.timeHorizon}
CONTEXT: ${input.context}
OPTIONS CONSIDERED: ${input.options.join(", ")}
WORST CASE SCENARIO: ${input.worstCase}

Provide a STRATEGIC RECOMMENDATION that includes:
1. PRE-MORTEM ACTION: One specific action to validate the failure mode before fully committing
2. HEDGE: A fallback strategy that maintains optionality
3. TRIGGER: A specific metric or condition that signals when to abort or pivot

Keep the response concise but actionable (150-200 words).`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: 512,
    });

    return response.choices[0]?.message?.content || "Unable to generate mitigation strategy.";
  } catch (error) {
    console.error("AI decision synthesis error:", error);
    return "Unable to generate strategic recommendation. Please try again.";
  }
}
