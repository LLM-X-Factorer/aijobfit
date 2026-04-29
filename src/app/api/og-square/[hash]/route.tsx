import { ImageResponse } from "@vercel/og";
import { decodeInput } from "@/lib/encoding";
import { generateReport } from "@/lib/reportGen";
import {
  loadRoles,
  loadSkills,
  loadIndustryAugmentedSalary,
  loadNarrativeStats,
  loadRolesByCity,
} from "@/lib/serverData";
import { loadNotoSansSC } from "@/lib/ogFont";

// 800×800 方形 OG，供微信聊天卡片使用（微信偏好正方形图）。
// 内容精简：品牌 + Top 1 角色 + 匹配度 + 薪资中位。

export const runtime = "nodejs";
export const revalidate = false;

const BRAND = "#2563EB";
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
    const [roles, skills, industrySalary, rolesByCity, narrativeStats, fontRegular, fontBold] =
      await Promise.all([
        loadRoles(),
        loadSkills(),
        loadIndustryAugmentedSalary(),
        loadRolesByCity(),
        loadNarrativeStats(),
        loadNotoSansSC(400),
        loadNotoSansSC(700),
      ]);
    const reportId = hash.slice(0, 8).toUpperCase();
    const report = generateReport(
      input,
      roles,
      skills,
      reportId,
      industrySalary,
      rolesByCity,
      narrativeStats,
    );

    const top = report.cover.topRoles[0];
    const isRouteB = report.cover.route === "B";
    const topRole =
      isRouteB && report.cover.lockedTarget?.industry
        ? `${report.cover.lockedTarget.industry} · ${top?.roleName || "—"}`
        : top?.roleName || "—";
    const topScore = top?.matchScore ?? 0;
    const labelText = isRouteB ? "你的目标岗位" : "你最匹配的 AI 角色";
    const { p50 } = report.salary;
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
            background: "linear-gradient(160deg, #FFFFFF 0%, #EFF6FF 100%)",
            fontFamily: "Noto Sans SC, sans-serif",
            color: TEXT_DARK,
            padding: 56,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 22,
              color: BRAND,
              fontWeight: 700,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
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
            <span>AIJobFit</span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 56,
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: 22,
                color: TEXT_MUTED,
                marginBottom: 8,
              }}
            >
              {labelText}
            </div>
            <div
              style={{
                fontSize: 52,
                fontWeight: 700,
                lineHeight: 1.15,
                color: TEXT_DARK,
              }}
            >
              {topRole}
            </div>

            <div
              style={{
                marginTop: 28,
                display: "flex",
                alignItems: "baseline",
                gap: 14,
                padding: "14px 24px",
                background: BRAND,
                color: "white",
                borderRadius: 999,
                fontWeight: 700,
                alignSelf: "flex-start",
              }}
            >
              <span style={{ fontSize: 22 }}>匹配度</span>
              <span style={{ fontSize: 44 }}>{topScore}</span>
              <span style={{ fontSize: 24 }}>%</span>
            </div>

            {hasSalary && (
              <div
                style={{
                  marginTop: 40,
                  padding: "20px 28px",
                  background: BG_SOFT,
                  borderRadius: 20,
                  border: `1px solid #DBEAFE`,
                  display: "flex",
                  alignItems: "baseline",
                  gap: 14,
                }}
              >
                <span style={{ fontSize: 20, color: TEXT_MUTED }}>
                  月薪中位
                </span>
                <span
                  style={{ fontSize: 40, color: BRAND, fontWeight: 700 }}
                >
                  {fmtSalary(p50)}
                </span>
                <span style={{ fontSize: 18, color: TEXT_MUTED }}>
                  / 月
                </span>
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 16,
              color: TEXT_MUTED,
            }}
          >
            <span>Agent Hunt · {report.meta.jdTotal.toLocaleString()}+ 真实 JD</span>
            <span style={{ fontFamily: "monospace" }}>#{reportId}</span>
          </div>
        </div>
      ),
      {
        width: 800,
        height: 800,
        fonts: fonts.length > 0 ? fonts : undefined,
      },
    );
  } catch (e) {
    console.error("Square OG generation failed:", e);
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
              fontSize: 64,
              fontWeight: 700,
              color: BRAND,
              marginBottom: 12,
            }}
          >
            AIJobFit
          </div>
          <div style={{ fontSize: 24, color: TEXT_MUTED }}>
            AI Career Diagnosis
          </div>
        </div>
      ),
      { width: 800, height: 800 },
    );
  }
}
