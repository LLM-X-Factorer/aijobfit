# AIJobFit — 非程序员 AI 求职定位诊断

## Overview

非程序员 AI 求职定位诊断。基于 [Agent Hunt](https://github.com/LLM-X-Factorer/agent-hunt) 的 2370+ JD 数据 + 14 国内角色聚类，把用户的技能/年限/学历匹配到 Top 3 角色并生成 7 节诊断报告。

**定位：永久免费 + 加微信漏斗**。本 app 不做产品内付费；商业化走产品外部渠道（1V1 / 社群 / 课程），与本仓库解耦。漏斗机制：报告前 3 节（封面 / Top 3 角色 / 薪资）完全开放，后 4 节（Gap / 路径 / Action / 资源）遮罩，扫码加小助理微信拿统一激活码 `AIJOB-2026` 解锁。移动端优先（流量来自微信生态）。

## Tech Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + @vercel/og + qrcode + GitHub Actions CI (lint + tsc + build)

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
- `src/lib/matching.ts` — 用户技能 → 14 角色匹配算法。含稀疏角色置信度惩罚 `min(1, (req+pref)/5)`，避免 1-skill 小众角色被刷 100%
- `src/lib/reportGen.ts` — UserInput + roles → 7 节报告 JSON。含 fallback 机制：当所有匹配为 0 时，把 targetTrack 锚点角色 hoist 到 Top 1，并设 `meta.isFallback`
- `src/lib/encoding.ts` — base64url 编码用户输入，便于分享
- `src/lib/track.ts` — 漏斗埋点（form_submit / report_view / mask_see / code_enter_*），初期 console + localStorage ring buffer，预留 window.plausible
- `src/lib/useragent.ts` — `isWeChat()` / `isMobile()` 检测（SSR-safe）
- `src/lib/ogFont.ts` — OG 图字体加载。`public/fonts/noto-sans-sc-{400,700}.woff2` 本地优先，失败 fallback `fonts.googleapis.cn`

### UI 组件

- `src/components/Report*.tsx` — 7 节报告组件（Cover / Roles / Salary / Gap / Paths / Actions + 第 7 节合并到 Actions）
- `src/components/ReportFallbackNotice.tsx` — 0-match 兜底提示（黄色 banner，解释 required_skills 命中 0 的原因 + 推荐 target track keySkills）
- `src/components/LockedSections.tsx` — 后 4 节软门槛。`useSyncExternalStore` 读 localStorage `aijobfit_unlocked`，激活码 `AIJOB-2026`（大小写不敏感，trimmed）
- `src/components/AssistantQR.tsx` — 小助理微信 QR 组件，默认读 `public/qr-assistant.jpg`，env `NEXT_PUBLIC_ASSISTANT_QR_URL` 可覆盖
- `src/components/DiagnosisForm.tsx` — 多步表单，含 form_submit 埋点
- `src/components/SharePoster.tsx` — 1080×1920 竖版 Canvas 海报（client），QR 指向首页引流

### 路由

- `src/app/page.tsx` — 首页 Hero + 数据锚点 + 卖点
- `src/app/diagnose/page.tsx` — 表单页
- `src/app/result/[hash]/page.tsx` — server component，metadata 同时提供 1200×630 + 800×800 两套 og:image
- `src/app/result/[hash]/ReportClient.tsx` — 客户端报告渲染。顶部栏：保存分享图、复制链接（微信 WebView 下降级为"点右上角 · 复制链接"提示）
- `src/app/api/og/route.tsx` — 站点级静态 OG（英文，不依赖字体）
- `src/app/api/og/[hash]/route.tsx` — 动态 OG 1200×630（Top 1 角色 + 匹配度 + 薪资）
- `src/app/api/og-square/route.tsx` — 站点级方形 OG（800×800，微信聊天卡片）
- `src/app/api/og-square/[hash]/route.tsx` — 动态方形 OG
- `.github/workflows/ci.yml` — push/PR 触发 npm ci → lint → tsc → build

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

## 已交付（全部已上线 https://aijobfit.llmxfactor.cloud）

- **加微信漏斗**：前 3 节开放 / 后 4 节遮罩 / 激活码 AIJOB-2026（#7 #8）
- **移动端适配**：375px 基线，全站断点重排（#6）
- **微信生态**：方形 OG 800×800、WebView 复制链接降级、长按 QR 识别（#9 #5）
- **漏斗埋点**：form_submit / report_view / mask_see / code_enter_{success,fail}（#10）
- **算法修复**：calcTrackScores 走全量、稀疏角色置信度惩罚、fallback 锚点 hoist、Gap priority 基线（#11）
- **CI**：GitHub Actions lint + tsc + build
- **运营手册**：[`docs/产品手册-运营版.md`](./docs/产品手册-运营版.md)

## 剩余 open issue（非代码）

- **#12**：部署 · 替换占位小助理 QR 为真实图
- **#13**：测试 · 微信实机全链路
- **#14**：数据 · 漏斗埋点观察期 + 门槛调优决策

已关闭：#1 付费墙、#2 PDF（pivot 废弃）| #3 agent-hunt refetch（aijobfit 侧完工，跨仓 todo 迁移至 agent-hunt#7）| #4 部署（已上线）| #5-#11 见上文
