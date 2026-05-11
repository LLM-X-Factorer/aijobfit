import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// 简单 token 保护。生产环境通过 DATA_ADMIN_TOKEN 环境变量设置。
const ADMIN_TOKEN = process.env.DATA_ADMIN_TOKEN ?? "aijobfit-admin-2026";

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const token = searchParams.get("token");
  if (token !== ADMIN_TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const table = searchParams.get("table") ?? "submissions"; // submissions | events
  const fmt = searchParams.get("fmt") ?? "csv";             // csv | json
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10000", 10), 50000);
  const since = searchParams.get("since");                  // unix ms，可选

  if (!["submissions", "events"].includes(table)) {
    return NextResponse.json({ error: "invalid table" }, { status: 400 });
  }

  const db = getDb();
  const whereClause = since ? `WHERE ts >= ${parseInt(since, 10)}` : "";
  const rows = db
    .prepare(`SELECT * FROM ${table} ${whereClause} ORDER BY ts DESC LIMIT ?`)
    .all(limit) as Record<string, unknown>[];

  if (fmt === "json") {
    return NextResponse.json({ table, count: rows.length, rows });
  }

  const csv = toCSV(rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${table}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
