import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get("vehicleId");
    const records = await db.maintenanceRecord.findMany({
      where: vehicleId ? { vehicleId } : undefined,
      include: { vehicle: true },
      orderBy: { date: "desc" },
    });
    return NextResponse.json({ records });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch maintenance records";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const record = await db.maintenanceRecord.create({
      data: {
        vehicleId: body.vehicleId,
        title: body.title,
        description: body.description ?? null,
        date: body.date ? new Date(body.date) : new Date(),
        mileage: body.mileage ? Number(body.mileage) : null,
        cost: body.cost ? Number(body.cost) : null,
        technician: body.technician ?? null,
        status: body.status ?? "completed",
      },
    });
    return NextResponse.json({ record });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create maintenance record";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
