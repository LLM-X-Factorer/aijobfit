# AIJobFit — 非程序员 AI 求职定位诊断

## Overview

非程序员 AI 求职定位诊断。基于 [Agent Hunt](https://github.com/LLM-X-Factorer/agent-hunt) 的 2370+ JD 数据 + 14 国内角色聚类，把用户的技能/年限/学历匹配到 Top 3 角色并生成 7 节诊断报告。

**定位：永久免费 + 加微信漏斗**。本 app 不做产品内付费；商业化走产品外部渠道（1V1 / 社群 / 课程），与本仓库解耦。漏斗机制：报告前 3 节（封面 / Top 3 角色 / 薪资）完全开放，后 4 节（Gap / 路径 / Action / 资源）遮罩，扫码加小助理微信拿统一激活码 `AIJOB-2026` 解锁。移动端优先（流量来自微信生态）。

## Tech Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + @vercel/og + qrcode

## Commands

```bash
npm run dev                  # Dev server (port 3000)
npm run build                # Production build (standalone output)
docker compose up -d --build # Docker (port 3004:3000)
```

## Architecture

### 数据层

- `src/data/tracks.ts` — 4 主线元数据（A AI PM / B AI 运营 / C AI 转型咨询 / D AIGC 创意）
- `src/data/form-fields.ts` — 10 字段表单定义（5 必填 + 5 推荐）
- `src/data/free-resources.ts` — 按主线分的免费资源清单
- `public/data/roles-domestic.json` + `skills.json` — agent-hunt v0.6 数据快照

### 核心库

- `src/lib/fetchAgentHunt.ts` — 客户端拉 agent-hunt JSON（远程优先，fallback 本地）
- `src/lib/serverData.ts` — server 端读 `public/data/` JSON（OG 路由用）
- `src/lib/matching.ts` — 用户技能 → 14 角色匹配算法（Top 3）
- `src/lib/reportGen.ts` — UserInput + roles → 7 节报告 JSON
- `src/lib/encoding.ts` — base64url 编码用户输入，便于分享

### UI 组件

- `src/components/Report*.tsx` — 7 节报告组件（Cover / Roles / Salary / Gap / Paths / Actions + 第 7 节合并到 Actions）
- `src/components/DiagnosisForm.tsx` — 多步表单
- `src/components/SharePoster.tsx` — 1080×1920 竖版 Canvas 海报（client），QR 指向首页引流

### 路由

- `src/app/page.tsx` — 首页 Hero + 数据锚点 + 卖点
- `src/app/diagnose/page.tsx` — 表单页
- `src/app/result/[hash]/page.tsx` — server component，生成动态 metadata（title + og:image URL）
- `src/app/result/[hash]/ReportClient.tsx` — 客户端报告渲染 + 顶部栏（保存分享图 / 复制链接）
- `src/app/api/og/route.tsx` — 站点级静态 OG 图（英文，不依赖外网字体）
- `src/app/api/og/[hash]/route.tsx` — 动态 OG 图（1200×630，含 Top 1 角色 + 匹配度 + 薪资区间），中文字体从 `fonts.googleapis.cn` 拉

## Design Principles

- 冷蓝理性风（#2563EB），区别于 vibe-check 的暗黑嘲讽
- 数据优先于结论：每个判断都附带 JD 数据来源
- 诚实推免费资源，不为了卖课故意写差
- 不打饥饿营销 / 不催买
- 报告 URL = base64 编码用户输入，刷新/分享都能重现

## 产品已锁定的决策（不再重新讨论）

- **本 app 永久免费，不做产品内付费**。商业化（1V1 / 社群 / 课程）在产品外独立运营
- 4 主线定位保留 / 不承诺包就业 / 透明数据机制
- 报告免费推免费资源的边界：不为了导流付费课程而压低自学路径的真实评价
- 遮罩组件不预留"将来替换为付费"的抽象；未来不会重启产品内付费

## Deployment

- 本地：`docker compose up -d --build` → `http://localhost:3004`
- 生产：腾讯云 Lighthouse + Nginx 反代。同机 vibe-check 占 3003，aijobfit 占 3004
- 域名：`aijobfit.llmxfactor.cloud`
- 关键：`NEXT_PUBLIC_SITE_URL` 在 `docker-compose.yml` 的 `build.args` 注入，让客户端 bundle 编译期 inline 生产域名（SharePoster QR + layout metadataBase + OG 绝对 URL 都依赖）
- 已知陷阱：Next 16 standalone 文件追踪漏 `@vercel/og` compiled node binary，已在 `next.config.ts` 用 `outputFileTracingIncludes` 显式包含

## 路线图（GitHub Issues 跟进）

**当前批次 · 加微信漏斗 + 移动端**

- **#7**：小助理微信二维码占位组件（复用给遮罩 + SharePoster）
- **#8**：报告页软门槛，后 4 节遮罩 + 激活码 `AIJOB-2026` + localStorage
- **#6**：全站移动端断点重排（iPhone SE 375px 基线）
- **#10**：最小漏斗埋点（form_submit → report_view → mask_see → code_enter）
- **#9**：微信友好 · 方形 OG（800×800）+ WebView 复制降级，并入 #5 字体打包

**其他**

- **#3**：agent-hunt 数据自动 refetch
- **#4**：腾讯云 Lighthouse 实机部署（依赖 #6/#8，上线后才能收真实微信 WebView 转化数据）
- **#5**：OG 中文字体打包进镜像（在 #9 实施时一并解决）

已关闭：#1 付费墙、#2 PDF 导出（商业化退出本产品，不再实施）
