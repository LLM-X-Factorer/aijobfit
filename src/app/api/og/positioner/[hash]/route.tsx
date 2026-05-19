import { ImageResponse } from "@vercel/og";
import {
  QUADRANTS,
  classifyQuadrant,
  decodeAnswers,
  scoreAnswers,
} from "@/lib/positioner";
import { loadNotoSansSC } from "@/lib/ogFont";

export const runtime = "nodejs";
export const revalidate = false;

const BRAND = "#2563EB";
const AMBER = "#D97706";
const TEXT_DARK = "#0F172A";
const TEXT_MUTED = "#64748B";
const BG_BLUE = "#DBEAFE";
const BG_AMBER = "#FEF3C7";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ hash: string }> },
) {
  const { hash } = await ctx.params;

  const [fontRegular, fontBold] = await Promise.all([
    loadNotoSansSC(400),
    loadNotoSansSC(700),
  ]);
  const fonts = [
    fontRegular && {
      name: "Noto Sans SC",
      data: fontRegular,
      weight: 400 as const,
      style: "normal" as const,
    },
    fontBold && {
      name: "Noto Sans SC",
      data: fontBold,
      weight: 700 as const,
      style: "normal" as const,
    },
  ].filter(Boolean) as {
    name: string;
    data: ArrayBuffer;
    weight: 400 | 700;
    style: "normal";
  }[];

  try {
    const input = decodeAnswers(hash);
    const quadrantId = classifyQuadrant(input);
    const q = QUADRANTS[quadrantId];
    const { positive, uncertain } = scoreAnswers(input);
    const isQ4 = quadrantId === "Q4";
    const accent = isQ4 ? AMBER : BRAND;
    const chipBg = isQ4 ? BG_AMBER : BG_BLUE;

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 100%)",
            fontFamily: "Noto Sans SC, sans-serif",
            color: TEXT_DARK,
            padding: "64px 72px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 22,
              color: accent,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              AI
            </div>
            <span>AIJobFit · AI 工程师位置诊断</span>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 48,
              padding: "8px 20px",
              background: chipBg,
              color: accent,
              borderRadius: 999,
              fontSize: 22,
              fontWeight: 700,
              alignSelf: "flex-start",
            }}
          >
            {quadrantId} · {q.tagline}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.15,
              color: TEXT_DARK,
              maxWidth: 1000,
              marginTop: 32,
            }}
          >
            {q.name}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: TEXT_MUTED,
              marginTop: 24,
              lineHeight: 1.5,
              maxWidth: 1000,
            }}
          >
            正向 {positive} / 4 · 不确定 {uncertain} / 4 · 4 题、1 分钟、看清你站在哪里
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "auto",
              justifyContent: "space-between",
              fontSize: 20,
              color: TEXT_MUTED,
            }}
          >
            <span>aijobfit.llmxfactor.cloud/positioner</span>
            <span style={{ fontFamily: "monospace" }}>#{hash}</span>
          </div>
        </div>
      ),
      { width: 1200, height: 630, fonts: fonts.length > 0 ? fonts : undefined },
    );
  } catch {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #FFFFFF 0%, #EFF6FF 100%)",
            color: TEXT_DARK,
            fontFamily: "Noto Sans SC, sans-serif",
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: BRAND,
              marginBottom: 16,
            }}
          >
            AI 工程师位置诊断
          </div>
          <div style={{ fontSize: 24, color: TEXT_MUTED }}>
            4 题 · 1 分钟 · 看清你站在哪里
          </div>
        </div>
      ),
      { width: 1200, height: 630, fonts: fonts.length > 0 ? fonts : undefined },
    );
  }
}
