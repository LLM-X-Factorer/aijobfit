# AIJobFit — 非程序员 AI 求职定位诊断

## Overview

非程序员 AI 求职定位诊断。基于 [Agent Hunt](https://github.com/LLM-X-Factorer/agent-hunt) 的真实 JD 数据（截至 2026-04-29 共 8238 条原始 / 5673 条已聚类，runtime 拉 `narrative-stats.json`）+ 14 角色聚类 + 420 长尾原职业，生成 7 节诊断报告。

**三条路线并行**（首页 B + C 双主 CTA，A 兜底链接）：
- **路线 A · 帮我定位**（`/diagnose`）：填技能 + 背景 → 系统推荐 Top 3 角色 + 4 主线分布 + Gap/路径/Action
- **路线 B · 转行 Gap 诊断**（`/diagnose-target`）：用户锁定行业 + 岗位 → 仅算锁定 14 角色之一的匹配率 + Gap，不展示 Top 3
- **路线 C · 留行 + AI 增强**（`/diagnose-augment`）：用户保留原职业（free-text → 模糊匹配 420 entry），看「原职业 + AI 增强真实 JD」+ augmentSkills 准备度档位

**双一等受众**：社招用户 + 应届生 / 学生（含在读、应届无实习、应届有实习），表单分支 + 报告路径文案做应届/社招差异化；audience=fresh-grad 时 cover/roles/salary 注入「校招 vs 社招」对照。

**定位：永久免费 + 加微信漏斗**。本 app 不做产品内付费；商业化走产品外部渠道（1V1 / 社群 / 课程），与本仓库解耦。漏斗机制：报告前 3 节（封面 / Top 3 角色 / 薪资）开放，后 4 节（Gap / 路径 / Action / 资源）遮罩，扫码加小助理微信拿统一激活码 `AIJOB-2026` 解锁。移动端优先（流量来自微信生态）。

## Tech Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + @vercel/og + qrcode + GitHub Actions CI (lint + tsc + build)

## Commands

```bash
npm run dev                  # Dev server (port 3000)
npm run build                # Production build (standalone output)
docker compose up -d --build # Docker (port 3004:3000)
npx tsx scripts/verify-acceptance.ts  # 跑 9 个端到端验收 case（拉 live 数据）
```

## Architecture

### 数据层

- `src/data/tracks.ts` — 5 主线元数据 + `Track` 类型（含 `ctaPath` / `isAugmentationTrack`）。`TRANSITION_TRACKS = TRACKS.filter(!isAugmentationTrack)` 给 ABCD-only 算法用，避免 E 干扰 4 主线匹配。E 主线 jdCount/medianSalary 静态写 0，runtime 由 TrackOverviewServer 从 `roles-augmented-by-profession.json` 算
- `src/data/form-fields.ts` — 表单字段定义；yearsExp 含应届分支（在读学生 / 应届无实习 / 应届有实习）；`targetTrack` 选项保留 ABCD + 「我不知道」（不加 E，E 通过 Route C 入口）
- `src/data/free-resources.ts` — 5 主线分类资源清单（含 E 留行专属）
- `src/data/profession-to-industry.ts` — 静态映射表：电气工程师→manufacturing / 医生→healthcare 等，覆盖 30+ 常见原职业；matching.ts 用它把 currentJob 折算成 industry hard filter 信号
- `public/data/roles-domestic.json` + `skills.json` — agent-hunt 数据快照（OG/SSR fallback；客户端优先远程 cache:force-cache）

### 数据 fetcher（`src/lib/fetchAgentHunt.ts` 客户端 / `src/lib/serverData.ts` server）

| 数据 | 客户端 | server | 含什么 |
|---|---|---|---|
| `roles-domestic.json` | fetchRoles | loadRoles | 14 角色聚类，本地有快照 |
| `skills.json` | fetchSkills | loadSkills | 36 项技能词典，本地有快照 |
| `industry-augmented-salary.json` | fetchIndustryAugmentedSalary | loadIndustryAugmentedSalary | 行业 × AI 增强 JD 薪资 P25/P50/P75 |
| `roles-by-city.json` | fetchRolesByCity | loadRolesByCity | 14 角色 × 城市 tier × 薪资 |
| `narrative-stats.json` | fetchNarrativeStats | loadNarrativeStats | jdTotal / labeledTotal / industry breakdown |
| `roles-augmented-by-profession.json` | fetchRolesAugmentedByProfession | loadRolesAugmentedByProfession | 420 原职业 × AI 增强 JD（augmentSkills + sampleTitles） |
| `roles-graduate-friendly.json` | fetchRolesGraduateFriendly | loadRolesGraduateFriendly | 14 角色 × 应届友好度（freshSalaryMedian / 校招 / 实习 / 应届 / topCampusCities） |

### 核心算法库

- `src/lib/matching.ts` — 用户技能 → 14 角色匹配。
  - 评分：技能命中 + 稀疏聚类置信度惩罚 `min(1, (req+pref)/5)`、targetTrack ×1.2 加成、高学历惩罚 ×0.5、**industry hard filter ×0.3**（用户行业不在角色 Top 3 行业则强降权）
  - `whyMatched` 推理链：hitRequired/hitPreferred/targetTrackBoost/educationPenalty/lowConfidence/industryFit/**industryHardFilter**/**trackFingerprint**/zeroHit + 文案 reasoning[]
  - 路线 B 通过 `options.lockedRoleId` 仅算锁定角色
  - exports: `normalizeUserSkills`, `matchTrackKeySkills`（给 reportGen 复用）
- `src/lib/professionMatch.ts` — 用户 free-text 原职业 → `roles-augmented-by-profession.json` 的 entry。
  - 策略：exact key match → fuzzy contains（双向 substring）→ vacancyCount >= 5 质量门槛
  - 返回 `{ best, alternatives, totalCandidates }`，UI 用 alternatives 给「你是不是想说…」chip 提示
- `src/lib/reportGen.ts` — UserInput + 多源数据 → 7 节报告 JSON。
  - `generateReport(input, roles, skills, reportId, industrySalary?, rolesByCity?, narrativeStats?, augmentedByProfession?, gradFriendly?)` —— 9 参数，全 optional
  - 路线分发：`route === "C"` → `generateRouteCReport`；`"B"` → `generateRouteBReport`；默认 A
  - 路线 A 内：industry slice 排序（in-industry 优先 ≥3 用 inIndustry，否则全量 Top 3）+ fallback 锚点 hoist
  - 路线 C 内：`buildAugmentTarget` → readiness 档位（first-class / mid / starter / no-data）+ `buildAugmentSalary`（用原职业中位 + topIndustries[0] industry slice 的 spread 估 P25/P75）+ `buildAugmentActions`（7/30/90 留行版）
  - **achievement rate**：percentile 桶 75/50/25/10/5%，用 industry-augmented salary 的 p25/p50/p75 算
  - **citySalary**：role × city tier 对照，「你所在新一线 ¥32k vs 全国 ¥30k +7%」
  - **gradContext / gradBreakdown / freshComparison**：audience=fresh-grad 时注入 cover/roles/salary
  - **trackFingerprints**：cover 级扫描 user skills 命中各主线 keySkills，机制透明（解决「我会剪映就推 AIGC？」黑盒疑虑）
  - 兜底：路线 A 当所有匹配为 0 时把 targetTrack 锚点角色 hoist 到 Top 1，`meta.isFallback`；路线 C 当 originProfession 无匹配时同样 isFallback
- `src/lib/audience.ts` — `fresh-grad / social` 受众推断
- `src/lib/encoding.ts` — base64url 编码 UserInput。`route?: "A" | "B" | "C"`，`targetRoleId?`（B），`originProfession?`（C）
- `src/lib/track.ts` — 漏斗埋点；同时 POST 到 `/api/track` server-side（fire-and-forget）
- `src/lib/uuid.ts` — 客户端 UUID 生成（`aijobfit_uid` localStorage key），SSR-safe
- `src/lib/db.ts` — `node:sqlite` 单例（`DatabaseSync`）+ 建表 `events` / `submissions`；路径由 `DATA_DIR` env 控制（默认 `./data`，生产 `/data`）
- `src/lib/useragent.ts` — `isWeChat()` / `isMobile()` SSR-safe
- `src/lib/ogFont.ts` — OG 图字体加载

### UI 组件

- `src/components/Report*.tsx` — 7 节报告。
  - `ReportCover`：route="A" 显 4 主线 bar + Top 3；"B" 显锁定目标卡；"C" 显「原职业 + AI 增强」+ readiness banner + 同义近邻 chips。industryContext / gradContext / **trackFingerprints** badge
  - `ReportRoles`：route="A/B" 显 Top 3 / 单角色匹配；"C" 走 `RouteCOverview` 子组件（sampleTitles + topIndustries 占比 + augmentSkills ✓/✗ tag cloud）。fresh-grad 时上方加 `gradBreakdown` 4 格（总/校招/实习/应届）
  - `ReportSalary`：industry slice 替换 + achievementRate 三档色带 + citySalary 对照行 + freshComparison 对照行
  - `ReportGap` / `ReportPaths`（自学/课程/1V1）/ `ReportActions`（7/30/90）
  - `ReportFallbackNotice` — 0-match 兜底提示（fallbackTrack + jdTotal）
  - `LockedSections` — 后 4 节软门槛
  - `AssistantQR` / `SharePoster` — 微信生态分享物
- `src/components/Diagnosis*.tsx`
  - `DiagnosisForm.tsx` — 路线 A 多步表单
  - `DiagnosisFormB.tsx` — 路线 B（锁定行业 + 14 角色）
  - `DiagnosisFormC.tsx` — 路线 C（free-text 原职业 + 实时数据集预览 + alternatives chips + optional industry）
  - `FormFieldRender.tsx` — 共用字段渲染
- `src/components/TrackOverview.tsx` + `TrackOverviewServer.tsx` — 5 主线卡片，server wrapper 算 E 实时 stats，inner 是 client-safe pure presentation；E 卡片视觉 emerald 区别 + 「填原职业开始诊断」CTA

### 路由

- `src/app/page.tsx` — async server 首页：runtime narrative-stats，5 主线（含 E），双主 CTA（B + C 并列）+ A 兜底链接
- `src/app/diagnose/page.tsx` — A 表单页 + 跨路线提示链接到 B/C
- `src/app/diagnose-target/page.tsx` — B 表单页 + 跨路线提示链接到 A/C
- `src/app/diagnose-augment/page.tsx` — C 表单页 + 跨路线提示链接到 A/B
- `src/app/result/[hash]/page.tsx` + `ReportClient.tsx` — server metadata 同时给 1200×630 + 800×800 OG；client pre-fetch 7 个 endpoint；底部按 route 渲染跨路线 CTA（A→B/C，B→B/C/A 三选，C→B/A 二选）
- `src/app/api/og/route.tsx` / `og-square/route.tsx` — 静态 OG（英文，5000+ JD floor）
- `src/app/api/og/[hash]/route.tsx` / `og-square/[hash]/route.tsx` — 动态 OG，server load 全部数据后调 generateReport
- `src/app/api/track/route.ts` — L1 事件写入（POST `{uuid, event_type, route, extra}`）
- `src/app/api/submit/route.ts` — L2 表单提交写入（POST 含 audience 自动推断；DiagnosisForm A/B/C 在 submit 时 fire-and-forget 调用）
- `src/app/api/admin/export/route.ts` — 数据导出（GET `?token&table=submissions|events&fmt=csv|json&limit&since`；token 由 `DATA_ADMIN_TOKEN` env 控制，默认 `aijobfit-admin-2026`）
- `.github/workflows/ci.yml` — push/PR → npm ci → lint → tsc → build

## Design Principles

- 冷蓝理性风（#2563EB），E 主线 + 应届生 + readiness 第一梯队 用 emerald
- 数据优先于结论：每个判断都附带 JD 数据来源（vacancyCount / sampleSize / industry / tier）
- 诚实推免费资源，不为了卖课故意写差
- 不打饥饿营销 / 不催买
- 报告 URL = base64 编码用户输入，刷新/分享都能重现
- **机制透明**：whyMatched reasoning + trackFingerprints + readiness 档位 + isFallback 提示，让用户看到「为什么是这个推荐」而不是黑盒

## 产品已锁定的决策（不再重新讨论）

- **本仓库 = 产品；shushu 是产品旁边写文章的离线小工具**。shushu (`github.com/LLM-X-Factorer/shushu-internship-resume-optimizer`) 用 DeepSeek 把脱敏实习描述渲染成 `src/components/blog/posts/*.tsx`。
  - `public/data/roles-domestic.json` 是 14 角色的**源**；shushu 那边的 `shushu/data/aijobfit_roles.json` 是 hard copy。**本仓库说了算**，更新后手动同步到 shushu。
  - 生成的 `.tsx` 单篇润色 / 数字补齐：**直接在本仓库手改，不回流到 shushu**。
  - `PostShell` API 改动是 breaking change：**先改本仓库，再去 shushu 改 `render.py`**，否则下一篇生成的 tsx 会 build 失败。
  - 本仓库**不依赖** shushu；砍掉 shushu aijobfit 照常运行。shushu **不读** agent-hunt、**不调** 本仓库 API、**不知道**用户存在。
- **本 app 永久免费，不做产品内付费**。商业化（1V1 / 社群 / 课程）在产品外独立运营
- **产品形态 = 三路线并行**：A 推荐 / B 转行 Gap / C 留行 + AI 增强，互不替代；首页 B+C 主 CTA，A 兜底
- **5 主线**：A AI PM / B AI 运营 / C AI 转型咨询 / D AIGC 创意 / **E 留行 + AI 增强**。E 不参与 ABCD 4 主线匹配 boost（`TRANSITION_TRACKS` 排除），E 作为独立 Route C 入口
- **受众 = 双一等受众**：社招用户 + 应届生 / 学生，表单分支 + 报告文案分应届/社招
- 不承诺包就业 / 透明数据机制（每节都附数据源）
- 报告免费推免费资源的边界：不为了导流付费课程而压低自学路径的真实评价
- 遮罩组件不预留"将来替换为付费"的抽象；未来不会重启产品内付费

## Deployment

- 本地：`docker compose up -d --build` → `http://localhost:3004`
- 生产：腾讯云 Lighthouse + Nginx 反代。同机 vibe-check 占 3003，aijobfit 占 3004
- 域名：`aijobfit.llmxfactor.cloud`
- 关键：`NEXT_PUBLIC_SITE_URL` 在 `docker-compose.yml` 的 `build.args` 注入，让客户端 bundle 编译期 inline 生产域名（SharePoster QR + layout metadataBase + OG 绝对 URL 都依赖）
- 已知陷阱：Next 16 standalone 文件追踪漏 `@vercel/og` compiled node binary，已在 `next.config.ts` 用 `outputFileTracingIncludes` 显式包含

## 已交付（全部已上线 https://aijobfit.llmxfactor.cloud）

### 早期迭代（#1-#21）

- **加微信漏斗**：前 3 节开放 / 后 4 节遮罩 / 激活码 AIJOB-2026
- **移动端适配**：375px 基线，全站断点重排
- **微信生态**：方形 OG 800×800、WebView 复制链接降级、长按 QR 识别
- **漏斗埋点**：form_submit / route_b_submit / route_c_submit / report_view / report_reject_top3_click / report_b_reselect_target_click / report_b_switch_to_a_click / report_a_to_c_click / report_b_to_c_click / report_c_to_b_click / report_c_to_a_click / mask_see / code_enter_{success,fail}
- **报告可解释性 v1**：whyMatched 推理链
- **真 QR + 端到端测试**

### P0/P1 业务方反馈重构（2026-04-29）

- **#1 Industry hard filter**：`commit 252cf69` —— 用户行业（form + currentJob 推断）不在角色 Top 3 行业 → 分数 ×0.3，「电气工程师 + 教育」用户不再被推 AI 销售
- **#2 报告 Section 1-3 行业切片**：`commit d1d4e04` —— 接入 industry-augmented-salary，Top 3 优先 in-industry，cover 加 industryContext badge
- **#3 期望薪资达成概率**：`commit 233fc67` —— percentile 桶 75/50/25/10/5%，alert 块色带绿/黄/红
- **#4 Route B 主入口**：`commit a2a401f` —— 后被 P2 #8 进一步演进为 B+C 双主
- **#5 城市 tier 对照**：`commit c904471` —— 接入 roles-by-city，「你所在新一线 ¥32k vs 全国 ¥30k +7%」
- **#6 runtime jdTotal/rolesTotal**：`commit 86b957b` —— 删 2370 / 14 硬编码，runtime 拉 narrative-stats（5673 labeled / 8238 raw）

### P2 业务形态重构

- **P2 #8 Route C 留行 + AI 增强**（commits `3bb8657` / `487cf5d` / `01db7df` / `93e385f` / `52d9c60` / `5fe8180` / `8145644`）—— 全新路线，420 原职业字典 + readiness 4 档（first-class/mid/starter/no-data）+ buildAugmentTarget/Salary/Gap/Actions 全套；首页 3-CTA 重排；4 个新跨路线埋点
- **P2 #7 应届生切片**（commits `ba264c6` / `e2d8992` / `07804f2` / `94356d8`）—— 接入 roles-graduate-friendly，audience=fresh-grad 时注入 cover.gradContext + roles.gradBreakdown + salary.freshComparison

### 体验补强（本轮，2026-04-30）

- **5 主线 TrackOverview**：`commit 42e07d1` —— 加 E 主线为 5th 卡片，server wrapper 动态算 jdCount/medianSalary/professionCount，emerald 视觉差异化，每张卡片底部 CTA；TRANSITION_TRACKS 防 E 污染 4 主线 trackScores
- **主线指纹扫描**：`commit 894d4d2` —— role 级 trackFingerprint（reasoning 解释因果）+ cover 级 trackFingerprints 扫描（独立于 trackScores，解决 D 主线 roleIds=other 永远 0% 的可见性老 bug + 业务方「我会剪映就推 AIGC？」黑盒疑虑）

### GEO 一期：基建 + 内容扩张（2026-04-30）

站内 GEO + pSEO + 自媒体工作流 ship。

- **AI crawler 站点信号**：`commits a437f93 / 825eed7 / 7ddc2d9` —— `robots.txt` allow 19 个 LLM crawler（GPTBot / ClaudeBot / PerplexityBot / Google-Extended / Bytespider 等）+ `sitemap.xml`（一期 218 URL）+ `llms.txt`（llmstxt.org 标准）
- **JSON-LD 全套**：layout 注入 Organization + WebSite + Dataset；首页 FAQPage（8 Q&A）；每个 pSEO 页 Article + Breadcrumb LD
- **pSEO 路由**：14 `/role/[id]` + 12 `/industry/[id]` + 25 `/city/[tier]/[role]` + 65 `/industry/[id]/[role]`（agent-hunt #9 二维切片，commit `23e1d34`）+ 91 `/compare/[a]-vs-[b]` 角色对比（commit `8155524`）
- **Blog 系统**：`commits bf3948c / 017fd10` —— PostShell + 6 篇文章（数据集深度拆解 / 电气工程师 / 教师 / 医生 / 销售 / 应届生），首页 dynamic blog section
- **动态 OG**：`commit 7ddc2d9` —— `/api/og/dynamic` 接 query string 渲染 1200×630 + 800×800（微信方形），6 类 pSEO 页面 metadata 接入数据锚点
- **GSC 验证 + sitemap 提交**：`commit f3d8f24` —— Google Search Console verification meta tag，sitemap 已提交（127 discovered pages，Status: Success）
- **marketing/ 脚手架**：`commit c1de474` —— topics 选题库 + xhs/wechat 标题公式 + ai-mentions queries + baseline-2026-04-30 + check-ai-mentions.ts 脚本骨架
- **Ops 指南**：`marketing/ops-guide.md` —— 腾讯云部署 + GSC/百度/Bing sitemap 提交 + 监测节奏 + 紧急回滚

### GEO 二期：HowTo schema + skills heatmap + RSS + 3 篇 augment blog（2026-05-01）

ship 后生产规模 228 个 static page + RSS feed，sitemap 222 URL。GSC 已 5/1 重新提交 + 4 priority URL Request Indexing。

- **HowTo JSON-LD 三路线**（PR #35 closes #30）—— `/diagnose` / `/diagnose-target` / `/diagnose-augment` 各注入一段 HowTo schema（3 步 + supplies + image），让 AI 在「如何做 AI 求职诊断」类 query 时召回；同时给 3 个 page 加 per-page metadata（title / description / canonical）
- **/skills 35 技能 × 14 角色 heatmap**（PR #36 closes #31）—— 全 SVG SSR（无 client JS，928×1120），cell 颜色 6 档命中率，链接 `/role/[id]?skill=[id]`；含反向查表（每角色 top 5 / 每技能 top 3）+ Article + Dataset JSON-LD；解了一个 Next 16 / React 19 SVG `<title>` JSX 多片段插值的隐藏 bug（用模板字符串绕开）
- **RSS 2.0 feed**（PR #37 closes #32）—— `/blog/feed.xml` 静态路由（force-static + 1h revalidate + atom self link），category 去重 label + tags；layout `<body>` 注入 alternate link 让全站任何页面都能被 RSS reader 自动发现 feed（试过 metadata.alternates.types 但被 page 级 alternates 覆盖）
- **3 篇新 blog**（PR #38 closes #33 top-3 候选）—— `/blog/finance-to-ai`（财务 13 条 AI 增强 JD ¥8-10k vs 金融行业 85 条 ¥30k 但前 3 名是算法/PM/工程师对财务不开口）/ `/blog/hr-to-ai`（HR 系 5-7 条 + 咨询 AI 转型 21 条 ¥13k 才是真机会）/ `/blog/designer-aigc-truth`（媒体 AI 整体 ¥12.5k 比平面设计 ¥18.75k 还低，留制造做 AI 视觉反而稳）
- **GSC 自动化**：sitemap 重新提交 + 4 个 priority URL（/skills + 3 blog）逐个 Request Indexing 全部加入优先抓取队列；用 chrome-devtools computer-use 自动完成
- **分发草稿**：`marketing/distribution-2026-05-01.md` —— 4 天 rollout 排期（5/2 财务 → 5/3 设计师 → 5/4 /skills → 5/5 HR）+ 每页面 3-4 候选小红书标题 + 200-260 字 body + 公众号标题 + 知乎主动答 query 清单 + 视觉素材 + 跟踪指标

### 用户行为分析（v0.5.0，2026-05-11）

匿名 L1 事件 + L2 表单提交持久化，用于用户画像数据飞轮。

- **UUID**：客户端 `crypto.randomUUID()` 存 localStorage `aijobfit_uid`，无需登录，同 UUID 可追踪跨路线行为
- **L1 `/api/track`**：所有漏斗埋点事件同步 POST 到服务端，写 `events` 表（uuid / ts / event_type / route / extra JSON）
- **L2 `/api/submit`**：三路线 Form 在 submit 时 fire-and-forget POST，写 `submissions` 表（route / skills / years_exp / education / city / industry / target_role_id / origin_profession / report_hash / duration_ms / audience 自动推断）
- **存储**：`node:sqlite` Node.js 22 内置模块（无 native addon），DB 文件挂 Docker volume `/data/aijobfit/analytics.db`；`DATA_DIR` env 控制路径
- **数据导出**：`GET /api/admin/export?token=<DATA_ADMIN_TOKEN>&table=submissions|events&fmt=csv|json&limit=N&since=<ts_ms>`；token 默认 `aijobfit-admin-2026`，生产建议通过 env 覆盖
- **Dockerfile fix**：`CMD ["node", "--experimental-sqlite", "server.js"]`（兼容 Node 22.5-22.11）

### Route B 0% 兜底 + 点头就业班（v0.5.1，2026-05-14）

业务方反馈两条调整 ship。

- **Route B 锁定目标 0% 兜底**（PR #44，commit `40183ad`）—— `generateRouteBReport` 在 `top.matchScore === 0` 时把 cover.topRoles[0] 和 roles.topMatches[0] 的 matchScore 同步 floor 到 `ROUTE_B_FALLBACK_SCORE = 5`，并设置 `cover.isLowMatch = true`；ReportCover 检测到信号后在 TARGET 卡片下方追加 amber 兜底块（描述 + 160px AssistantQR），引导用户「调整方向 / 扫码专项推荐」。原始 matchScore 仅作为显示层 floor，whyMatched.zeroHit 等内部信号原状不动
- **路径 B「点头就业班」文案重写** —— ReportPaths 替换原「3800 就业班（适合需要节奏感 + 教练 + 同伴）」为「点头就业班（适合时间比较紧的人）· 三个月全程陪跑 · 项目集成 · 定向课程补差」+「从岗位所需能力倒推 / 你缺什么补什么」+ 34 录播 / 20+ 项目 / 封班强监督 / 简历分析 4 bullet。同时移除 isFreshGrad 文案分支（新文案普适，应届/社招统一）；价格不再硬编码进产品，以运营侧报价为准
- **CI Node 22 修复** —— `.github/workflows/ci.yml` 把 setup-node 从 20 升到 22，build step 加 `NODE_OPTIONS=--experimental-sqlite`。修了 main 自 v0.5.0 起红了 3 天的 CI（`node:sqlite` Node 20 不可用）

### 材料体检子卡（v0.6.0，2026-05-18）

报告页加一张「简历素材体检」卡，零 LLM、纯客户端规则诊断。位置：`</LockedSections>` 下方（开放区，不挡漏斗）；audience-aware 标题（应届=实习经历体检 / 社招=项目经历体检）；三路线 A/B/C 都展示。

- **`src/lib/materialAudit.ts`** — 主入口 `auditMaterial(text, targetRoleId, roles, skills)` 解析出 Track.keySkills + role.required_skills 前 10 项拼成 keywords；辅助入口 `auditMaterialAgainstSkills(text, targetName, targetSkills)` 给 Route C 用 augmentSkills 当目标词。按句切分（`/[。；;.!?！？\n]+/`），每句跑四项规则：技能命中（case-insensitive substring，沿用 `matchTrackKeySkills` 口径）/ 量化检测（`/\d+(\.\d+)?\s*(%|ms|s|分钟|小时|天|倍|条|人|次)/`）/ 大词黑名单（赋能 / 全链路 / 闭环 / 降本增效 / 打通 / 抓手 / 深度结合 / 全方位 / 一站式 / 端到端）/ 句长 > 60 字。
- **`src/components/ReportMaterialAudit.tsx`** — textarea + 体检按钮，逐句渲染 chip（绿=命中 / 黄=缺量化 / 红=大词 / 灰=过长）+ 顶部汇总条 + 未提到的 keySkills tag cloud；只发 `material_audit_run` 计数事件（句数 / 命中数 / 量化缺失数 / 大词数 / 过长数），不上传文本。
- **接入** — `src/app/result/[hash]/ReportClient.tsx` 把 roles/skills 留在 state，渲染时 Route A/B 传 `targetRoleId = topMatches[0].roleId`、Route C 传 `augmentSkills = augment.augmentSkills.map(s => s.skillName)`。
- **C10 acceptance** — `scripts/verify-acceptance.ts` 加 C10，断言：含 ms/% 句通过量化检测 ✓ / 含「赋能」句触发 overclaim ✓ / 无数字句被标 needsQuantification ✓。
- **机制透明** — 卡片底部把规则口径明写出来，和现有 trackFingerprints / whyMatched 同款不黑盒叙事。

### 工程基建

- **CI**：GitHub Actions Node 22 + `--experimental-sqlite` + lint + tsc + build
- **验证**：`scripts/verify-acceptance.ts` 9 个 case（C1-C9 + CT 主线指纹），跑 live agent-hunt 数据
- **运营 / 业务文档**：
  - [`docs/产品手册-运营版.md`](./docs/产品手册-运营版.md) — 话术 / FAQ / 异常处理
  - [`docs/用户流程-图文版.md`](./docs/用户流程-图文版.md) — 移动端截图图文走查
  - [`docs/pdf/`](./docs/pdf/) — md 的 PDF 构建产物
  - `scripts/build-docs-pdf.sh` — md → PDF 一键重建（pandoc + Chrome headless）

## 剩余 open issue

依赖 agent-hunt 数据（supply 端等待）：
- **agent-hunt#11 应届生切片二期**：`roles-graduate-friendly.json` 已 ship 14 角色（aijobfit 已接入），但 augmentSkills 应届版 / `applicantSignal` 等待 supply-side 数据
- **agent-hunt#10 augmentSkills 提取质量**：产品经理只有 2 个 augmentSkills（computer_vision + llm 各 count=1），影响 Route C readiness 档位精度

aijobfit 仓库 GitHub OPEN issue（5-01 二期 ship 后同步）：
- **#13 微信生态实机全链路测试**：手机微信扫 QR → 加好友 → 拿激活码（用户手动测）
- **#14 漏斗埋点观察期 + 门槛调优**
- **#39 提交 sitemap 到百度 / Bing / 360 / 搜狗**（GSC 已完成）
- **#40 4 天排期发布 5/1 batch**（小红书 / 知乎 / 公众号，按 `marketing/distribution-2026-05-01.md`）
- **#41 5/8 GSC soak check**：4 priority URL 抓取状态 + site: 收录数 + 6-baseline AI-mention 复检（已配自动 routine `trig_014fge7MQLHZs5mLB5yFdH4E`，5/8 02:00 UTC 触发，结果自动 post 到 issue 评论）
- **#42 #33 残留 2/5 候选**：零售门店 + AI / 反贩卖焦虑系列（低优先，等 5/1 batch 数据出来再决定要不要继续）

非代码（持续观察）：
- GSC 收录数据观察期：5/1 重新提交 sitemap + 4 priority URL 加 priority queue，5/8 自动 routine 复检
- AI 引用监测每月跑 `marketing/scripts/check-ai-mentions.ts`（需 PERPLEXITY_API_KEY）
- 视觉 · 业务方实测后的 UX 反馈再迭代

## 历史已关闭 issue

#1 付费墙 · #2 PDF（pivot 废弃）· #3 agent-hunt refetch · #4 部署 · #5-#12 早期迭代 · #15 路线 B · #16 应届生 · #17 5 主线 E · #18 whyMatched · #19 行业 × 岗位维度 · #20 主线透明化 · #21 报告兜底 CTA · 业务方反馈 P0/P1/P2 重构（2026-04-29 → 04-30）· agent-hunt#9 行业 × 角色二维切片（aijobfit 接入 5-01，commit `23e1d34`）· **GEO 二期（2026-05-01）**: #30 HowTo schema 三路线 / #31 /skills heatmap / #32 RSS feed / #33 更多 blog 题材（top-3 候选 finance/HR/designer 已 ship，2/5 残留候选移到 #42）/ #34 LCP warning
