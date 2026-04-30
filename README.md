# AIJobFit — 非程序员 AI 求职定位诊断

> 用 5000+ 条真实 AI 岗位 JD 数据（runtime 拉 agent-hunt narrative-stats），10 分钟告诉非程序员：你适合做什么 AI 岗位、缺什么技能、怎么补；如果你不想转行，怎么在原行业加 AI 技能让自己更值钱。

**Live:** [aijobfit.llmxfactor.cloud](https://aijobfit.llmxfactor.cloud)

## 产品定位

**永久免费 + 加微信漏斗**。本 app 不做产品内付费；商业化走产品外部渠道（1v1 / 社群 / 课程），与本仓库解耦。

**三条路线并行**（首页 B + C 双主 CTA，A 兜底链接）：

- **路线 A · 帮我定位**（`/diagnose`）：用户填技能 + 背景，系统推 Top 3 角色 + 4 主线分布 + Gap/路径/Action
- **路线 B · 转行 Gap 诊断**（`/diagnose-target`）：用户已有目标，锁定行业 + 14 角色之一 → 围绕该目标算匹配率 + Gap，不再推 Top 3
- **路线 C · 留行 + AI 增强**（`/diagnose-augment`）：用户保留原职业（free-text → 模糊匹配 420 entry）+ 加 AI 技能。看「原职业 + AI 增强真实 JD」+ augmentSkills 准备度档位，不转行

三条路线的报告页用同一个 `/result/[hash]` 渲染，按 `input.route` 切节内容。报告底部互推 CTA 让用户随时换条路线（带 ?from=hash 预填，无重填）。

**双一等受众**：社招用户 + 应届生 / 学生（含在读、应届无实习、应届有实习）。表单分支 + 报告路径文案做应届/社招差异化；audience=fresh-grad 时 cover/roles/salary 注入「校招 vs 社招」对照（接 agent-hunt `roles-graduate-friendly.json`）。

漏斗机制：
- 用户填 3 步表单 → 报告生成
- 前 3 节（封面 / 角色市场全景 / 薪资）开放
- 后 4 节（技能 Gap / 学习路径 / 7-30-90 天行动 / 免费资源）遮罩
- 扫码加小助理微信拿统一激活码 `AIJOB-2026` 解锁
- 激活码永久有效（本设备 localStorage）

数据来自开源项目 [Agent Hunt](https://github.com/LLM-X-Factorer/agent-hunt)（runtime 拉 7 个 endpoint，aijobfit 不存数据）：
- 14 角色聚类 + 36 项 AI 技能词典
- 行业 × AI 增强 JD 薪资分布
- 14 角色 × 城市 tier 薪资
- 420 个原职业 × AI 增强真实 JD（Route C 数据基底）
- 14 角色 × 应届友好度（应届分支用）
- narrative-stats（jdTotal / 行业 breakdown / 幽灵岗等元数据）

## 5 主线总览

A AI PM / B AI 运营 / C AI 转型咨询 / D AIGC 创意（A-D 是「转行」轨道，对应 14 角色聚类）+ **E 留行 + AI 增强**（不归 14 角色聚类，归 420 原职业 × AI 增强）。E 主线在首页 TrackOverview 用 emerald 视觉与 ABCD 蓝色区分，jdCount/medianSalary 由 server-side 实时算（`TrackOverviewServer`）。

## 功能亮点

- **三路线 UX**：A 推荐 / B 转行 / C 留行 + 共享报告页 + 三路线互通 CTA + 跨路线 ?from=hash 预填
- **诚实匹配算法**：稀疏角色置信度惩罚 / 0-match fallback 兜底 / targetTrack 1.2× 加成 / **industry hard filter ×0.3**（行业不匹配强降权）/ 高学历惩罚 ×0.5
- **机制透明**：每个推荐角色显示 `whyMatched` 推理链；cover 加 **trackFingerprints** 扫描，让用户看见「我勾选剪映 → 命中 D 主线 keySkills 3/5」的因果链，不是黑盒
- **行业切片**：cover/roles/salary 按用户行业（form 选 + currentJob 推断）切片。「教育 + PM」用户看教育切片 ¥14.5k/25k/37.5k，不是泛 25k 全国
- **薪资达成概率**：填 35k 显示「约 X% 岗位能开到」（percentile 桶 75/50/25/10/5%），加城市 tier 对照「你所在新一线 ¥32k vs 全国 ¥30k +7%」
- **路线 C 留行版**：Route C 用 readiness 4 档（第一梯队 / 中梯 / 起步 / 数据不足）替代「匹配率」语义，避免对长尾职业过度承诺
- **应届分支差异化**：audience=fresh-grad 时 cover.gradContext + roles.gradBreakdown + salary.freshComparison（「校招 ¥7.5k vs 社招 ¥25k +233%」）
- **数据透明**：每个判断都附带 JD 来源（"基于 X 条真实 JD"）；首页 5 主线分支展示 keySkills / targetUsers / 实时 JD 数 / 中位月薪
- **移动端优先**：375px 基线，微信 WebView 兼容
- **分享友好**：动态 OG 图（1200×630 + 微信友好的方形 800×800）、1080×1920 竖版海报；按 route 切版式
- **漏斗埋点**：form_submit / route_b_submit / route_c_submit / report_view / report_reject_top3_click / report_b_reselect_target_click / report_b_switch_to_a_click / report_a_to_c_click / report_b_to_c_click / report_c_to_b_click / report_c_to_a_click / mask_see / code_enter_{success,fail}
- **CI 绿**：GitHub Actions 跑 lint + tsc + build

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4（冷蓝 `#2563EB` + 留行/应届/第一梯队 emerald）
- **OG:** `@vercel/og` 动态生成，中文字体 `public/fonts/` 本地优先 + `fonts.googleapis.cn` fallback
- **Share poster:** 客户端 Canvas 画 1080×1920 竖版
- **Deployment:** Docker + Nginx + certbot SSL（腾讯云 Lighthouse）

## Getting Started

```bash
npm install
npm run dev             # http://localhost:3000
npm run build           # 生产 standalone 构建
npm run lint            # ESLint
npx tsx scripts/verify-acceptance.ts  # 9 个端到端验收 case，拉 live agent-hunt 数据
```

## Docker 部署

```bash
docker compose up -d --build
# 容器监听 3004:3000
```

**生产部署**（已跑在 `aijobfit.llmxfactor.cloud`）：

1. 服务器 `git pull` + `docker compose up -d --build`
2. DNS：`aijobfit.llmxfactor.cloud` A 记录 → 公网 IP
3. Nginx 反代 `127.0.0.1:3004`（同机 vibe-check 在 3003）
4. certbot：`certbot --nginx -d aijobfit.llmxfactor.cloud --redirect`

`NEXT_PUBLIC_SITE_URL` 在 `docker-compose.yml` 的 `build.args` 注入，让客户端 bundle 的 QR、metadata、OG 绝对 URL 都指向生产域名。

## 项目结构

```
src/
  app/
    page.tsx                              async server 首页（B+C 主 CTA + A 兜底 + 5 主线总览）
    diagnose/page.tsx                     路线 A 表单页 + 跨路线提示
    diagnose-target/page.tsx              路线 B 表单页 + 跨路线提示
    diagnose-augment/page.tsx             路线 C 表单页 + 跨路线提示
    result/[hash]/
      page.tsx                            metadata（2 套 og:image）
      ReportClient.tsx                    报告 + 顶栏 + 按 route 切底部三路线互通 CTA
    api/
      og/route.tsx                        站点级 OG 1200×630
      og/[hash]/route.tsx                 动态 OG 1200×630（按 route 切 label）
      og-square/route.tsx                 站点级方形 OG 800×800（微信）
      og-square/[hash]/route.tsx          动态方形 OG（按 route 切 label）
  components/
    Report*.tsx                           7 节报告（按 route + audience 切渲染）
    ReportFallbackNotice.tsx              0-match 兜底提示
    LockedSections.tsx                    后 4 节软门槛 + 激活码
    AssistantQR.tsx                       小助理微信 QR
    DiagnosisForm.tsx                     路线 A 多步表单
    DiagnosisFormB.tsx                    路线 B 多步表单（锁定 14 角色）
    DiagnosisFormC.tsx                    路线 C 多步表单（free-text 原职业 + 实时数据集预览 + alternatives chips）
    FormFieldRender.tsx                   字段渲染 helper（A/B/C 共用）
    TrackOverview.tsx                     5 主线卡片（pure presentation，client-safe）
    TrackOverviewServer.tsx               server wrapper：runtime 算 E 主线 jdCount / medianSalary / professionCount
    SharePoster.tsx                       1080×1920 海报（按 route 切版式）
  lib/
    matching.ts                           14 角色匹配 + industry hard filter + whyMatched + trackFingerprint
    professionMatch.ts                    free-text 原职业 → 420 entry 模糊匹配（exact + fuzzy + MIN_VACANCY 门槛）
    reportGen.ts                          7 节报告生成（A/B/C 三分发 + industry slice + achievement rate + city tier + grad slice + fingerprint scan）
    audience.ts                           fresh-grad / social 推断
    track.ts                              漏斗埋点
    useragent.ts                          isWeChat / isMobile
    ogFont.ts                             字体加载
    fetchAgentHunt.ts                     7 个 endpoint 客户端 fetcher（远程优先）
    encoding.ts                           base64url 编码（route="A"|"B"|"C" + targetRoleId / originProfession）
    serverData.ts                         7 个 endpoint server loader（OG / SSR）
  data/
    tracks.ts                             5 主线元数据 + TRANSITION_TRACKS（ABCD-only）
    form-fields.ts                        表单字段定义（含应届生分支）
    free-resources.ts                     5 主线分类资源（含 E 留行专属）
    profession-to-industry.ts             静态映射：电气工程师→manufacturing 等 30+ 常见原职业
docs/
  产品手册-运营版.md                       运营科普手册（FAQ / 话术 / 漏斗说明）
  用户流程-图文版.md                       移动端截图图文走查
  screenshots/                            375px 用户流程截图
  pdf/                                    md 的 PDF 构建产物（直接发给业务方）
scripts/
  build-docs-pdf.sh                       md → PDF（pandoc + Chrome headless）
  verify-acceptance.ts                    9 个端到端验收 case
public/
  data/                                   agent-hunt 数据本地快照（fallback 用）
  qr-assistant.png                        小助理微信 QR
  fonts/                                  Noto Sans SC woff2（OG 用）
```

## 数据流

`src/lib/fetchAgentHunt.ts` 客户端先尝试 `https://agent-hunt.pages.dev/data/*.json`，失败 fallback 到 `public/data/` 本地快照。`src/lib/serverData.ts` server 端反过来：本地快照优先（`roles-domestic.json` / `skills.json`），其他 endpoint 远程拉 + null fallback。

agent-hunt 已 ship 7 个 endpoint，aijobfit 全部已接入；数据 schema 变化时同步检查 `fetchAgentHunt.ts` 类型即可。

## 运营 / 业务请看

两份配套：
- 👉 [`docs/用户流程-图文版.md`](./docs/用户流程-图文版.md) — 移动端截图图文走查，看用户屏幕上发生了什么（[PDF](./docs/pdf/用户流程-图文版.pdf)）
- 👉 [`docs/产品手册-运营版.md`](./docs/产品手册-运营版.md) — 加好友后的话术模板 / FAQ / 异常处理（[PDF](./docs/pdf/产品手册-运营版.pdf)）

PDF 是 md 改动后跑 `./scripts/build-docs-pdf.sh` 重新生成的（依赖 macOS pandoc + Chrome）。

## License

MIT
