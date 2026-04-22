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
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "AIJobFit | 非程序员 AI 求职定位诊断",
  description:
    "用 2370+ 条真实 JD 数据帮你判断你适合做什么 AI 岗位。10 分钟，14 角色匹配，诚实推荐免费学习资源。",
  openGraph: {
    title: "AIJobFit | 非程序员 AI 求职定位诊断",
    description: "用真实招聘数据指路，不卖课，不催单。",
    type: "website",
    url: "/",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AIJobFit | 非程序员 AI 求职定位诊断",
    description: "用真实招聘数据指路，不卖课，不催单。",
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
