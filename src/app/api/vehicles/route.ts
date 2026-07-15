import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const vehicles = await db.vehicle.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ vehicles });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch vehicles";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const vehicle = await db.vehicle.create({
      data: {
        nickname: body.nickname,
        manufacturer: body.manufacturer,
        model: body.model,
        year: Number(body.year) || new Date().getFullYear(),
        engineType: body.engineType,
        displacement: body.displacement ?? null,
        fuelSystem: body.fuelSystem ?? null,
        vin: body.vin ?? null,
        photoUrl: body.photoUrl ?? null,
        notes: body.notes ?? null,
      },
    });
    return NextResponse.json({ vehicle });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create vehicle";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
