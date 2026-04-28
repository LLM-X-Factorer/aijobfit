# AIJobFit — 非程序员 AI 求职定位诊断

> 用 2370+ 条真实 AI 岗位 JD 数据，10 分钟告诉非程序员：你适合做什么 AI 岗位、缺什么技能、怎么补。

**Live:** [aijobfit.llmxfactor.cloud](https://aijobfit.llmxfactor.cloud)

## 产品定位

**永久免费 + 加微信漏斗**。本 app 不做产品内付费；商业化走产品外部渠道（1v1 / 社群 / 课程），与本仓库解耦。

**两条路线并行**：

- **路线 A · 帮我定位**（`/diagnose`）：用户填技能 + 背景，系统推 Top 3 角色 + 4 主线分布 + Gap/路径/Action
- **路线 B · 目标 Gap 诊断**（`/diagnose-target`）：用户已经有目标，锁定行业 + 岗位 → 围绕该目标算匹配率 + Gap，不再推 Top 3

两条路线的报告页用同一个 `/result/[hash]` 渲染，按 `input.route` 切节内容。报告底部互推 CTA 让用户随时换条路线（带 ?from=hash 预填，无重填）。

**双一等受众**：社招用户 + 应届生 / 学生（含在读、应届无实习、应届有实习），表单分支 + 报告路径文案做应届/社招差异化。

漏斗机制：
- 用户填 3 步表单（路线 A 10 字段 / 路线 B 类似但锁定目标）→ 报告生成
- 前 3 节（封面 / Top 3 或锁定目标 / 薪资）完全开放
- 后 4 节（技能 Gap / 学习路径 / 7-30-90 天行动 / 免费资源）遮罩
- 扫码加小助理微信拿统一激活码 `AIJOB-2026` 解锁
- 激活码永久有效（本设备 localStorage）

数据来自开源项目 [Agent Hunt](https://github.com/LLM-X-Factorer/agent-hunt) v0.6：2370 条 JD、14 国内角色聚类、4 主线（A AI PM / B AI 运营 / C AI 转型咨询 / D AIGC 创意）。

## 功能亮点

- **双路线 UX**：路线 A 推荐 / 路线 B 目标锁定 + 共享报告页 + 双向 CTA + 跨路线 ?from=hash 预填
- **诚实匹配算法**：稀疏角色置信度惩罚、0-match fallback 兜底（锚点 hoist + 文案解释）、targetTrack 1.2× 加成
- **报告可解释性**：每个推荐角色显示 whyMatched 推理链（命中骨架 + 加权折扣 + 行业匹配 + 0 命中诚实声明）
- **数据透明**：每个判断都附带 JD 来源（"基于 293 条 AI 产品经理 JD"）；首页 + 表单展示 4 主线分支（targetUsers / keySkills / JD 数 / 中位月薪）
- **应届生分支**：yearsExp 含在读学生 / 应届无实习 / 应届有实习，路径与 7/30/90 天 Action 按 audience 切到校招 / 实习节奏
- **移动端优先**：375px 基线，微信 WebView 兼容（isWeChat 检测 + clipboard 降级）
- **分享友好**：动态 OG 图（1200×630 + 微信友好的方形 800×800）、1080×1920 竖版海报；路线 B 海报 / OG 自动切到锁定目标版式
- **漏斗埋点**：form_submit / route_b_submit / report_view / report_reject_top3_click / report_b_reselect_target_click / report_b_switch_to_a_click / mask_see / code_enter_{success,fail}
- **CI 绿**：GitHub Actions 跑 lint + tsc + build

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4（冷蓝理性风 `#2563EB`）
- **OG:** `@vercel/og` 动态生成，中文字体 `public/fonts/` 本地优先 + `fonts.googleapis.cn` fallback
- **Share poster:** 客户端 Canvas 画 1080×1920 竖版
- **Deployment:** Docker + Nginx + certbot SSL（腾讯云 Lighthouse）

## Getting Started

```bash
npm install
npm run dev             # http://localhost:3000
npm run build           # 生产 standalone 构建
npm run lint            # ESLint
```

## Docker 部署

```bash
docker compose up -d --build
# 容器监听 3004:3000
```

**生产部署**（已跑在 `aijobfit.llmxfactor.cloud`）：

1. 服务器 `git clone` + `docker compose up -d --build`
2. DNS：`aijobfit.llmxfactor.cloud` A 记录 → 公网 IP
3. Nginx 反代 `127.0.0.1:3004`（同机 vibe-check 在 3003）
4. certbot：`certbot --nginx -d aijobfit.llmxfactor.cloud --redirect`

`NEXT_PUBLIC_SITE_URL` 在 `docker-compose.yml` 的 `build.args` 注入，让客户端 bundle 的 QR、metadata、OG 绝对 URL 都指向生产域名。

## 项目结构

```
src/
  app/
    page.tsx                           首页（双 CTA + 4 主线总览）
    diagnose/page.tsx                  路线 A 表单页（Suspense for ?from prefill）
    diagnose-target/page.tsx           路线 B 表单页（同上）
    result/[hash]/
      page.tsx                         metadata（2 套 og:image）
      ReportClient.tsx                 客户端报告 + 顶栏 + 路线相关底部 CTA
    api/
      og/route.tsx                     站点级 OG 1200×630
      og/[hash]/route.tsx              动态 OG 1200×630（按 route 切 label）
      og-square/route.tsx              站点级方形 OG 800×800（微信）
      og-square/[hash]/route.tsx       动态方形 OG（按 route 切 label）
  components/
    Report*.tsx                        7 节报告组件（Cover/Roles 按 route 切渲染；Paths/Actions 按 audience 切文案）
    ReportFallbackNotice.tsx           0-match 兜底提示
    LockedSections.tsx                 后 4 节软门槛 + 激活码
    AssistantQR.tsx                    小助理微信 QR 组件
    DiagnosisForm.tsx                  路线 A 多步表单（?from 预填）
    DiagnosisFormB.tsx                 路线 B 多步表单（锁定行业+岗位 + ?from 预填 + step 2/3 已锁目标 banner）
    FormFieldRender.tsx                表单字段渲染 helper（路线 A/B 共用）
    TrackOverview.tsx                  4 主线卡片（首页 + DiagnosisForm step 2 折叠面板）
    SharePoster.tsx                    1080×1920 海报（路线 B 切到锁定目标版式）
  lib/
    matching.ts                        14 角色匹配 + 置信度惩罚 + whyMatched 推理 + lockedRoleId 选项
    reportGen.ts                       7 节报告（路线 A 全量 + Top 3；路线 B 仅锁定角色）+ fallback 机制
    audience.ts                        受众类型推断（fresh-grad / social）
    track.ts                           漏斗埋点
    useragent.ts                       isWeChat / isMobile
    ogFont.ts                          字体加载（本地优先）
    fetchAgentHunt.ts                  数据 fetch（远程优先）
    encoding.ts                        base64url 编码（含 route + targetRoleId 字段）
    serverData.ts                      server 端读 JSON
  data/
    tracks.ts                          4 主线元数据
    form-fields.ts                     表单字段（含应届生分支）
    free-resources.ts                  免费资源清单

docs/
  产品手册-运营版.md                    运营科普手册（FAQ / 话术模板 / 漏斗说明）
  用户流程-图文版.md                    14 截图图文版用户流程走查（业务方/运营 onboarding 用）
  screenshots/                         移动端 375px 用户流程截图
  pdf/                                 上面两份 md 的 PDF 构建产物（直接发给业务方）

scripts/
  build-docs-pdf.sh                    md → PDF 构建脚本（pandoc + Chrome headless）
  docs-pdf.css                         PDF 输出样式

public/
  data/                                agent-hunt v0.6 数据快照
  qr-assistant.png                     小助理微信 QR
  fonts/                               (空，生产可放 Noto Sans SC woff2)
```

## 数据更新策略

`src/lib/fetchAgentHunt.ts` 客户端先尝试 `https://agent-hunt.pages.dev/data/*.json`，失败 fallback 到 `public/data/` 本地快照。agent-hunt 发新版本后自动切远程，无需 aijobfit 侧改代码（见 [agent-hunt#7](https://github.com/LLM-X-Factorer/agent-hunt/issues/7)）。

## 运营 / 业务请看

两份配套：
- 👉 [`docs/用户流程-图文版.md`](./docs/用户流程-图文版.md) — 14 张移动端截图图文走查，看用户屏幕上发生了什么（[PDF](./docs/pdf/用户流程-图文版.pdf)）
- 👉 [`docs/产品手册-运营版.md`](./docs/产品手册-运营版.md) — 加好友后的话术模板 / FAQ / 异常处理（[PDF](./docs/pdf/产品手册-运营版.pdf)）

PDF 是 md 改动后跑 `./scripts/build-docs-pdf.sh` 重新生成的（依赖 macOS pandoc + Chrome）。

## License

MIT
