import { describe, it, expect } from "vitest";

// Insight Generator: maps raw behavior logs to three output streams
interface InsightInput {
  friction: string;
  decisions: string;
  assumptions: string;
}

interface InsightOutput {
  personalPattern: string;
  businessLeverage: string;
  publishReadyContent: string[];
}

function generateInsights(input: InsightInput): InsightOutput {
  const frictionTopics = input.friction
    .split(/[,.!?]/)
    .map(s => s.trim())
    .filter(s => s.length > 5);

  const decisionTopics = input.decisions
    .split(/[,.!?]/)
    .map(s => s.trim())
    .filter(s => s.length > 5);

  const personalPattern =
    frictionTopics.length > 0
      ? `You repeatedly encounter friction around: ${frictionTopics[0]}.`
      : "No recurring patterns detected yet.";

  const businessLeverage =
    decisionTopics.length > 0
      ? `High-leverage action: Systematize "${decisionTopics[0]}" to remove bottlenecks.`
      : "Log more decisions to unlock leverage insights.";

  const publishReadyContent = [
    frictionTopics[0] ? `Why "${frictionTopics[0]}" is slowing your growth (and how to fix it)` : "Overcoming daily friction",
    decisionTopics[0] ? `The decision that changed my workflow: ${decisionTopics[0]}` : "Decision frameworks for operators",
    `Assumptions I'm testing this week: ${input.assumptions.slice(0, 60)}`,
  ];

  return { personalPattern, businessLeverage, publishReadyContent };
}

describe("Insight Generator", () => {
  const sampleInput: InsightInput = {
    friction: "context switching between tools, unclear priorities",
    decisions: "block focus time, reduce meeting count",
    assumptions: "fewer meetings leads to more output",
  };

  it("generates all three insight streams", () => {
    const output = generateInsights(sampleInput);
    expect(output.personalPattern).toBeTruthy();
    expect(output.businessLeverage).toBeTruthy();
    expect(output.publishReadyContent).toHaveLength(3);
  });

  it("personal pattern references friction input", () => {
    const output = generateInsights(sampleInput);
    expect(output.personalPattern.length).toBeGreaterThan(10);
  });

  it("business leverage references decisions input", () => {
    const output = generateInsights(sampleInput);
    expect(output.businessLeverage).toContain("leverage");
  });

  it("generates three publish-ready content ideas", () => {
    const output = generateInsights(sampleInput);
    expect(output.publishReadyContent).toHaveLength(3);
    output.publishReadyContent.forEach(idea => {
      expect(typeof idea).toBe("string");
      expect(idea.length).toBeGreaterThan(5);
    });
  });

  it("handles empty inputs gracefully", () => {
    const output = generateInsights({ friction: "", decisions: "", assumptions: "" });
    expect(output.personalPattern).toBeTruthy();
    expect(output.businessLeverage).toBeTruthy();
    expect(output.publishReadyContent).toHaveLength(3);
  });
});
