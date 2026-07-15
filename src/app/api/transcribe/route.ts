import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const audio: string = body?.audio ?? "";

    if (!audio) {
      return NextResponse.json({ error: "Audio data required" }, { status: 400 });
    }

    // Accept either raw base64 or a data URL
    const base64 = audio.includes(",")
      ? audio.split(",")[1] ?? ""
      : audio;

    if (!base64) {
      return NextResponse.json({ error: "Invalid audio data" }, { status: 400 });
    }

    const zai = await ZAI.create();
    const response = await zai.audio.asr.create({ file_base64: base64 });
    const transcript = (response?.text ?? "").trim();
    return NextResponse.json({ transcript });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Transcription failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
