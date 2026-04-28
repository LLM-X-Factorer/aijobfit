"use client";

// 1080×1920 竖版分享海报。
// Canvas 在浏览器侧渲染，系统中文字体（PingFang / 思源黑体等）兜底，
// 不依赖外网字体加载，手机/PC 浏览器都能跑。
// QR 指向首页而非当前 hash，目的是引流生成自己的报告而不是围观这份报告。

import { useCallback, useState } from "react";
import QRCode from "qrcode";
import type { Report } from "@/lib/reportGen";

const POSTER_W = 1080;
const POSTER_H = 1920;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://aijobfit.llmxfactor.cloud";

const BRAND = "#2563EB";
const TEXT_DARK = "#0F172A";
const TEXT_MUTED = "#64748B";
const BG_SOFT = "#EFF6FF";
const BORDER = "#DBEAFE";

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function fmtSalary(n: number): string {
  if (n >= 1000) return `${Math.round(n / 1000)}K`;
  return String(n);
}

async function drawPoster(report: Report): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = POSTER_W;
  canvas.height = POSTER_H;
  const ctx = canvas.getContext("2d")!;

  // 背景：白底 + 顶部淡蓝过渡
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, POSTER_W, POSTER_H);
  const bgGrad = ctx.createLinearGradient(0, 0, 0, POSTER_H * 0.4);
  bgGrad.addColorStop(0, BG_SOFT);
  bgGrad.addColorStop(1, "#FFFFFF");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, POSTER_W, POSTER_H * 0.4);

  const PAD = 80;

  // ===== 头部品牌 =====
  const headerY = 100;
  ctx.fillStyle = BRAND;
  roundRect(ctx, PAD, headerY, 64, 64, 14);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 32px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("AI", PAD + 32, headerY + 34);

  ctx.fillStyle = BRAND;
  ctx.font = "700 36px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("AIJobFit", PAD + 80, headerY + 22);
  ctx.fillStyle = TEXT_MUTED;
  ctx.font = "400 24px system-ui, -apple-system, sans-serif";
  ctx.fillText("非程序员 AI 求职定位诊断", PAD + 80, headerY + 54);

  // ===== 用户身份 =====
  const { cover, salary, roles } = report;
  let y = 260;

  ctx.fillStyle = TEXT_MUTED;
  ctx.font = "400 26px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("我的 AI 求职定位报告", PAD, y);

  y += 50;
  const ident = [
    cover.currentJob || "—",
    cover.yearsExp || "—",
    cover.education || "",
    cover.city || "",
  ]
    .filter(Boolean)
    .join(" · ");
  ctx.fillStyle = TEXT_DARK;
  ctx.font = "700 44px system-ui, -apple-system, sans-serif";
  ctx.fillText(ident, PAD, y);

  // ===== Top 1 角色大卡 =====
  y += 60;
  const cardH = 300;
  ctx.fillStyle = BRAND;
  roundRect(ctx, PAD, y, POSTER_W - PAD * 2, cardH, 32);
  ctx.fill();

  const top = cover.topRoles[0];
  const topRoleName = top?.roleName || "—";
  const topScore = top?.matchScore ?? 0;
  const isRouteB = cover.route === "B";
  const cardLabel = isRouteB ? "锁定目标 · 匹配度" : "Top 1 角色匹配";
  const displayRoleName =
    isRouteB && cover.lockedTarget?.industry
      ? `${cover.lockedTarget.industry} · ${topRoleName}`
      : topRoleName;

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "400 26px system-ui, -apple-system, sans-serif";
  ctx.fillText(cardLabel, PAD + 40, y + 60);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 72px system-ui, -apple-system, sans-serif";
  ctx.fillText(displayRoleName, PAD + 40, y + 150);

  // 匹配度 pill
  ctx.font = "700 40px system-ui, -apple-system, sans-serif";
  const scoreText = `${topScore}%`;
  const pillLabel = "匹配度";
  ctx.font = "400 26px system-ui, -apple-system, sans-serif";
  const labelW = ctx.measureText(pillLabel).width;
  ctx.font = "700 40px system-ui, -apple-system, sans-serif";
  const scoreW = ctx.measureText(scoreText).width;
  const pillW = labelW + scoreW + 80;
  const pillH = 64;
  const pillX = PAD + 40;
  const pillY = y + 200;
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  roundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "400 26px system-ui, -apple-system, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(pillLabel, pillX + 30, pillY + pillH / 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 40px system-ui, -apple-system, sans-serif";
  ctx.fillText(scoreText, pillX + 30 + labelW + 20, pillY + pillH / 2);

  ctx.textBaseline = "alphabetic";

  // ===== 薪资区间 =====
  y += cardH + 60;
  ctx.fillStyle = TEXT_MUTED;
  ctx.font = "400 26px system-ui, -apple-system, sans-serif";
  ctx.fillText(
    `月薪区间（基于 ${roles.totalJDs}+ 条 JD）`,
    PAD,
    y,
  );

  y += 50;
  if (salary.p50 > 0) {
    const boxH = 120;
    ctx.fillStyle = BG_SOFT;
    roundRect(ctx, PAD, y, POSTER_W - PAD * 2, boxH, 24);
    ctx.fill();
    ctx.strokeStyle = BORDER;
    ctx.lineWidth = 2;
    ctx.stroke();

    const centerY = y + boxH / 2;
    const colW = (POSTER_W - PAD * 2) / 3;
    const cols = [
      { label: "P25", value: fmtSalary(salary.p25), color: TEXT_MUTED },
      {
        label: "P50 中位",
        value: fmtSalary(salary.p50),
        color: BRAND,
      },
      { label: "P75", value: fmtSalary(salary.p75), color: TEXT_MUTED },
    ];
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    cols.forEach((c, i) => {
      const cx = PAD + colW * i + colW / 2;
      ctx.fillStyle = TEXT_MUTED;
      ctx.font = "400 22px system-ui, -apple-system, sans-serif";
      ctx.fillText(c.label, cx, centerY - 26);
      ctx.fillStyle = c.color;
      ctx.font = "700 48px system-ui, -apple-system, sans-serif";
      ctx.fillText(c.value, cx, centerY + 22);
    });
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  } else {
    ctx.fillStyle = TEXT_MUTED;
    ctx.font = "400 28px system-ui, -apple-system, sans-serif";
    ctx.fillText("暂无足够数据", PAD, y + 40);
  }

  // ===== 4 主线匹配条（路线 A）/ 单角色已展示在大卡（路线 B 时跳过本节）=====
  y += 160;
  if (!isRouteB && cover.trackScores.length > 0) {
    ctx.fillStyle = TEXT_MUTED;
    ctx.font = "400 26px system-ui, -apple-system, sans-serif";
    ctx.fillText("4 主线匹配度", PAD, y);
    y += 36;

    const barAreaW = POSTER_W - PAD * 2;
    const rowH = 64;
    const barH = 14;
    const sortedTracks = [...cover.trackScores].sort(
      (a, b) => b.score - a.score,
    );
    sortedTracks.forEach((t, i) => {
      const rowY = y + i * rowH;
      ctx.fillStyle = TEXT_DARK;
      ctx.font = "500 26px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`${t.track.id} · ${t.track.name}`, PAD, rowY + 10);

      ctx.fillStyle = TEXT_MUTED;
      ctx.font = "500 24px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`${Math.round(t.score)}%`, POSTER_W - PAD, rowY + 10);

      // bar track
      const barY = rowY + 24;
      ctx.fillStyle = "#E2E8F0";
      roundRect(ctx, PAD, barY, barAreaW, barH, barH / 2);
      ctx.fill();
      // bar fill
      const fillW = Math.max(0, Math.min(1, t.score / 100)) * barAreaW;
      if (fillW > 0) {
        ctx.fillStyle = BRAND;
        roundRect(ctx, PAD, barY, fillW, barH, barH / 2);
        ctx.fill();
      }
    });
    ctx.textAlign = "left";

    y += sortedTracks.length * rowH + 20;
  }

  // ===== 分割线 =====
  y += 20;
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(POSTER_W - PAD, y);
  ctx.stroke();

  // ===== QR + CTA =====
  y += 60;
  const qrSize = 260;
  const qrX = (POSTER_W - qrSize) / 2;
  try {
    const qrDataUrl = await QRCode.toDataURL(SITE_URL, {
      width: qrSize * 2,
      margin: 1,
      color: { dark: TEXT_DARK, light: "#FFFFFF" },
      errorCorrectionLevel: "M",
    });
    const qrImg = await loadImage(qrDataUrl);
    if (qrImg) {
      ctx.drawImage(qrImg, qrX, y, qrSize, qrSize);
    }
  } catch {
    /* QR 失败就不画，下方 CTA 和 URL 仍然可用 */
  }

  const ctaY = y + qrSize + 50;
  ctx.fillStyle = TEXT_DARK;
  ctx.font = "700 36px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("扫码生成你的 AI 求职定位", POSTER_W / 2, ctaY);

  ctx.fillStyle = TEXT_MUTED;
  ctx.font = "400 24px system-ui, -apple-system, sans-serif";
  ctx.fillText(
    "2370+ 条真实 JD · 14 角色聚类 · 10 分钟出报告",
    POSTER_W / 2,
    ctaY + 40,
  );

  // ===== Footer =====
  ctx.fillStyle = TEXT_MUTED;
  ctx.font = "400 22px ui-monospace, SFMono-Regular, Consolas, monospace";
  ctx.fillText("aijobfit.llmxfactor.cloud", POSTER_W / 2, POSTER_H - 80);
  ctx.fillStyle = "#94A3B8";
  ctx.font = "400 20px system-ui, -apple-system, sans-serif";
  ctx.fillText(
    `报告 ID #${report.meta.reportId} · 数据来源 Agent Hunt`,
    POSTER_W / 2,
    POSTER_H - 48,
  );

  return canvas.toDataURL("image/png", 1);
}

export default function SharePoster({ report }: { report: Report }) {
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const dataUrl = await drawPoster(report);
      setPosterUrl(dataUrl);
    } catch (err) {
      console.error("Poster generation failed:", err);
    } finally {
      setLoading(false);
    }
  }, [report, loading]);

  const handleDownload = useCallback(() => {
    if (!posterUrl) return;
    const a = document.createElement("a");
    a.href = posterUrl;
    a.download = `AIJobFit_${report.meta.reportId}.png`;
    a.click();
  }, [posterUrl, report.meta.reportId]);

  return (
    <>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="text-xs bg-white hover:bg-blue-50 active:bg-blue-100 text-blue-600 border border-blue-200 font-medium px-3 py-2 rounded-full disabled:opacity-50"
      >
        {loading ? "生成中..." : "保存分享图"}
      </button>

      {posterUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4"
          onClick={() => setPosterUrl(null)}
        >
          <p className="text-xs text-white/60 mb-3">
            长按图片保存 · 或点击下方按钮下载
          </p>
          <img
            src={posterUrl}
            alt="AIJobFit 分享海报"
            className="max-h-[75vh] w-auto rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              className="px-6 py-2.5 rounded-full bg-white text-slate-900 font-bold text-sm"
            >
              下载图片
            </button>
            <button
              type="button"
              onClick={() => setPosterUrl(null)}
              className="px-6 py-2.5 rounded-full border border-white/30 text-white/70 text-sm"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </>
  );
}
