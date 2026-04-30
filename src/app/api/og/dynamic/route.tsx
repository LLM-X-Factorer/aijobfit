import { ImageResponse } from "@vercel/og";
import { loadNotoSansSC } from "@/lib/ogFont";

export const runtime = "nodejs";
export const revalidate = false;

const BRAND = "#2563EB";
const EMERALD = "#059669";
const TEXT_DARK = "#0F172A";
const TEXT_MUTED = "#64748B";

// query schema:
// title=     主标题（必填）
// subtitle=  副标题
// tag=       上方小标签（默认 "AI 求职定位诊断"）
// stat1=     数据锚点 1
// stat2=     数据锚点 2
// stat3=     数据锚点 3
// theme=blue|emerald  默认 blue
// size=wide|square    wide=1200x630（默认）/ square=800x800（微信方形）
export async function GET(req: Request) {
  const url = new URL(req.url);
  const p = url.searchParams;
  const title = (p.get("title") || "AIJobFit").slice(0, 80);
  const subtitle = (p.get("subtitle") || "").slice(0, 120);
  const tag = (p.get("tag") || "AI 求职定位诊断").slice(0, 40);
  const stat1 = (p.get("stat1") || "").slice(0, 30);
  const stat2 = (p.get("stat2") || "").slice(0, 30);
  const stat3 = (p.get("stat3") || "").slice(0, 30);
  const theme = p.get("theme") === "emerald" ? "emerald" : "blue";
  const size = p.get("size") === "square" ? "square" : "wide";

  const w = size === "square" ? 800 : 1200;
  const h = size === "square" ? 800 : 630;
  const accent = theme === "emerald" ? EMERALD : BRAND;
  const accentBg = theme === "emerald" ? "#ECFDF5" : "#EFF6FF";
  const isSquare = size === "square";

  const [bold, regular] = await Promise.all([
    loadNotoSansSC(700),
    loadNotoSansSC(400),
  ]);
  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" }[] = [];
  if (regular) fonts.push({ name: "Noto Sans SC", data: regular, weight: 400, style: "normal" });
  if (bold) fonts.push({ name: "Noto Sans SC", data: bold, weight: 700, style: "normal" });

  const stats = [stat1, stat2, stat3].filter((s) => s.length > 0);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(135deg, #FFFFFF 0%, ${accentBg} 100%)`,
          color: TEXT_DARK,
          padding: isSquare ? "60px 56px" : "64px 64px",
          fontFamily: "Noto Sans SC, sans-serif",
        }}
      >
        {/* Header · logo + tag */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: isSquare ? 24 : 26,
              color: accent,
              fontWeight: 700,
            }}
          >
            <div
              style={{
                width: isSquare ? 40 : 44,
                height: isSquare ? 40 : 44,
                borderRadius: 10,
                background: accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: isSquare ? 20 : 22,
                fontWeight: 700,
              }}
            >
              AI
            </div>
            AIJobFit
          </div>
          <div
            style={{
              display: "flex",
              fontSize: isSquare ? 16 : 18,
              color: accent,
              background: "white",
              border: `1px solid ${accent}`,
              padding: "6px 14px",
              borderRadius: 999,
              fontWeight: 700,
            }}
          >
            {tag}
          </div>
        </div>

        {/* Title block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: isSquare ? 40 : 56,
            gap: 14,
            flex: 1,
            justifyContent: isSquare ? "center" : "flex-start",
          }}
        >
          <div
            style={{
              fontSize: isSquare ? 56 : 68,
              fontWeight: 700,
              lineHeight: 1.18,
              color: TEXT_DARK,
              maxWidth: isSquare ? 700 : 1080,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: isSquare ? 24 : 28,
                color: TEXT_MUTED,
                lineHeight: 1.5,
                maxWidth: isSquare ? 700 : 1080,
                fontWeight: 400,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* Stats row */}
        {stats.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: isSquare ? 12 : 16,
              marginTop: isSquare ? 28 : 40,
              flexDirection: isSquare ? "column" : "row",
            }}
          >
            {stats.map((s, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: "flex",
                  background: "white",
                  border: `1px solid ${accent}30`,
                  borderRadius: 16,
                  padding: isSquare ? "14px 18px" : "18px 22px",
                  fontSize: isSquare ? 20 : 24,
                  color: accent,
                  fontWeight: 700,
                }}
              >
                {s}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            marginTop: isSquare ? 30 : 36,
            justifyContent: "space-between",
            fontSize: isSquare ? 16 : 20,
            color: TEXT_MUTED,
          }}
        >
          <span>aijobfit.llmxfactor.cloud</span>
          <span>8238 条真实 JD · Agent Hunt</span>
        </div>
      </div>
    ),
    { width: w, height: h, fonts: fonts.length > 0 ? fonts : undefined },
  );
}
