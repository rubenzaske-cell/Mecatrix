import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const photos: string[] = Array.isArray(body?.photos) ? body.photos : [];

    if (photos.length === 0) {
      return NextResponse.json({ error: "At least one photo required" }, { status: 400 });
    }

    const zai = await ZAI.create();

    const content: unknown[] = [
      {
        type: "text",
        text: `You are an automotive identification expert. Identify the vehicle from these photos. Respond with VALID JSON ONLY matching:
{
  "manufacturer": string,
  "model": string,
  "year": string,
  "engineType": "Gasoline" | "Diesel" | "Hybrid" | "Electric" | "Unknown",
  "displacement": string,
  "fuelSystem": string,
  "confidence": number,
  "notes": string
}
If a field cannot be determined, use "Unknown" and set confidence accordingly (lower). Be honest about uncertainty.`,
      },
      ...photos.slice(0, 5).map((url) => ({ type: "image_url", image_url: { url } })),
    ];

    const response = await zai.chat.completions.createVision({
      messages: [{ role: "user", content }],
      thinking: { type: "disabled" },
    });

    const raw = response.choices[0]?.message?.content ?? "";
    try {
      const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*$/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return NextResponse.json({ identification: parsed });
    } catch {
      return NextResponse.json({ error: "Could not parse identification", raw }, { status: 502 });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Identification failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
