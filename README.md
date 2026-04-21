# AIJobFit - 非程序员 AI 求职定位诊断

用 2370+ 条真实 JD 数据帮你判断你适合做什么 AI 岗位。

**Live:** [aijobfit.llmxfactor.cloud](https://aijobfit.llmxfactor.cloud)（待部署）

## What is this

付费漏斗中段的 9.9 元诊断产品，对标 vibe-check / DevBug 的病毒传播设计但走数据 + 诚信路线：

- 10 个表单字段 → 14 个真实角色匹配 → 7 节诊断报告
- 数据来自 [Agent Hunt](https://github.com/LLM-X-Factorer/agent-hunt)（2370 条 JD、14 国内角色聚类、SCI 评分）
- 报告里诚实推荐免费学习资源（Datawhale / 阿里云 ModelScope / B 站李宏毅...）
- URL 可分享，分享 URL 即重现报告

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4（冷蓝理性风，#2563EB 主色）
- **Data Source:** Agent Hunt JSON（首版 fallback 到 `public/data/`，待远端部署 v0.6 数据后改为远程 fetch）
- **Deployment:** Docker + Nginx

## Phase 1 边界

- ✅ 表单 → 匹配算法 → 7 节报告 → 可分享 URL
- ❌ 不做支付集成（Phase 2）
- ❌ 不做 PDF 导出（Phase 2）
- ❌ 不做 Canvas 海报（Phase 2）
- ❌ 不调任何付费 LLM API（所有计算都在浏览器本地）

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

Runs on port 3004. Configure Nginx reverse proxy for your domain.

## 数据更新

当前 `public/data/roles-domestic.json` 和 `skills.json` 是从 agent-hunt v0.6 复制过来的快照。
未来 agent-hunt.pages.dev 部署 v0.6 后，可改为远程 fetch（`src/lib/fetchAgentHunt.ts` 已留好接口）。

## License

MIT
