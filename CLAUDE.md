# AIJobFit — 非程序员 AI 求职定位诊断

## Overview

非程序员 AI 求职定位诊断。基于 [Agent Hunt](https://github.com/LLM-X-Factorer/agent-hunt) 的 2370+ JD 数据 + 14 国内角色聚类，生成 7 节诊断报告。

**两条路线并行**：
- **路线 A · 帮我定位**（`/diagnose`）：填技能 + 背景 → 系统推荐 Top 3 角色 + 4 主线分布 + Gap/路径/Action
- **路线 B · 目标 Gap 诊断**（`/diagnose-target`）：用户锁定行业 + 岗位 → 仅算锁定角色匹配率 + Gap，不展示 Top 3

**双一等受众**：社招用户 + 应届生 / 学生（含在读、应届无实习、应届有实习），表单分支 + 报告路径文案做应届/社招差异化。

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

- `src/data/tracks.ts` — 4 主线元数据（A AI PM / B AI 运营 / C AI 转型咨询 / D AIGC 创意）。E 主线（留在原行业 + AI 增强）见 issue #17，待 agent-hunt#10 数据落地后引入
- `src/data/form-fields.ts` — 10 字段表单定义（5 必填 + 5 推荐）；yearsExp 含应届分支（在读学生 / 应届无实习 / 应届有实习）
- `src/data/free-resources.ts` — 按主线分的免费资源清单
- `public/data/roles-domestic.json` + `skills.json` — agent-hunt v0.6 数据快照

### 核心库

- `src/lib/fetchAgentHunt.ts` — 客户端拉 agent-hunt JSON（远程优先，fallback 本地）
- `src/lib/serverData.ts` — server 端读 `public/data/` JSON（OG 路由用）
- `src/lib/matching.ts` — 用户技能 → 14 角色匹配算法。含稀疏角色置信度惩罚 `min(1, (req+pref)/5)`、`whyMatched` 推理链（hitRequired/hitPreferred/targetTrackBoost/educationPenalty/lowConfidence/industryFit），路线 B 时通过 `options.lockedRoleId` 仅算锁定角色
- `src/lib/reportGen.ts` — UserInput + roles → 7 节报告 JSON。`generateReport` 路线 A 全量匹配 + Top 3 + 4 主线分布；`generateRouteBReport` 路线 B 仅锁定角色 + 跳过 Top 3。含 fallback 机制：路线 A 当所有匹配为 0 时把 targetTrack 锚点角色 hoist 到 Top 1，并设 `meta.isFallback`
- `src/lib/audience.ts` — 受众类型推断（fresh-grad / social）。基于 yearsExp，驱动 ReportPaths/ReportActions 文案差异
- `src/lib/encoding.ts` — base64url 编码用户输入。UserInput 含 `route?: "A" | "B"` + `targetRoleId?` 路线字段
- `src/lib/track.ts` — 漏斗埋点（form_submit / route_b_submit / report_view / report_reject_top3_click / mask_see / code_enter_*），初期 console + localStorage ring buffer，预留 window.plausible
- `src/lib/useragent.ts` — `isWeChat()` / `isMobile()` 检测（SSR-safe）
- `src/lib/ogFont.ts` — OG 图字体加载。`public/fonts/noto-sans-sc-{400,700}.woff2` 本地优先，失败 fallback `fonts.googleapis.cn`

### UI 组件

- `src/components/Report*.tsx` — 7 节报告组件（Cover / Roles / Salary / Gap / Paths / Actions + 第 7 节合并到 Actions）。Cover & Roles 按 `data.route` 切 A/B 渲染；Roles 显示 whyMatched 推理；Paths/Actions 按 audience 切应届/社招文案
- `src/components/ReportFallbackNotice.tsx` — 0-match 兜底提示（黄色 banner，解释 required_skills 命中 0 的原因 + 推荐 target track keySkills）
- `src/components/LockedSections.tsx` — 后 4 节软门槛。`useSyncExternalStore` 读 localStorage `aijobfit_unlocked`，激活码 `AIJOB-2026`（大小写不敏感，trimmed）
- `src/components/AssistantQR.tsx` — 小助理微信 QR 组件，默认读 `public/qr-assistant.png`，env `NEXT_PUBLIC_ASSISTANT_QR_URL` 可覆盖
- `src/components/DiagnosisForm.tsx` — 路线 A 多步表单，含 form_submit 埋点
- `src/components/DiagnosisFormB.tsx` — 路线 B 多步表单（锁定行业 + 岗位 → 背景 + 技能 → 偏好），含 route_b_submit 埋点；用 `useSearchParams` 读 `?from=<hash>` 预填
- `src/components/FormFieldRender.tsx` — 表单字段渲染 helper（路线 A/B 共用）
- `src/components/TrackOverview.tsx` — 4 主线卡片组件（首页 + Step 2 折叠面板共用），数据驱动从 TRACKS iterate
- `src/components/SharePoster.tsx` — 1080×1920 竖版 Canvas 海报（client），QR 指向首页引流

### 路由

- `src/app/page.tsx` — 首页 Hero + 双 CTA（路线 A / B） + 4 主线总览 + 数据锚点 + 卖点
- `src/app/diagnose/page.tsx` — 路线 A 表单页
- `src/app/diagnose-target/page.tsx` — 路线 B 表单页（Suspense 包 useSearchParams）
- `src/app/result/[hash]/page.tsx` — server component，metadata 同时提供 1200×630 + 800×800 两套 og:image
- `src/app/result/[hash]/ReportClient.tsx` — 客户端报告渲染。顶部栏：保存分享图、复制链接（微信 WebView 下降级为"点右上角 · 复制链接"提示）。路线 A 报告底部加"切到目标 Gap 诊断"CTA → `/diagnose-target?from=<hash>` 带预填
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
- **产品形态 = 双路线并行**：路线 A 定位诊断 + 路线 B 目标 Gap 诊断，互不替代
- **受众 = 双一等受众**：社招用户 + 应届生 / 学生（含在读 / 应届无实习 / 应届有实习），表单分支 + 报告文案分应届/社招
- 4 主线定位保留 / 不承诺包就业 / 透明数据机制（E 主线 5 主线扩展见 #17，待 agent-hunt#10 数据落地）
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
- **漏斗埋点**：form_submit / route_b_submit / report_view / report_reject_top3_click / mask_see / code_enter_{success,fail}（#10 #15 #21）
- **算法修复**：calcTrackScores 走全量、稀疏角色置信度惩罚、fallback 锚点 hoist、Gap priority 基线（#11）
- **真 QR 替换**：`public/qr-assistant.png`（500×450，2026-04-28），生产端到端浏览器测试已通（#12）
- **移动端 UI polish**：报告封面 `currentJob` wrap、Gap 行 mobile 堆叠（`flex-col sm:flex-row`）、QR size 150→180（rendered 130→160）、blur 容器 420→480
- **报告可解释性**：每个推荐角色显示 whyMatched 推理链（命中骨架 + 加权折扣 + 行业匹配 + 0 命中诚实声明）（#18）
- **路线 B 端到端**：`/diagnose-target` 锁定行业 + 岗位 → 仅算匹配率 + Gap，不展示 Top 3。Cover/Roles 按 route 切渲染（#15）
- **报告兜底 CTA**：路线 A 报告底部"切到目标 Gap 诊断"，跳转预填用户已填字段（#21）
- **主线分支透明化**：首页 + 表单 step 2 展示 4 主线 keySkills + targetUsers + JD 数 + 中位月薪（#20）
- **应届生一等受众**：yearsExp 加在读学生 / 应届无实习 / 应届有实习分支；ReportPaths + ReportActions 按 audience 切应届/社招文案（#16）
- **CI**：GitHub Actions lint + tsc + build
- **运营 / 业务文档**：
  - [`docs/产品手册-运营版.md`](./docs/产品手册-运营版.md) — 话术 / FAQ / 异常处理
  - [`docs/用户流程-图文版.md`](./docs/用户流程-图文版.md) — 14 张移动端截图图文走查（业务 onboarding）
  - [`docs/pdf/`](./docs/pdf/) — 两份 md 的 PDF 构建产物（直接发给业务方）
  - `scripts/build-docs-pdf.sh` — md → PDF 一键重建（pandoc + Chrome headless）

## 剩余 open issue

依赖 agent-hunt 数据：
- **#16 应届生数据切片部分**：表单分支 + 文案差异已上，graduate-friendly 推荐结果差异化等 agent-hunt#11
- **#17 第 5 主线 E**：CLAUDE.md 锁定决策已更新双路线 + 双受众；E 主线 TRACKS 数据 + 推荐逻辑等 agent-hunt#10
- **#19 行业 × 岗位维度**：等 agent-hunt#9 二维切片数据

非代码：
- **#13**：测试 · 微信实机全链路（手机微信扫 QR → 加好友 → 拿激活码，不在代码里）
- **#14**：数据 · 漏斗埋点观察期 + 门槛调优决策

已关闭：#1 付费墙 · #2 PDF（pivot 废弃）· #3 agent-hunt refetch · #4 部署 · #5-#12 早期迭代 · #15 路线 B · #18 whyMatched · #20 主线透明化 · #21 报告兜底 CTA
