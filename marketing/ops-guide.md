# Ops 操作指南

代码 ship 后需要用户手动操作的部分：**生产部署 + 搜索引擎站点登记**。这些动作不能由代码自动化（涉及 ssh 凭据 / 平台账号），整理成 checklist 在这里。

---

## 1. 部署到生产（腾讯云 Lighthouse）

每次 `main` 分支有新 commit 后，都要重新部署一次让生产生效。

### 前置确认

- 腾讯云 Lighthouse 实例可 ssh 登录
- 实例上已有 `aijobfit/` 仓库 clone（位置取决于历史部署习惯，常见 `/home/<user>/aijobfit` 或 `/root/aijobfit`）
- 同一台机器上 `vibe-check` 占 3003 端口，aijobfit 占 3004（不冲突）
- `docker compose` 已安装

### 部署步骤

```bash
# 1. SSH 登录腾讯云
ssh <user>@<lighthouse-ip>

# 2. 拉最新代码
cd ~/aijobfit       # 或实际路径
git pull origin main

# 3. 重新 build + 启动容器
docker compose up -d --build

# 4. 验证容器在跑
docker ps | grep aijobfit
# 应该看到：aijobfit  ...  Up X seconds  ...  0.0.0.0:3004->3000/tcp

# 5. 验证站点能访问
curl -I https://aijobfit.llmxfactor.cloud/
# 期待 200 OK + html content-type

# 6. 验证关键 GEO 路径都能 200
for path in / /robots.txt /sitemap.xml /llms.txt /role/product_manager /industry/finance /city/tier1/product_manager /blog; do
  echo -n "$path -> "
  curl -s -o /dev/null -w "%{http_code}\n" https://aijobfit.llmxfactor.cloud$path
done
```

### 已知陷阱（CLAUDE.md 提过）

- `NEXT_PUBLIC_SITE_URL` 必须在 `docker-compose.yml` 的 `build.args` 注入（已配）
- Next 16 standalone 文件追踪漏 `@vercel/og` compiled binary，已在 `next.config.ts` 显式包含
- 如果 `/api/og` 报 `ERR_MODULE_NOT_FOUND`，确认 `outputFileTracingIncludes` 没被改回去

---

## 2. 提交 sitemap 给搜索引擎

`sitemap.xml` 已经被 `robots.txt` 自动声明（搜索引擎理论上会自己发现），但**显式提交能加速首次收录**。

### Google Search Console（GSC）

1. 打开 https://search.google.com/search-console
2. 添加属性：选「网址前缀」→ 输入 `https://aijobfit.llmxfactor.cloud`
3. 验证所有权（HTML 标签 / DNS / Google Analytics 三选一，最快是 HTML 标签）
   - 如果选 HTML 标签：把 GSC 给的 `<meta name="google-site-verification" content="..." />` 加到 `src/app/layout.tsx` 的 `metadata.verification.google` 字段，重新部署
4. 站点地图 → 添加新站点地图 → 输入 `sitemap.xml` → 提交
5. 点击 "URL 检查" 工具，输入 `https://aijobfit.llmxfactor.cloud/role/product_manager` 等关键页，请求编入索引（手动 trigger）

### 百度站长平台

1. 打开 https://ziyuan.baidu.com/site/index
2. 添加网站 → 输入 `aijobfit.llmxfactor.cloud`
3. 验证（HTML 文件 / HTML 标签 / CNAME 三选一）
4. 数据引入 → 链接提交 → sitemap → 输入 `https://aijobfit.llmxfactor.cloud/sitemap.xml` → 提交
5. 如有需要可主动推送 API（百度有「主动推送」接口，能加速收录），需要 token

### Bing Webmaster Tools

1. 打开 https://www.bing.com/webmasters
2. 用 Google 账号登录可一键 import GSC（最简单）
3. 验证后 Sitemaps → Submit sitemap → `https://aijobfit.llmxfactor.cloud/sitemap.xml`

### 360 / 搜狗 / 神马（按需）

国内还有 360 搜索 / 搜狗 / UC 神马。流量占比小，但都支持 sitemap 提交：
- 360: https://zhanzhang.so.com/sitemap
- 搜狗: http://zhanzhang.sogou.com/index.php/sitemap/index
- 神马: https://zhanzhang.sm.cn/

---

## 3. 验证 GEO 信号生效

部署 + sitemap 提交后，验证以下 URL 都能 200：

```bash
# robots.txt 应该列 19 个 LLM crawler + sitemap 指针
curl https://aijobfit.llmxfactor.cloud/robots.txt

# sitemap 应该有 51+ 个 pSEO URL
curl https://aijobfit.llmxfactor.cloud/sitemap.xml | grep -c '<loc>'

# llms.txt 应该完整输出
curl https://aijobfit.llmxfactor.cloud/llms.txt | head -30

# 首页 HTML 应该包含 3 个 application/ld+json 块（Org / WebSite / Dataset）+ 1 个 FAQPage
curl -s https://aijobfit.llmxfactor.cloud/ | grep -c 'application/ld+json'

# role 页应该有 Article + Breadcrumb LD
curl -s https://aijobfit.llmxfactor.cloud/role/product_manager | grep -c 'application/ld+json'
```

---

## 4. AI 引用监测节奏

按 `marketing/ai-mentions/queries.md` 的清单跑：

- **第 1 周**（2026-05-07 左右）：跑 6 个 query 复检（同 baseline-2026-04-30），看 web 索引是否开始收录
- **第 1 月**（2026-05-30）：跑全 25 个 query，扩展到 perplexity LLM-answer baseline（要 PERPLEXITY_API_KEY）
- **常态**：每月 1 次，存 `marketing/ai-mentions/snapshots/YYYY-MM-DD.json`

跑完每次都要更新 `marketing/ai-mentions/baseline-*.md` 风格的对比说明。

---

## 5. 紧急回滚

如果新版本有问题，在腾讯云上：

```bash
cd ~/aijobfit
git log --oneline -10              # 找上一个稳定 commit
git checkout <stable-commit-sha>   # 回退到稳定版
docker compose up -d --build       # 重新 build
git checkout main                  # 回到 main，下次 git pull 继续部署最新
```
