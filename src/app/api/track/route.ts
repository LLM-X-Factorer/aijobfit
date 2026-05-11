import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { uuid, event_type, route, extra } = await req.json();
    if (!uuid || !event_type) return NextResponse.json({ ok: false }, { status: 400 });
    getDb()
      .prepare("INSERT INTO events (uuid, ts, event_type, route, extra) VALUES (?, ?, ?, ?, ?)")
      .run(uuid, Date.now(), event_type, route ?? null, extra ? JSON.stringify(extra) : null);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
