# 选题库

按 **受众 × 路线 × 长尾职业** 维度组织。每条选题都附 **数据锚点**（来自 8238 条 JD 真实数据）+ **站内深链**（导流到对应 pSEO 页面或诊断路线）。

> 维护原则：
> - 每条选题必须有数据锚点。没有具体数字 / 行业切片就不发。
> - 站内深链必须可达（写之前先验证 URL 在线）。
> - 标题套 `templates/xhs-title-formulas.md` 或 `wechat-title-formulas.md` 的公式。
> - 已发布 / 排期中的内容请进 Notion，不要在这个文件里维护状态。

---

## A. 路线 B（转行 Gap 诊断）受众

针对「想转去做 AI 角色」的用户。

### A1. 转 AI 产品经理

- **数据锚点**: 293 条真实 JD · 中位 ¥32.5k · 互联网 142 / 制造 36 / 金融 32
- **深链**: `/role/product_manager` · `/diagnose-target`
- **痛点**: 「我是传统 PM 想转 AI PM 但不知道差距多大」
- **可写选题**:
  - AI 产品经理招聘 293 条 JD 反推：到底卡谁不卡谁？
  - 传统 PM 转 AI PM 缺什么？93 条 JD 高频技能拆解
  - AI PM 中位 ¥32.5k 是怎么分布的？P25 vs P75 的差在哪

### A2. 转 AI 运营 / 训练师

- **数据锚点**: 95 条 JD · 中位 ¥23k · 应届友好度高
- **深链**: `/role/operations` · `/diagnose-target`
- **痛点**: 「互联网运营 + 应届想入 AI 行业」
- **可写选题**:
  - 95 条 AI 运营 JD 拆出来：和传统运营到底差在哪
  - 应届想做 AI 运营？我帮你算了校招 / 实习 / 应届岗的真实数

### A3. 转 AI 转型咨询（高薪）

- **数据锚点**: 71 条 JD · 中位 ¥35k（最高轨道）· 5+ 年经验门槛
- **深链**: `/role/ai_transformation` · `/diagnose-target`
- **痛点**: 「咨询 / B 端 PM 想做 AI 转型咨询，门槛真的需要 5 年吗」

### A4. 转 AIGC 创意（D 主线）

- **数据锚点**: 剪映 / SD / Midjourney / ComfyUI / Runway 工具向；当前 14 聚类未单独成簇
- **深链**: `/diagnose`（D 主线）
- **痛点**: 「设计师 / 视频剪辑想转 AIGC 但不知道是不是真有岗位」
- **重要约束**: D 主线 roleIds=other 数据稀薄，业务方原话「我会剪映就推 AIGC？」是黑盒疑虑 → 内容必须强调 trackFingerprints + 不夸大

---

## B. 路线 C（留行 + AI 增强）受众

针对「不想离开原行业但想加 AI 技能」的用户。这是覆盖**长尾原职业**（420 条字典）的核心。

### B1. 电气 / 机械 / 工艺工程师 + AI

- **行业**: manufacturing
- **数据锚点**: 152 条制造 × AI 增强 JD · 中位 ¥30k · 智能制造转型
- **深链**: `/industry/manufacturing` · `/diagnose-augment`
- **可写选题**:
  - 电气工程师不要转 AI PM，留在制造业 + AI 增强可能更香
  - 152 条制造业 AI 增强 JD：到底要哪些 AI 技能

### B2. 医生 / 护士 / 药师 + 医疗 AI

- **行业**: healthcare
- **数据锚点**: 88 条医疗 × AI 增强 JD · 中位 ¥30k
- **深链**: `/industry/healthcare` · `/role/medical_ai` · `/diagnose-augment`
- **可写选题**:
  - 医生加什么 AI 技能可以涨薪？88 条医疗 AI JD 拆解
  - 护士 / 药师转医疗 AI 真实路径

### B3. 教师 / 教研 / 培训师 + 教育 AI

- **行业**: education
- **深链**: `/industry/education` · `/role/education_ai` · `/diagnose-augment`
- **可写选题**:
  - 教师做 AI 教研 / 课件生成，工资差多少？
  - K12 老师 / 高校讲师 + AI 工具的真实 JD

### B4. 销售 / BD + AI 销售

- **行业**: 跨行业（互联网 70 / 医疗 20 / 制造 7）
- **深链**: `/role/sales_bd` · `/diagnose-augment`
- **可写选题**:
  - 118 条 AI 销售 JD：哪些行业最缺、薪资多少
  - 传统销售 + AI 工具：留行加技能 vs 转 AI 销售岗哪个划算

### B5. 财务 / 会计 / 审计 + AI

- **行业**: finance
- **数据锚点**: 85 条金融 × AI 增强 JD · 中位 ¥30k
- **深链**: `/industry/finance` · `/diagnose-augment`

### B6. HR / 招聘 + AI

- **行业**: consulting
- **深链**: `/industry/consulting` · `/diagnose-augment`

### B7. 设计师 / 文案 / 编辑 + AIGC

- **行业**: media
- **深链**: `/industry/media` · `/diagnose-augment`
- **可写选题**:
  - 平面设计师不要转纯 AIGC 岗位，留在媒体 + AIGC 工具更稳
  - 编辑 / 记者 + Prompt 工程：JD 反推该学什么

---

## C. 应届生切片受众

针对在读 / 应届无实习 / 应届有实习用户。

- **数据锚点**: roles-graduate-friendly · 14 角色 × 应届口径 · 校招 / 实习 / 应届岗
- **深链**: 各 `/role/[id]` 页面下方应届口径 section（如有数据）
- **可写选题**:
  - 应届生做 AI 哪个岗位最容易上岸？14 角色应届友好度排序
  - AI PM 校招 vs 社招薪资差多少？
  - 在读学生先实习哪个 AI 岗位回报最高？

---

## D. 数据 / 工具属性内容（拉外链 + LLM 引用）

针对引用价值最高的「数据集 / 方法论」类内容，主要给 AI 搜索引擎 + 程序员社区看。

- **可写选题**:
  - 8238 条国内 AI 招聘 JD 数据集开源（Agent Hunt）：拆给所有人看
  - 14 角色聚类是怎么做的？技术方法论 + 边界
  - 行业 hard filter ×0.3：为什么不能给电气工程师推 AI 销售
  - whyMatched 推理链：为什么不做黑盒推荐
  - llms.txt 我们怎么写：让 AI 引用你的诚实做法

---

## E. 反内卷 / 反贩卖焦虑（差异化定位）

跟主流"AI 求职课"明显切割的内容。

- **可写选题**:
  - 我做了一个永久免费的 AI 求职诊断工具，为什么不卖课
  - 不打饥饿营销也能起量：诚实推免费资源（Datawhale / ModelScope / 李宏毅）
  - "10 万年薪转 AI" 这类话术，看完真实 JD 数据再说
