import type { Metadata } from "next";
import Link from "next/link";
import {
  QUADRANTS,
  classifyQuadrant,
  decodeAnswers,
} from "@/lib/positioner";
import PositionerReport from "./PositionerReport";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://aijobfit.llmxfactor.cloud";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hash: string }>;
}): Promise<Metadata> {
  const { hash } = await params;
  try {
    const input = decodeAnswers(hash);
    const quadrantId = classifyQuadrant(input);
    const q = QUADRANTS[quadrantId];
    const title = `${q.name} | AI 工程师位置诊断`;
    const description =
      "已经在写代码、想往 AI 工程师方向走？4 道题看清你当下在 AI 时代的位置——不是再学一门技术，而是看你站在哪里。";
    const ogUrl = `/api/og/positioner/${hash}`;
    return {
      title,
      description,
      alternates: { canonical: `/positioner/result/${hash}` },
      openGraph: {
        title,
        description,
        url: `${SITE_URL}/positioner/result/${hash}`,
        type: "article",
        images: [{ url: ogUrl, width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogUrl],
      },
    };
  } catch {
    return { title: "报告代码无效 | AIJobFit" };
  }
}

function safeDecode(hash: string) {
  try {
    const input = decodeAnswers(hash);
    return { input, quadrantId: classifyQuadrant(input) };
  } catch {
    return null;
  }
}

export default async function PositionerResultPage({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const { hash } = await params;
  const decoded = safeDecode(hash);
  if (!decoded) {
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            报告代码无效
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            位置诊断的代码是 4 位数字（每位 0/1/2），请重新测一次。
          </p>
          <Link
            href="/positioner"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-full"
          >
            重新测试
          </Link>
        </div>
      </main>
    );
  }
  return (
    <PositionerReport
      code={hash}
      input={decoded.input}
      quadrantId={decoded.quadrantId}
    />
  );
}
