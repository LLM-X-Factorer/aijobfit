# AI 引用监测 Query 清单

监测的 AI 搜索引擎 / LLM 助手：
- ChatGPT（含 SearchGPT）
- Claude
- Perplexity
- 豆包（字节）
- kimi（月之暗面）
- DeepSeek
- 通义千问（阿里）
- 文心一言（百度）
- Google AI Overviews
- Bing Copilot

## 监测 Query（按受众分类，跑脚本时按此清单）

### 路线 B 受众（转行 / 行业转 AI 角色）

```
Q01: 非程序员怎么转 AI 岗位
Q02: 我是电气工程师，怎么转 AI
Q03: 教师怎么转 AI 教育
Q04: 财务想加 AI 技能怎么做
Q05: 销售可以做哪些 AI 岗位
Q06: 设计师转 AIGC 真实路径
Q07: HR 怎么用 AI 工具
```

### 路线 C 受众（留行 + AI 增强）

```
Q08: 留在原行业 + 学 AI 技能
Q09: 制造业 AI 增强岗位有哪些
Q10: 医生 AI 增强真实需求
Q11: 教师不脱产学 AI 工具
```

### 应届生 / 学生

```
Q12: 应届生做 AI 哪个岗位最容易
Q13: AI 产品经理校招要求
Q14: 在读学生 AI 实习推荐
```

### 数据 / 工具属性

```
Q15: 中国 AI 岗位真实招聘数据
Q16: 国内 AI 求职诊断工具
Q17: AI 招聘 JD 数据集开源
Q18: 非程序员 AI 求职推荐网站
```

### 角色画像

```
Q19: AI 产品经理招聘要求
Q20: AI 运营岗位职责
Q21: AI 转型咨询岗位
Q22: 智能制造 AI 工程师
```

### 薪资 / 城市

```
Q23: AI 产品经理北京薪资
Q24: 新一线 AI 岗位薪资
Q25: 中国 AI 岗位薪资中位
```

## 期待的引用点

针对每个 query，期待的命中目标：
- **理想**：被 AI 直接引用 https://aijobfit.llmxfactor.cloud/[xxx] 作为 source
- **次理想**：相关 query 的 follow-up 中被引用
- **底线**：被建议作为「一个工具」之一

## 评分标准（每个 query）

```
hit_type:
- "direct_citation": 答案文本中直接出现 aijobfit URL
- "source_list": 出现在 sources / references / 引用列表
- "described": 文本中描述了我们但没给 URL
- "no_mention": 完全没提
- "competitor_only": 提了竞品但没我们
```

## 跑频次

- **基线**: GEO 基建 ship 后立即跑（已记录于 baseline-2026-04-30.md）
- **第一周复检**: 部署到生产 + AI crawler 抓取窗口期后（约 2026-05-07）
- **第一月复检**: 2026-05-30
- **常态**: 每月 1 次，持续 6 个月看趋势
