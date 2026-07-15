import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const runtime = "nodejs";
export const maxDuration = 120;

interface Finding {
  component: string;
  status: "ok" | "warn" | "crit";
  confidence: number;
  symptom: string;
  cause: string;
  explanation: string;
  recommendation: string;
  tools: string[];
  difficulty: "Easy" | "Moderate" | "Hard" | "Expert";
}

interface DiagnosisResult {
  vehicleIdentification: {
    manufacturer: string;
    model: string;
    year: string;
    engineType: string;
    displacement: string;
    fuelSystem: string;
    confidence: number;
  };
  overallConfidence: number;
  severity: "normal" | "inspection" | "critical";
  summary: string;
  findings: Finding[];
  recommendedActions: string[];
}

const SYNTH_PROMPT = `You are MecaAI, the diagnostic engine of the Mecatrix platform. You combine visual evidence, audio/symptom context and mechanical reasoning to produce a confidence-ranked diagnosis.

Rules:
- NEVER claim certainty. Every finding has a confidence score (0-100) reflecting real-world likelihood given the evidence.
- Status: "ok" = normal/healthy, "warn" = needs inspection, "crit" = high probability of failure.
- Be specific and technical but clear.
- If evidence is weak, lower confidence and recommend professional inspection.
- Always include safety considerations in recommendations.
- Respond with VALID JSON ONLY. No markdown, no commentary. The JSON must match the requested schema exactly.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const photos: string[] = Array.isArray(body?.photos) ? body.photos : [];
    const audioTranscript: string = typeof body?.audioTranscript === "string" ? body.audioTranscript : "";
    const symptoms: string = typeof body?.symptoms === "string" ? body.symptoms : "";
    const vehicleContext: string = typeof body?.vehicleContext === "string" ? body.vehicleContext : "";

    if (photos.length === 0 && !audioTranscript && !symptoms) {
      return NextResponse.json(
        { error: "Provide at least one photo, audio note, or symptom description." },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    // 1. Analyze photos with VLM (if provided)
    let visualAnalysis = "No photos provided.";
    if (photos.length > 0) {
      const vlmContent: unknown[] = [
        {
          type: "text",
          text: `You are an automotive visual diagnostic expert. Analyze these engine/vehicle photos and report:
1. Visible signs of damage, leaks, wear, corrosion, loose components, belt condition, hose condition, fluid levels/colors.
2. Any obvious vehicle identification cues (brand badges, engine layout, component arrangement).
3. Safety concerns visible.
Be concise and factual. Do not speculate beyond what is visible. If a photo is unclear, say so.`,
        },
        ...photos.slice(0, 5).map((url) => ({ type: "image_url", image_url: { url } })),
      ];
      try {
        const vlmRes = await zai.chat.completions.createVision({
          messages: [{ role: "user", content: vlmContent }],
          thinking: { type: "disabled" },
        });
        visualAnalysis = vlmRes.choices[0]?.message?.content ?? "Visual analysis unavailable.";
      } catch {
        visualAnalysis = "Visual analysis failed — proceeding with other evidence.";
      }
    }

    // 2. Synthesize final structured diagnosis with LLM
    const evidenceBlock = [
      `## Visual analysis (from ${photos.length} photo(s))\n${visualAnalysis}`,
      audioTranscript ? `## Audio / voice note transcript\n${audioTranscript}` : "## Audio\n(Not provided)",
      symptoms ? `## Reported symptoms\n${symptoms}` : "## Reported symptoms\n(Not provided)",
      vehicleContext ? `## Known vehicle context\n${vehicleContext}` : "## Known vehicle context\n(Unknown — infer from photos if possible, otherwise mark low confidence)",
    ].join("\n\n");

    const schemaInstruction = `Respond with a JSON object matching EXACTLY this TypeScript type:
{
  "vehicleIdentification": {
    "manufacturer": string,
    "model": string,
    "year": string,
    "engineType": string,        // "Gasoline" | "Diesel" | "Hybrid" | "Electric" | "Unknown"
    "displacement": string,
    "fuelSystem": string,
    "confidence": number          // 0-100
  },
  "overallConfidence": number,    // 0-100
  "severity": "normal" | "inspection" | "critical",
  "summary": string,              // 2-3 sentence overview
  "findings": [
    {
      "component": string,
      "status": "ok" | "warn" | "crit",
      "confidence": number,       // 0-100
      "symptom": string,
      "cause": string,
      "explanation": string,
      "recommendation": string,
      "tools": string[],
      "difficulty": "Easy" | "Moderate" | "Hard" | "Expert"
    }
  ],
  "recommendedActions": string[]
}

Produce 3 to 6 findings covering the most likely affected components based on the evidence. Include at least one "ok" finding if some components appear healthy. Return ONLY the JSON object.`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: SYNTH_PROMPT },
        { role: "user", content: `${evidenceBlock}\n\n---\n${schemaInstruction}` },
      ],
      thinking: { type: "disabled" },
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    let result: DiagnosisResult;
    try {
      // Strip any accidental markdown fences
      const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*$/g, "").trim();
      result = JSON.parse(cleaned);
    } catch {
      // Fallback: return raw text as summary
      return NextResponse.json({
        error: "Failed to parse diagnosis",
        raw,
        visualAnalysis,
      } as unknown as Record<string, unknown>, { status: 502 });
    }

    // Persist diagnosis to DB (best-effort)
    try {
      const { db } = await import("@/lib/db");
      await db.diagnosis.create({
        data: {
          summary: result.summary,
          confidence: result.overallConfidence,
          severity: result.severity,
          findings: JSON.stringify(result.findings),
          photoUrls: JSON.stringify(photos.slice(0, 5)),
          audioTranscript: audioTranscript || null,
        },
      });
    } catch {
      // DB persistence is best-effort
    }

    return NextResponse.json({ result, visualAnalysis });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Diagnosis failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
