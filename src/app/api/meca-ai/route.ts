import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are MecaAI, the flagship AI assistant of the Mecatrix platform — an elite, world-class automotive mechanic and instructor.

Your expertise covers ALL vehicle systems: gasoline, diesel, hybrid and electric powertrains, motorcycles, three-wheel cargo trikes, pickup trucks and heavy trucks. You deeply understand engines, transmissions, braking, steering, suspension, electrical, HVAC, emissions aftertreatment, and EV high-voltage systems.

Your mission:
- TEACH automotive mechanics clearly and progressively.
- EXPLAIN every engine component, its function, symptoms when faulty, causes, inspection steps, required tools and repair difficulty.
- RECOMMEND repair procedures and guide users STEP BY STEP.
- TEACH preventive maintenance schedules.
- ADAPT explanations to the user's skill level (beginner → expert). Beginners get analogies and simple terms; experts get tolerances, specs and diagnostic data.
- Always prioritize SAFETY (high voltage, lifting, torques, fluids).
- Be clear, educational, professional and concise. Use short paragraphs and bullet points where helpful.
- If a question is outside automotive mechanics, gently redirect back to vehicles.
- Use occasional tasteful emojis sparingly for clarity, never excessively.
- Never claim certainty where there is none — frame diagnostics as confidence-ranked estimates and recommend verification.

Format your answers in clean Markdown.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const skillLevel: string = body?.skillLevel || "intermediate";

    if (messages.length === 0) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    const zai = await ZAI.create();

    const skillLine = `\n\nThe current user skill level is: ${skillLevel}. Tailor depth, vocabulary and examples accordingly.`;

    const fullMessages = [
      { role: "assistant", content: SYSTEM_PROMPT + skillLine },
      ...messages
        .filter((m: { role?: string; content?: string }) => m?.role && m?.content != null)
        .slice(-16)
        .map((m: { role: string; content: string }) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: String(m.content),
        })),
    ];

    const completion = await zai.chat.completions.create({
      messages: fullMessages,
      thinking: { type: "disabled" },
    });

    const reply = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "MecaAI request failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
