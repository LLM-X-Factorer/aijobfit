import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // better-sqlite3 是 native addon，不能被 Next bundler 处理，必须走 Node require
  serverExternalPackages: ["better-sqlite3"],
  // Next 16 的 standalone 文件追踪漏了 @vercel/og 的 compiled node binary，
  // 导致生产容器里 /api/og 报 ERR_MODULE_NOT_FOUND。显式声明强制包含。
  // 同理 better-sqlite3 的 .node binary 也需要显式包含。
  outputFileTracingIncludes: {
    "/api/og": ["./node_modules/next/dist/compiled/@vercel/og/**/*"],
    "/api/og/[hash]": ["./node_modules/next/dist/compiled/@vercel/og/**/*"],
    "/api/og/dynamic": ["./node_modules/next/dist/compiled/@vercel/og/**/*"],
    "/api/og-square": ["./node_modules/next/dist/compiled/@vercel/og/**/*"],
    "/api/og-square/[hash]": ["./node_modules/next/dist/compiled/@vercel/og/**/*"],
    "/api/track": ["./node_modules/better-sqlite3/**/*"],
    "/api/submit": ["./node_modules/better-sqlite3/**/*"],
    "/api/admin/export": ["./node_modules/better-sqlite3/**/*"],
  },
};

export default nextConfig;
