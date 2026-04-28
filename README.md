# AIJobFit — 非程序员 AI 求职定位诊断

> 用 2370+ 条真实 AI 岗位 JD 数据，10 分钟告诉非程序员：你适合做什么 AI 岗位、缺什么技能、怎么补。

**Live:** [aijobfit.llmxfactor.cloud](https://aijobfit.llmxfactor.cloud)

## 产品定位

**永久免费 + 加微信漏斗**。本 app 不做产品内付费；商业化走产品外部渠道（1v1 / 社群 / 课程），与本仓库解耦。

漏斗机制：
- 用户填 3 步表单（10 字段）→ 报告生成
- 前 3 节（封面 / Top 3 角色 / 薪资）完全开放
- 后 4 节（技能 Gap / 学习路径 / 7-30-90 天行动 / 免费资源）遮罩
- 扫码加小助理微信拿统一激活码 `AIJOB-2026` 解锁
- 激活码永久有效（本设备 localStorage）

数据来自开源项目 [Agent Hunt](https://github.com/LLM-X-Factorer/agent-hunt) v0.6：2370 条 JD、14 国内角色聚类、4 主线（A AI PM / B AI 运营 / C AI 转型咨询 / D AIGC 创意）。

## 功能亮点

- **诚实匹配算法**：稀疏角色置信度惩罚、0-match fallback 兜底（锚点 hoist + 文案解释）、targetTrack 1.2× 加成
- **数据透明**：每个判断都附带 JD 来源（"基于 293 条 AI 产品经理 JD"）
- **移动端优先**：375px 基线，微信 WebView 兼容（isWeChat 检测 + clipboard 降级）
- **分享友好**：动态 OG 图（1200×630 + 微信友好的方形 800×800）、1080×1920 竖版海报
- **漏斗埋点**：5 事件链路可观测（form_submit / report_view / mask_see / code_enter_*）
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
    page.tsx                           首页
    diagnose/page.tsx                  3 步表单
    result/[hash]/
      page.tsx                         metadata（2 套 og:image）
      ReportClient.tsx                 客户端报告 + 顶栏
    api/
      og/route.tsx                     站点级 OG 1200×630
      og/[hash]/route.tsx              动态 OG 1200×630
      og-square/route.tsx              站点级方形 OG 800×800（微信）
      og-square/[hash]/route.tsx       动态方形 OG
  components/
    Report*.tsx                        7 节报告组件
    ReportFallbackNotice.tsx           0-match 兜底提示
    LockedSections.tsx                 后 4 节软门槛 + 激活码
    AssistantQR.tsx                    小助理微信 QR 组件
    DiagnosisForm.tsx                  多步表单
    SharePoster.tsx                    1080×1920 海报
  lib/
    matching.ts                        14 角色匹配 + 置信度惩罚
    reportGen.ts                       7 节报告 + fallback 机制
    track.ts                           漏斗埋点
    useragent.ts                       isWeChat / isMobile
    ogFont.ts                          字体加载（本地优先）
    fetchAgentHunt.ts                  数据 fetch（远程优先）
    encoding.ts                        base64url 编码
    serverData.ts                      server 端读 JSON
  data/
    tracks.ts                          4 主线元数据
    form-fields.ts                     表单字段
    free-resources.ts                  免费资源清单

docs/
  产品手册-运营版.md                    运营科普手册（FAQ / 话术模板 / 漏斗说明）

public/
  data/                                agent-hunt v0.6 数据快照
  qr-assistant.png                     小助理微信 QR
  fonts/                               (空，生产可放 Noto Sans SC woff2)
```

## 数据更新策略

`src/lib/fetchAgentHunt.ts` 客户端先尝试 `https://agent-hunt.pages.dev/data/*.json`，失败 fallback 到 `public/data/` 本地快照。agent-hunt 发新版本后自动切远程，无需 aijobfit 侧改代码（见 [agent-hunt#7](https://github.com/LLM-X-Factorer/agent-hunt/issues/7)）。

## 运营同学请看

👉 [`docs/产品手册-运营版.md`](./docs/产品手册-运营版.md) 包含产品 pitch、用户漏斗、加好友话术模板、FAQ 7 条、激活码机制说明。

## License

MIT
