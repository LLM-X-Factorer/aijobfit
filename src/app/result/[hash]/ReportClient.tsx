"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { decodeInput } from "@/lib/encoding";
import { fetchRoles, fetchSkills } from "@/lib/fetchAgentHunt";
import { generateReport, Report } from "@/lib/reportGen";
import { track } from "@/lib/track";
import { isWeChat } from "@/lib/useragent";
import ReportCover from "@/components/ReportCover";
import ReportRoles from "@/components/ReportRoles";
import ReportSalary from "@/components/ReportSalary";
import ReportGap from "@/components/ReportGap";
import ReportPaths from "@/components/ReportPaths";
import ReportActions from "@/components/ReportActions";
import ReportFallbackNotice from "@/components/ReportFallbackNotice";
import SharePoster from "@/components/SharePoster";
import LockedSections from "@/components/LockedSections";

type CopyState = "idle" | "copied" | "wechat-hint" | "failed";

export default function ReportClient({ hash }: { hash: string }) {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<CopyState>("idle");

  useEffect(() => {
    async function load() {
      try {
        const input = decodeInput(hash);
        const [roles, skills] = await Promise.all([fetchRoles(), fetchSkills()]);
        const reportId = hash.slice(0, 8).toUpperCase();
        const r = generateReport(input, roles, skills, reportId);
        setReport(r);
        track("report_view", {
          report_id: reportId,
          top_role: r.cover.topRoles[0]?.roleName,
          top_score: r.cover.topRoles[0]?.matchScore,
        });
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : "报告加载失败");
      }
    }
    load();
  }, [hash]);

  async function copyUrl() {
    if (typeof window === "undefined") return;
    const url = window.location.href;

    if (isWeChat()) {
      setCopyState("wechat-hint");
      setTimeout(() => setCopyState("idle"), 3500);
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
      return;
    } catch {
      // clipboard 不可用（iOS 低版本 / 权限问题），退到 execCommand
    }

    try {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("failed");
      setTimeout(() => setCopyState("idle"), 3000);
    }
  }

  const copyLabel: Record<CopyState, string> = {
    idle: "复制链接",
    copied: "✓ 已复制",
    "wechat-hint": "点右上角 · 复制链接",
    failed: "复制失败",
  };

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">报告链接无效</h1>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <Link
            href="/diagnose"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-full"
          >
            重新诊断
          </Link>
        </div>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
          <p className="text-sm text-slate-500">正在生成你的报告...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-grid">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-sm text-slate-500 hover:text-blue-600">
            ← AIJobFit
          </Link>
          <div className="flex items-center gap-2">
            <SharePoster report={report} />
            <button
              type="button"
              onClick={copyUrl}
              className="text-xs bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium px-3 py-2 rounded-full whitespace-nowrap"
            >
              {copyLabel[copyState]}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 fade-up">
        {report.meta.isFallback && (
          <ReportFallbackNotice track={report.meta.fallbackTrack} />
        )}
        <ReportCover data={report.cover} />
        <ReportRoles data={report.roles} />
        <ReportSalary data={report.salary} />
        <LockedSections>
          <ReportGap data={report.gap} />
          <ReportPaths data={report.paths} />
          <ReportActions actions={report.actions} meta={report.meta} />
        </LockedSections>
        {report.meta.route === "A" && (
          <section className="bg-blue-50 border border-blue-200 rounded-2xl p-5 sm:p-8 text-center">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
              这 3 个推荐都不是你想要的？
            </h3>
            <p className="text-sm text-slate-600 mb-5 max-w-xl mx-auto leading-relaxed">
              换个方式：你自己锁定行业 + 岗位，我们围绕你的目标算匹配率 + Gap，不再给推荐。已填字段会自动带过去，不用重填。
            </p>
            <Link
              href={`/diagnose-target?from=${encodeURIComponent(hash)}`}
              onClick={() =>
                track("report_reject_top3_click", { report_id: report.meta.reportId })
              }
              className="inline-block bg-white border-2 border-blue-600 text-blue-700 hover:bg-blue-50 active:bg-blue-100 font-bold px-6 py-3 rounded-full transition-all"
            >
              切到目标 Gap 诊断 →
            </Link>
          </section>
        )}
      </div>

      <footer className="border-t border-slate-200 px-4 py-6 text-center text-xs text-slate-500 bg-white">
        <p>
          数据来自{" "}
          <a
            href="https://github.com/LLM-X-Factorer/agent-hunt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Agent Hunt
          </a>
          {" · "}
          报告 ID #{report.meta.reportId}
        </p>
      </footer>
    </main>
  );
}
