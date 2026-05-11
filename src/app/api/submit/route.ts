import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { audienceTypeFromYears } from "@/lib/audience";

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    if (!b.uuid) return NextResponse.json({ ok: false }, { status: 400 });
    const audience = b.years_exp ? audienceTypeFromYears(b.years_exp) : null;
    getDb()
      .prepare(`
        INSERT INTO submissions
          (uuid, ts, route, audience, skills, years_exp, education, city, industry,
           target_track, target_role_id, origin_profession, skills_count, report_hash, duration_ms)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        b.uuid,
        Date.now(),
        b.route ?? "A",
        audience,
        JSON.stringify(b.skills ?? []),
        b.years_exp ?? null,
        b.education ?? null,
        b.city ?? null,
        b.industry ?? null,
        JSON.stringify(b.target_track ?? []),
        b.target_role_id ?? null,
        b.origin_profession ?? null,
        (b.skills ?? []).length,
        b.report_hash ?? null,
        b.duration_ms ?? null,
      );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
