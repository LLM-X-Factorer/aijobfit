# AIJobFit - 非程序员 AI 求职定位诊断

用 2370+ 条真实 JD 数据帮你判断你适合做什么 AI 岗位。

**Live:** [aijobfit.llmxfactor.cloud](https://aijobfit.llmxfactor.cloud)

## What is this

付费漏斗中段产品（目前以**免费版**对外开放），对标 vibe-check / DevBug 的病毒传播设计，但走数据 + 诚信路线：

- 10 个表单字段 → 14 个真实角色匹配 → 7 节诊断报告
- 数据来自 [Agent Hunt](https://github.com/LLM-X-Factorer/agent-hunt)（2370 条 JD、14 国内角色聚类）
- 报告里诚实推荐免费学习资源（Datawhale / 阿里云 ModelScope / B 站李宏毅...）
- 每份报告都能生成**动态 OG 图**（微信/X 分享有缩略图）和 **1080×1920 分享海报**
- 报告 URL = base64 编码用户输入，刷新/分享都能重现

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4（冷蓝理性风，#2563EB 主色）
- **OG 图:** `@vercel/og` 动态生成 1200×630 PNG，中文字体走 `fonts.googleapis.cn`
- **分享海报:** 客户端 Canvas 画 1080×1920 竖版
- **Data Source:** Agent Hunt JSON（首版 fallback 到 `public/data/`，未来切远程 fetch）
- **Deployment:** Docker + Nginx

## Current Status

| 里程碑 | 状态 |
| --- | --- |
| Phase 1 — 表单 → 匹配 → 7 节报告 → 可分享 URL | ✅ |
| Phase 2 — OG 图生成（首页 + 动态报告 OG） | ✅ |
| Phase 2 — Canvas 分享海报（1080×1920） | ✅ |
| Phase 2 — 支付墙 / PDF 导出 / 数据 refetch | 见 GitHub Issues |
| Phase 3 — Docker 镜像 + nginx 配置 | ✅（本地验证）|
| Phase 3 — 腾讯云 Lighthouse 部署 | 🔜 |

## Getting Started

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## Docker Deployment

```bash
docker compose up -d --build
```

容器监听 3004:3000。生产部署步骤：

1. 服务器上 `git clone` + `docker compose up -d --build`
2. DNS：`aijobfit.llmxfactor.cloud` A 记录 → 服务器公网 IP
3. Nginx 反代 `127.0.0.1:3004`（参考 `vibe-check` 同机部署模式）
4. SSL：`certbot --nginx -d aijobfit.llmxfactor.cloud --redirect`

生产构建时会注入 `NEXT_PUBLIC_SITE_URL=https://aijobfit.llmxfactor.cloud`（在 `docker-compose.yml` 里），让客户端 bundle 的 QR 和 metadata OG 绝对 URL 指向生产域名。

## Data Update

当前 `public/data/roles-domestic.json` 和 `skills.json` 是 agent-hunt v0.6 的快照。
未来 `agent-hunt.pages.dev` 重新部署后，`src/lib/fetchAgentHunt.ts` 会自动优先走远程，失败 fallback 到本地。无需改代码。

## License

MIT
