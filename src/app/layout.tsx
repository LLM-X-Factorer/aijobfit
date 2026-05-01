import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://aijobfit.llmxfactor.cloud";

const SITE_DESC =
  "AIJobFit 用 8238 条国内真实招聘 JD + 14 角色聚类 + 420 长尾原职业，10 分钟告诉非程序员（运营 / HR / 设计 / 教师 / 电气 / 财务 / 销售）适合做哪个 AI 岗位、缺什么技能、怎么补、薪资多少。三路线诊断：转行 Gap / 留行 + AI 增强 / 系统 Top 3 推荐。永久免费，不卖课。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AIJobFit · 非程序员 AI 求职定位诊断（基于 8238 条真实 JD）",
    template: "%s · AIJobFit",
  },
  description: SITE_DESC,
  keywords: [
    "AI 求职",
    "非程序员转 AI",
    "AI 产品经理",
    "AI 运营",
    "AIGC 求职",
    "AI 转型咨询",
    "AI 岗位薪资",
    "电气工程师转 AI",
    "教师转 AI",
    "应届生 AI 岗位",
    "AI 求职指导",
    "AI 招聘数据",
    "JD 数据分析",
    "留行加 AI",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "AIJobFit · 非程序员 AI 求职定位诊断",
    description:
      "8238 条真实 JD · 14 角色聚类 · 三路线诊断 · 永久免费。10 分钟出报告，告诉你适合哪个 AI 岗位、缺什么、薪资多少。",
    type: "website",
    url: "/",
    siteName: "AIJobFit",
    locale: "zh_CN",
    images: [
      { url: "/api/og", width: 1200, height: 630 },
      { url: "/api/og-square", width: 800, height: 800 },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AIJobFit · 非程序员 AI 求职定位诊断",
    description: "8238 条真实 JD · 三路线诊断 · 永久免费 · 不卖课。",
    images: ["/api/og"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  verification: {
    google: "kG_l-CFbXe_EQ1pGcaz3fe2ZPqOMzivuzSIptBKyLT8",
  },
};

const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AIJobFit",
  alternateName: "AI 求职定位诊断",
  url: SITE_URL,
  logo: `${SITE_URL}/qr-assistant.png`,
  description: SITE_DESC,
  sameAs: [
    "https://github.com/LLM-X-Factorer/agent-hunt",
    "https://github.com/LLM-X-Factorer",
  ],
  knowsAbout: [
    "AI 求职",
    "非程序员转 AI",
    "AI 产品经理",
    "AIGC",
    "AI 招聘市场",
    "AI 岗位技能要求",
  ],
};

const WEBSITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "AIJobFit",
  url: SITE_URL,
  description: SITE_DESC,
  inLanguage: "zh-CN",
  publisher: { "@type": "Organization", name: "AIJobFit", url: SITE_URL },
};

const DATASET_LD = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "AIJobFit · 中国 AI 岗位真实招聘 JD 数据集",
  description:
    "国内 AI 相关岗位真实招聘 JD 聚类数据：8238 条 JD（5673 已聚类）· 14 角色 · 12 行业 × AI 增强薪资 · 5 城市 tier × 14 角色薪资 · 420 长尾原职业 × AI 增强映射 · 应届生切片。每周更新。",
  url: SITE_URL,
  license: "https://github.com/LLM-X-Factorer/agent-hunt/blob/main/LICENSE",
  creator: { "@type": "Organization", name: "Agent Hunt", url: "https://github.com/LLM-X-Factorer/agent-hunt" },
  spatialCoverage: "China",
  temporalCoverage: "2025-10/..",
  variableMeasured: [
    "Job vacancy count",
    "Salary P25/P50/P75",
    "Required & preferred skills",
    "Education distribution",
    "Industry breakdown",
    "City tier distribution",
    "Augmentation skills (AI tools used in non-programmer roles)",
  ],
  distribution: [
    {
      "@type": "DataDownload",
      encodingFormat: "application/json",
      contentUrl: "https://agent-hunt.pages.dev/data/roles-domestic.json",
    },
    {
      "@type": "DataDownload",
      encodingFormat: "application/json",
      contentUrl: "https://agent-hunt.pages.dev/data/industry-augmented-salary.json",
    },
    {
      "@type": "DataDownload",
      encodingFormat: "application/json",
      contentUrl: "https://agent-hunt.pages.dev/data/roles-by-city.json",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <link
          rel="alternate"
          type="application/rss+xml"
          title="AIJobFit Blog RSS"
          href="/blog/feed.xml"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_LD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_LD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(DATASET_LD) }}
        />
        {children}
      </body>
    </html>
  );
}
