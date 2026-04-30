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
- `src/lib/track.ts` — 漏斗埋点
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
- `.github/workflows/ci.yml` — push/PR → npm ci → lint → tsc → build

## Design Principles

- 冷蓝理性风（#2563EB），E 主线 + 应届生 + readiness 第一梯队 用 emerald
- 数据优先于结论：每个判断都附带 JD 数据来源（vacancyCount / sampleSize / industry / tier）
- 诚实推免费资源，不为了卖课故意写差
- 不打饥饿营销 / 不催买
- 报告 URL = base64 编码用户输入，刷新/分享都能重现
- **机制透明**：whyMatched reasoning + trackFingerprints + readiness 档位 + isFallback 提示，让用户看到「为什么是这个推荐」而不是黑盒

## 产品已锁定的决策（不再重新讨论）

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

### 工程基建

- **CI**：GitHub Actions lint + tsc + build
- **验证**：`scripts/verify-acceptance.ts` 9 个 case（C1-C9 + CT 主线指纹），跑 live agent-hunt 数据
- **运营 / 业务文档**：
  - [`docs/产品手册-运营版.md`](./docs/产品手册-运营版.md) — 话术 / FAQ / 异常处理
  - [`docs/用户流程-图文版.md`](./docs/用户流程-图文版.md) — 移动端截图图文走查
  - [`docs/pdf/`](./docs/pdf/) — md 的 PDF 构建产物
  - `scripts/build-docs-pdf.sh` — md → PDF 一键重建（pandoc + Chrome headless）

## 剩余 open issue

依赖 agent-hunt 数据：
- **agent-hunt#9 行业 × 角色二维切片**：业务方原话「教培行业里数据分析师空缺多少 · 中位数多少」直接卡这里。aijobfit 这边 cover.industryContext 当前是「行业总 AI 增强 JD」，等 #9 ship 后 30 分钟可升级到「教育行业 PM 14 条 JD · 中位 ¥25k · sampleTitles」
- **agent-hunt#11 应届生切片二期**：`roles-graduate-friendly.json` 已 ship 14 角色（aijobfit 已接入），但 augmentSkills 应届版 / `applicantSignal` 等待 supply-side 数据
- **agent-hunt#10 augmentSkills 提取质量**：产品经理只有 2 个 augmentSkills（computer_vision + llm 各 count=1），影响 Route C readiness 档位精度

非代码：
- 测试 · 微信实机全链路（手机微信扫 QR → 加好友 → 拿激活码）
- 数据 · 漏斗埋点观察期 + 门槛调优决策
- 视觉 · 业务方实测后的 UX 反馈再迭代

## 历史已关闭 issue

#1 付费墙 · #2 PDF（pivot 废弃）· #3 agent-hunt refetch · #4 部署 · #5-#12 早期迭代 · #15 路线 B 上线 · #18 whyMatched · #20 主线透明化 · #21 报告兜底 CTA · #16 应届生（前端 + 文案部分 + 数据切片接入）· #17 5 主线 E 落地 · 业务方反馈 P0/P1/P2 重构（2026-04-29 → 04-30）
