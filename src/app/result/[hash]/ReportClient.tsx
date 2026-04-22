"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { decodeInput } from "@/lib/encoding";
import { fetchRoles, fetchSkills } from "@/lib/fetchAgentHunt";
import { generateReport, Report } from "@/lib/reportGen";
import ReportCover from "@/components/ReportCover";
import ReportRoles from "@/components/ReportRoles";
import ReportSalary from "@/components/ReportSalary";
import ReportGap from "@/components/ReportGap";
import ReportPaths from "@/components/ReportPaths";
import ReportActions from "@/components/ReportActions";
import SharePoster from "@/components/SharePoster";

export default function ReportClient({ hash }: { hash: string }) {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const input = decodeInput(hash);
        const [roles, skills] = await Promise.all([fetchRoles(), fetchSkills()]);
        const reportId = hash.slice(0, 8).toUpperCase();
        const r = generateReport(input, roles, skills, reportId);
        setReport(r);
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : "报告加载失败");
      }
    }
    load();
  }, [hash]);

  function copyUrl() {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

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
            <button
              type="button"
              disabled
              className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full cursor-not-allowed"
              title="Phase 2 后续实现"
            >
              下载 PDF（Coming Soon）
            </button>
            <SharePoster report={report} />
            <button
              type="button"
              onClick={copyUrl}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-full"
            >
              {copied ? "✓ 已复制" : "复制链接"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 fade-up">
        <ReportCover data={report.cover} />
        <ReportRoles data={report.roles} />
        <ReportSalary data={report.salary} />
        <ReportGap data={report.gap} />
        <ReportPaths data={report.paths} />
        <ReportActions actions={report.actions} meta={report.meta} />
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
