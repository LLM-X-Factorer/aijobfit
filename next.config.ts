import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Next 16 的 standalone 文件追踪漏了 @vercel/og 的 compiled node binary，
  // 导致生产容器里 /api/og 报 ERR_MODULE_NOT_FOUND。显式声明强制包含。
  outputFileTracingIncludes: {
    "/api/og": ["./node_modules/next/dist/compiled/@vercel/og/**/*"],
    "/api/og/[hash]": [
      "./node_modules/next/dist/compiled/@vercel/og/**/*",
    ],
    "/api/og/dynamic": [
      "./node_modules/next/dist/compiled/@vercel/og/**/*",
    ],
    "/api/og-square": ["./node_modules/next/dist/compiled/@vercel/og/**/*"],
    "/api/og-square/[hash]": [
      "./node_modules/next/dist/compiled/@vercel/og/**/*",
    ],
  },
};

export default nextConfig;
