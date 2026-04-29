import type { Metadata } from "next";
import { decodeInput } from "@/lib/encoding";
import ReportClient from "./ReportClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hash: string }>;
}): Promise<Metadata> {
  const { hash } = await params;
  try {
    const input = decodeInput(hash);
    const job = input.currentJob?.trim() || "你";
    const title = `${job}的 AI 求职定位报告 | AIJobFit`;
    const description =
      "基于 5000+ 真实 JD 数据的 AI 求职定位诊断，10 分钟，14 角色匹配，诚实推免费学习资源。";
    const ogUrl = `/api/og/${hash}`;
    const ogSquareUrl = `/api/og-square/${hash}`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `/result/${hash}`,
        type: "article",
        images: [
          { url: ogUrl, width: 1200, height: 630 },
          { url: ogSquareUrl, width: 800, height: 800 },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogUrl],
      },
    };
  } catch {
    return {
      title: "报告加载失败 | AIJobFit",
    };
  }
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const { hash } = await params;
  return <ReportClient hash={hash} />;
}
