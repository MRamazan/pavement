import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import type { AIAnalysis, IssueCategory, Priority } from "@/types";

const ANALYSIS_SYSTEM_PROMPT = `You are an expert urban infrastructure analyst working for a city maintenance department. Your job is to analyze photos and descriptions of urban infrastructure problems and generate precise, actionable maintenance tickets.

You evaluate issues based on these PRIORITY CRITERIA (be rigorous and consistent):

CRITICAL (Score 85-100): Immediate life safety hazard. Active danger to pedestrians/vehicles. Emergency response within 24 hours.
Examples: Deep potholes in traffic lanes, fallen trees blocking roads, collapsed infrastructure, exposed electrical hazards.

HIGH (Score 65-84): Significant safety or functional risk. Notable impact on public services or vulnerable populations. Action within 48-72 hours.
Examples: Broken streetlights on pedestrian routes, large sidewalk cracks with confirmed injuries, extensive graffiti at schools.

MEDIUM (Score 35-64): Moderate issue. Affects quality of life or creates growing risk. Schedule within 1-2 weeks.
Examples: Minor sidewalk cracks, graffiti on non-sensitive surfaces, illegal dumping, worn road markings.

LOW (Score 1-34): Minor cosmetic or non-urgent maintenance. Schedule within 30 days.
Examples: Faded paint, minor aesthetic damage, worn surfaces without safety implications.

SCORING FACTORS (weighted):
- Safety risk to humans (+30 points if active hazard)
- Affected population size (scale 1-20 points based on traffic/density)
- Vulnerability of affected users (elderly, children, disabled: +10 points)
- Duration of issue (longer = worse, up to +10 points)
- Infrastructure criticality (main roads, schools, transit = higher)
- Environmental/legal compliance (ADA violations, health hazards: +10)

Respond ONLY with valid JSON. No markdown, no explanation, just the JSON object.`;

function scoreToPriority(score: number): Priority {
  if (score >= 85) return "CRITICAL";
  if (score >= 65) return "HIGH";
  if (score >= 35) return "MEDIUM";
  return "LOW";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, userDescription, apiKey: clientApiKey } = body;

    // Prefer a key the visitor explicitly typed in; otherwise fall back to
    // the server-side default key (GROQ_API_KEY env var) so judges/testers
    // can use the live deployment without needing their own Groq account.
    const apiKey = (clientApiKey && clientApiKey.trim()) || process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Groq API key is required" },
        { status: 400 }
      );
    }

    const groq = new Groq({ apiKey });

    const userContent: Groq.Chat.ChatCompletionContentPart[] = [];

    if (imageBase64 && imageBase64.length > 100) {
      const imageData = imageBase64.startsWith("data:")
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`;

      userContent.push({
        type: "image_url",
        image_url: { url: imageData },
      });
    }

    const textPrompt = `Analyze this urban infrastructure issue${
      userDescription ? ` (User description: "${userDescription}")` : ""
    }.

Respond with ONLY this JSON object:
{
  "issueType": "<pothole|cracked_sidewalk|graffiti|broken_streetlight|damaged_sign|flooding|fallen_tree|illegal_dumping|broken_bench|road_damage|other>",
  "issueSummary": "<one sharp sentence, max 12 words>",
  "detailedDescription": "<2-3 sentences with specific observations about size, severity, location context, and duration estimate>",
  "priorityScore": <integer 1-100>,
  "priorityReason": "<2-3 sentence explanation referencing specific scoring factors>",
  "safetyRisk": <true|false>,
  "estimatedRepairCost": "<realistic cost range like '$200-$500'>",
  "affectedPopulation": "<estimate like '~500 daily pedestrians'>",
  "recommendedAction": "<specific, actionable 2-3 step repair plan with timeline>",
  "urgencyWindow": "<Within 24 hours|Within 48 hours|Within 1 week|Within 30 days>",
  "confidence": <float 0.70-0.99>,
  "tags": ["<3-5 relevant lowercase-hyphenated tags>"]
}`;

    userContent.push({ type: "text", text: textPrompt });

    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    });

    const rawText = response.choices[0]?.message?.content ?? "";
    
    // Clean and parse JSON
    const cleaned = rawText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/^[^{]*/, "") // Remove anything before first {
      .replace(/[^}]*$/, "}") // Remove anything after last }
      .trim();

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback: try to extract JSON with regex
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error(`Cannot parse AI response: ${rawText.slice(0, 300)}`);
      }
    }

    const priorityScore = Math.min(100, Math.max(1, Number(parsed.priorityScore) || 50));

    const analysis: AIAnalysis = {
      issueType: (parsed.issueType as IssueCategory) || "other",
      issueSummary: String(parsed.issueSummary || "Infrastructure issue detected"),
      detailedDescription: String(parsed.detailedDescription || ""),
      priorityScore,
      priority: scoreToPriority(priorityScore),
      priorityReason: String(parsed.priorityReason || ""),
      safetyRisk: Boolean(parsed.safetyRisk),
      estimatedRepairCost: String(parsed.estimatedRepairCost || "To be assessed"),
      affectedPopulation: String(parsed.affectedPopulation || "Unknown"),
      recommendedAction: String(parsed.recommendedAction || ""),
      urgencyWindow: String(parsed.urgencyWindow || "Within 30 days"),
      confidence: Math.min(0.99, Math.max(0.1, Number(parsed.confidence) || 0.8)),
      tags: Array.isArray(parsed.tags)
        ? (parsed.tags as string[]).filter(Boolean).slice(0, 6)
        : [],
    };

    return NextResponse.json({ analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    console.error("Analysis error:", err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
