# AIJobFit — 9.9 元 AI 求职诊断

## Overview

非程序员 AI 求职定位诊断，付费漏斗中段产品。基于 [Agent Hunt](https://github.com/LLM-X-Factorer/agent-hunt) 的 2370+ JD 数据 + 14 国内角色聚类，把用户的技能/年限/学历匹配到 Top 3 角色并生成 7 节诊断报告。

漏斗位置：内容 → **9.9 诊断（本项目）** → 3800 就业班 → 999+ 1V1。

## Tech Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + @vercel/og

## Commands

```bash
npm run dev    # Dev server (port 3000)
npm run build  # Production build (standalone output)
```

## Architecture

- `src/data/tracks.ts` — 4 主线（A AI PM / B AI 运营 / C AI 转型咨询 / D AIGC 创意）元数据
- `src/data/form-fields.ts` — 10 字段表单定义（5 必填 + 5 推荐）
- `src/data/free-resources.ts` — 按主线分的免费资源清单（来自 agent-hunt 9.9 报告模板第 5 节）
- `src/lib/fetchAgentHunt.ts` — 拉 agent-hunt JSON（roles / skills），先尝试远程后 fallback 到 `/data/`
- `src/lib/matching.ts` — 用户技能 → 14 角色匹配算法（returns Top 3）
- `src/lib/reportGen.ts` — UserInput + roles → 7 节报告 JSON
- `src/lib/encoding.ts` — base64 URL 编码用户输入，便于分享
- `src/components/Report*.tsx` — 7 节报告组件（Cover/Roles/Salary/Gap/Paths/Actions/Meta）
- `src/components/DiagnosisForm.tsx` — 多步表单
- `src/app/page.tsx` — 首页 Hero + 数据锚点 + 卖点
- `src/app/diagnose/page.tsx` — 表单页
- `src/app/result/[hash]/page.tsx` — 报告页（hash decode → matching → 渲染）

## Data Source

首版 fallback：`public/data/roles-domestic.json` + `skills.json`（v0.6 快照）。
未来切远程：`https://agent-hunt.pages.dev/data/*.json`（roles 文件待 agent-hunt 重新部署后才能远程拉）。

## Design Principles

- 冷蓝理性风（#2563EB），区别于 vibe-check 的暗黑嘲讽
- 数据优先于结论：每个判断都附带 JD 数据来源
- 诚实推免费资源，不为了卖课故意写差
- 不打饥饿营销 / 不催买
- 报告 URL = base64 编码用户输入，刷新/分享都能重现

## Phase 1 Boundary

不做：支付、PDF 导出、Canvas 海报、付费 LLM 调用。
所有计算都在浏览器本地（pure JS matching + 静态 JSON 数据）。

## Deployment

Docker + Nginx on Tencent Cloud Lighthouse. Port 3004 mapped to container 3000.
Domain: aijobfit.llmxfactor.cloud
