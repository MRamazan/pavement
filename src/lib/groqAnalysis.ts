import Groq from "groq-sdk";
import type { AIAnalysis, IssueCategory, Priority } from "@/types";

const ANALYSIS_SYSTEM_PROMPT = `You are an expert urban infrastructure analyst working for a city maintenance department. Your job is to analyze photos and descriptions of urban infrastructure problems and generate precise, actionable maintenance tickets.

You evaluate issues based on these PRIORITY CRITERIA (be rigorous and consistent):

CRITICAL (Score 85–100): Immediate life safety hazard. Active danger to pedestrians/vehicles. Requires emergency response within 24 hours.
Examples: Deep potholes in traffic lanes, fallen trees blocking roads, collapsed infrastructure, exposed electrical hazards, severe flooding.

HIGH (Score 65–84): Significant safety or functional risk. Notable impact on public services or vulnerable populations. Requires action within 48–72 hours.
Examples: Broken streetlights on pedestrian routes, large sidewalk cracks with confirmed injuries, extensive graffiti at schools, major signage damage.

MEDIUM (Score 35–64): Moderate issue. Affects quality of life or creates growing risk. Schedule within 1–2 weeks.
Examples: Minor sidewalk cracks, graffiti on non-sensitive surfaces, illegal dumping, worn road markings, broken benches.

LOW (Score 1–34): Minor cosmetic or non-urgent maintenance. Schedule within 30 days.
Examples: Faded paint, minor aesthetic damage, worn surfaces without safety implications.

SCORING FACTORS (weighted):
- Safety risk to humans (+30 points if active hazard)
- Affected population size (scale 1–20 points based on traffic/density)
- Vulnerability of affected users (elderly, children, disabled: +10 points)
- Duration of issue (longer = worse, up to +10 points)
- Infrastructure criticality (main roads, schools, transit = higher)
- Environmental/legal compliance (ADA violations, health hazards = +10)

You must respond ONLY with valid JSON matching the exact schema provided. No markdown, no explanation, just JSON.`;

function scoreToPriority(score: number): Priority {
  if (score >= 85) return "CRITICAL";
  if (score >= 65) return "HIGH";
  if (score >= 35) return "MEDIUM";
  return "LOW";
}

export async function analyzeInfrastructureIssue(
  imageBase64: string,
  userDescription: string | undefined,
  apiKey: string
): Promise<AIAnalysis> {
  const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

  const userContent: Groq.Chat.ChatCompletionContentPart[] = [];

  // Add image if provided
  if (imageBase64 && imageBase64.length > 0) {
    // Check if it's a data URL or raw base64
    const imageData = imageBase64.startsWith("data:")
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    userContent.push({
      type: "image_url",
      image_url: {
        url: imageData,
      },
    });
  }

  const textPrompt = `Analyze this urban infrastructure issue${userDescription ? ` (User description: "${userDescription}")` : ""}.

Respond with ONLY this JSON structure, no other text:
{
  "issueType": "<one of: pothole|cracked_sidewalk|graffiti|broken_streetlight|damaged_sign|flooding|fallen_tree|illegal_dumping|broken_bench|road_damage|other>",
  "issueSummary": "<one sharp sentence, max 12 words>",
  "detailedDescription": "<2-3 sentences with specific observations about size, severity, location context, and duration estimate>",
  "priorityScore": <integer 1-100 following the scoring criteria>,
  "priorityReason": "<2-3 sentence explanation of exactly why this score was assigned, referencing specific scoring factors>",
  "safetyRisk": <true if there is active risk of bodily harm, otherwise false>,
  "estimatedRepairCost": "<realistic cost range like '$200–$500', account for labor + materials>",
  "affectedPopulation": "<estimate like '~500 daily pedestrians' or '~1,200 commuters'>",
  "recommendedAction": "<specific, actionable 2-3 step repair plan with timeline>",
  "urgencyWindow": "<specific like 'Within 24 hours', 'Within 48 hours', 'Within 1 week', 'Within 30 days'>",
  "confidence": <float 0.7-0.99 representing your confidence in the analysis>,
  "tags": ["<3-5 relevant lowercase-hyphenated tags>"]
}`;

  userContent.push({
    type: "text",
    text: textPrompt,
  });

  const response = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      {
        role: "system",
        content: ANALYSIS_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: userContent,
      },
    ],
    temperature: 0.3, // Low temp for consistent, factual outputs
    max_tokens: 1024,
  });

  const rawText = response.choices[0]?.message?.content ?? "";

  // Parse JSON - handle potential markdown wrapping
  let parsed: Record<string, unknown>;
  try {
    const cleaned = rawText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`AI returned invalid JSON: ${rawText.slice(0, 200)}`);
  }

  const priorityScore = Math.min(100, Math.max(1, Number(parsed.priorityScore) || 50));
  const priority = scoreToPriority(priorityScore);

  return {
    issueType: (parsed.issueType as IssueCategory) || "other",
    issueSummary: String(parsed.issueSummary || "Infrastructure issue detected"),
    detailedDescription: String(parsed.detailedDescription || ""),
    priorityScore,
    priority,
    priorityReason: String(parsed.priorityReason || ""),
    safetyRisk: Boolean(parsed.safetyRisk),
    estimatedRepairCost: String(parsed.estimatedRepairCost || "To be assessed"),
    affectedPopulation: String(parsed.affectedPopulation || "Unknown"),
    recommendedAction: String(parsed.recommendedAction || ""),
    urgencyWindow: String(parsed.urgencyWindow || "Within 30 days"),
    confidence: Math.min(0.99, Math.max(0.1, Number(parsed.confidence) || 0.8)),
    tags: Array.isArray(parsed.tags)
      ? (parsed.tags as string[]).slice(0, 6)
      : [],
  };
}
