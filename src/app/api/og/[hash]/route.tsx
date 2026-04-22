import { ImageResponse } from "@vercel/og";
import { decodeInput } from "@/lib/encoding";
import { generateReport } from "@/lib/reportGen";
import { loadRoles, loadSkills } from "@/lib/serverData";

export const runtime = "nodejs";
// 报告 hash 决定内容，可安全缓存。ISR-friendly。
export const revalidate = false;

// Noto Sans SC (Simplified Chinese) from Google Fonts 中国镜像。
// 如果 fetch 失败（国内/服务器偶发），渲染继续但中文会 tofu——
// 这是可接受的降级，因为生产部署前可以把字体文件 bundle 进 public/fonts/。
async function loadNotoSansSC(weight: 400 | 700): Promise<ArrayBuffer | null> {
  const cssUrl = `https://fonts.googleapis.cn/css2?family=Noto+Sans+SC:wght@${weight}&display=swap`;
  try {
    const cssRes = await fetch(cssUrl, {
      headers: {
        // UA 影响 Google Fonts 返回 woff2 vs ttf，模拟现代浏览器
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      // 字体文件本身是静态的，允许长期缓存
      cache: "force-cache",
    });
    if (!cssRes.ok) return null;
    const css = await cssRes.text();
    // CSS 里包含多个 @font-face unicode-range 分块，取第一个 woff2 URL
    // （覆盖基础 CJK 字符，足够 OG 图用）
    const match = css.match(/url\((https:\/\/[^)]+\.woff2)\)/);
    if (!match) return null;
    const fontRes = await fetch(match[1], { cache: "force-cache" });
    if (!fontRes.ok) return null;
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

const BRAND = "#2563EB"; // 冷蓝
const TEXT_DARK = "#0F172A";
const TEXT_MUTED = "#64748B";
const BG_SOFT = "#F1F5F9";

function fmtSalary(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(0)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ hash: string }> },
) {
  const { hash } = await ctx.params;

  try {
    const input = decodeInput(hash);
    const [roles, skills, fontRegular, fontBold] = await Promise.all([
      loadRoles(),
      loadSkills(),
      loadNotoSansSC(400),
      loadNotoSansSC(700),
    ]);
    const reportId = hash.slice(0, 8).toUpperCase();
    const report = generateReport(input, roles, skills, reportId);

    const top = report.cover.topRoles[0];
    const topRole = top?.roleName || "—";
    const topScore = top?.matchScore ?? 0;
    const { p25, p50, p75 } = report.salary;
    const hasSalary = p50 > 0;

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

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(135deg, #FFFFFF 0%, #EFF6FF 100%)",
            fontFamily: "Noto Sans SC, sans-serif",
            color: TEXT_DARK,
            padding: "56px 64px",
            position: "relative",
          }}
        >
          {/* 品牌 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 22,
              color: BRAND,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: BRAND,
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
            <span>AIJobFit · 非程序员 AI 求职定位诊断</span>
          </div>

          {/* Top 1 角色 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 48,
            }}
          >
            <div
              style={{
                fontSize: 22,
                color: TEXT_MUTED,
                marginBottom: 8,
                fontWeight: 400,
              }}
            >
              Top 1 角色匹配
            </div>
            <div
              style={{
                fontSize: 64,
                fontWeight: 700,
                lineHeight: 1.1,
                color: TEXT_DARK,
                maxWidth: 960,
              }}
            >
              {topRole}
            </div>
            <div
              style={{
                marginTop: 18,
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                  padding: "8px 18px",
                  background: BRAND,
                  color: "white",
                  borderRadius: 999,
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                <span>匹配度</span>
                <span style={{ fontSize: 32 }}>{topScore}</span>
                <span style={{ fontSize: 20 }}>%</span>
              </div>
            </div>
          </div>

          {/* 薪资区间卡 */}
          {hasSalary && (
            <div
              style={{
                display: "flex",
                marginTop: 48,
                padding: "24px 32px",
                background: BG_SOFT,
                borderRadius: 20,
                border: `1px solid #DBEAFE`,
                alignItems: "center",
                gap: 40,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  minWidth: 140,
                }}
              >
                <span style={{ fontSize: 18, color: TEXT_MUTED }}>月薪区间</span>
                <span
                  style={{
                    fontSize: 22,
                    color: TEXT_DARK,
                    fontWeight: 700,
                  }}
                >
                  P25 – P75
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 16,
                  fontWeight: 700,
                  color: TEXT_DARK,
                }}
              >
                <span style={{ fontSize: 24, color: TEXT_MUTED }}>
                  {fmtSalary(p25)}
                </span>
                <span style={{ fontSize: 44, color: BRAND }}>
                  {fmtSalary(p50)}
                </span>
                <span style={{ fontSize: 24, color: TEXT_MUTED }}>
                  {fmtSalary(p75)}
                </span>
              </div>
            </div>
          )}

          {/* 底栏：数据来源 */}
          <div
            style={{
              display: "flex",
              marginTop: "auto",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 18,
              color: TEXT_MUTED,
            }}
          >
            <span>数据来源：Agent Hunt · 2370+ 真实 JD</span>
            <span style={{ fontFamily: "monospace" }}>#{reportId}</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: fonts.length > 0 ? fonts : undefined,
      },
    );
  } catch (e) {
    console.error("OG generation failed:", e);
    // Fallback 静态 OG：报告解码失败时返回通用品牌图
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
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: BRAND,
              marginBottom: 16,
            }}
          >
            AIJobFit
          </div>
          <div style={{ fontSize: 28, color: TEXT_MUTED }}>
            AI Job Positioning · 9.9 RMB Diagnosis
          </div>
        </div>
      ),
      { width: 1200, height: 630 },
    );
  }
}
