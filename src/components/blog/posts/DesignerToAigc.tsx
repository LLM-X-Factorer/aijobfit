import {
  PostShell,
  H2,
  H3,
  P,
  Ul,
  Ol,
  Li,
  Quote,
  Callout,
  DataTable,
  Strong,
  PostLink,
  type PostMeta,
} from "../PostShell";

export const meta: PostMeta = {
  slug: "designer-aigc-truth",
  title: "设计师 + AIGC 真相：媒体行业 AI 中位 ¥12.5k 比平面设计还低，留制造做 AI 视觉反而稳",
  excerpt:
    "「设计师转 AIGC」类内容默认推荐你跳互联网做纯 AIGC 岗。但 50+ 条设计师原职业 AI 增强 JD 拆开后：制造 + 汽车 + 零售 行业的 AI 平面 / 视觉设计师 ¥15-19k 比 媒体行业 AI 整体中位 ¥12.5k 还高。视频剪辑 + AI 在 media 17 条 JD ¥10k 是真增量但薪资偏低。本文给设计师一份反共识地图。",
  publishedAt: "2026-05-01",
  tags: ["设计师", "AIGC", "平面设计", "视觉设计", "视频剪辑", "留行 + AI 增强"],
  readMinutes: 9,
};

export default function Post() {
  return (
    <PostShell meta={meta}>
      <P>
        如果你是平面设计师 / 视觉设计师 / UI 设计师 / 美工 / 视频剪辑师，最近大概率被「设计师必须转 AIGC」类内容轰炸。主流话术是：
      </P>

      <Quote>
        Midjourney 替代设计师 / 转互联网 AIGC 岗 / 学 ComfyUI ¥30k 起步 ...
      </Quote>

      <P>
        我们这边有 420 条原职业 × AI 增强 JD 字典 + 12 行业 × 14 角色二维切片（来自{" "}
        <PostLink href="https://github.com/LLM-X-Factorer/agent-hunt">
          Agent Hunt 开源数据集
        </PostLink>
        ）。把设计师相关原职业 + 媒体/制造/零售行业 AI 岗位拆开后，结论很反共识：
      </P>

      <Callout tone="ok" title="本文核心观点">
        设计师不该硬转「纯 AIGC 岗」。<Strong>三个反共识发现</Strong>：
        <br />
        (1) 媒体行业 AI 整体中位 ¥12.5k，<Strong>比平面设计师 AI 增强 JD 中位 ¥18.75k 还低</Strong>。「转互联网 AIGC」是收入下降。
        <br />
        (2) 制造 / 汽车 / 零售 行业的「AI 平面 / 视觉设计师」岗位 ¥15-19k 反而更稳，原行业 know-how + 品牌资产是壁垒。
        <br />
        (3) 视频剪辑 + AI 在 media 行业 17 条 JD ¥10k 是真增量（短剧 / 漫剧 / 短视频流水线），但薪资低 — 适合作为副业 / 工作室方向，不是主升级路径。
      </Callout>

      <H2>数据先行 1：设计师系原职业的 AI 增强供给</H2>

      <DataTable
        headers={["原职业", "AI 增强 JD", "薪资中位", "Top 行业"]}
        rows={[
          ["视频剪辑", 17, "¥10k", "media·12 / retail·3 / internet·2"],
          ["平面设计师", 12, "¥18.75k", "manufacturing·6 / automotive·2 / retail·2"],
          ["视觉设计师", 9, "¥15k", "retail·3 / automotive·2 / internet·2"],
          ["设计师（综合）", 7, "¥15k", "manufacturing·4 / media·1"],
          ["美工设计师", 2, "¥10.5k", "internet·2"],
          ["UI 设计师", 2, "¥40k (噪声)", "finance·2"],
          ["小计（设计系）", "约 50+", "¥10-19k", "制造 / 汽车 / 零售 / 媒体"],
        ]}
      />

      <Callout tone="warn" title="行业分布是关键">
        平面设计师 12 条 AI 增强 JD 里，<Strong>制造业 6 条 / 汽车 2 条 / 零售 2 条</Strong>—— 这些是「企业内部 AI 平面设计岗」（产品包装 / 品牌物料 / 详情页 / 车型营销），不是互联网 AIGC 工作室。中位 ¥18.75k 比媒体行业 AI 整体中位（¥12.5k）还高 25%。
      </Callout>

      <H2>数据先行 2：媒体 vs 制造行业 AI 岗位对比</H2>

      <P>
        把媒体行业 85 条 AI 真实 JD 拆角色：
      </P>

      <DataTable
        headers={["AI 角色", "媒体行业 JD", "薪资中位", "对设计师友好度"]}
        rows={[
          ["AI 运营 / 训练师", 14, "¥17.5k", "✅ 内容审美 + 标注能力"],
          ["AI/LLM 工程师", 13, "¥25k", "❌ 工程师岗"],
          ["AI 产品经理", 12, "¥26.3k", "⚠️ 需 PM 经验"],
          ["AI 领导岗", 6, "¥36.3k", "❌ 管理岗"],
          ["其他角色", "≤2/岗", "—", "—"],
        ]}
      />

      <P>
        媒体行业 85 条但<Strong>整体中位只 ¥12.5k</Strong> —— 因为大量是「AI 漫剧编剧」「AI 短剧文案」「AI 内容审核」这些低薪流水线岗。设计师跳互联网媒体做这些岗位反而是降薪。
      </P>

      <P>
        对比制造业 152 条 AI 岗位 + 汽车 多个 AI 应用场景，<Strong>「AI 平面设计师 / 品牌物料生成」反而薪资稳在 ¥15-25k</Strong>。逻辑是：制造企业的产品差异化、车型市场化、零售大促物料 都需要内部设计师 + AI 工具的复合能力。
      </P>

      <H2>4 条决策路径</H2>

      <H3>路径 A · 留制造 / 汽车 / 零售 + AI 设计工具增强</H3>

      <P>
        如果你已在制造 / 汽车 / 零售 / 消费品行业做平面 / 视觉设计，<Strong>这是 ROI 最高的路径</Strong>。该学的：
      </P>

      <Ol>
        <Li>
          <Strong>Midjourney / SD / ComfyUI</Strong>：产品图、车型营销图、包装概念图（节省 70% 概念稿时间）
        </Li>
        <Li>
          <Strong>商品图批量生成</Strong>：电商详情页、活动 banner、SKU 视觉一致化
        </Li>
        <Li>
          <Strong>品牌资产 + AI 风格化</Strong>：用 LoRA 微调让 AI 输出符合公司品牌调性的图（重要竞争力）
        </Li>
        <Li>
          <Strong>3D + AI</Strong>：Blender / Cinema4D + AI 生成产品 3D 渲染（汽车 / 工业品方向）
        </Li>
      </Ol>

      <P>
        看{" "}
        <PostLink href="/diagnose-augment">/diagnose-augment</PostLink>{" "}
        填「平面设计师 / 视觉设计师 / 美工」→ 系统给 AI 工具优先级 + 准备度档位。
      </P>

      <H3>路径 B · 转互联网媒体行业 AI 运营 / 训练师</H3>

      <P>
        媒体行业 AI 运营 / 训练师 14 条 ¥17.5k —— 设计师转这个岗位有审美 + 标注能力优势：
      </P>

      <Ul>
        <Li>典型岗位：AIGC 内容运营、AI 模型 fine-tune 数据标注主管、提示词工程师（视觉方向）</Li>
        <Li>需补：基础提示词工程 + 一定的训练数据流程理解</Li>
        <Li>典型公司：MiniMax / 智谱 / 美图秀秀 / 字节内部 AIGC 工具</Li>
      </Ul>

      <P>
        看{" "}
        <PostLink href="/role/operations">/role/operations</PostLink>{" "}
        + <PostLink href="/industry/media">/industry/media</PostLink>{" "}
        看真实 JD 样本。
      </P>

      <H3>路径 C · 视频剪辑 + AI 流水线（副业 / 工作室方向）</H3>

      <P>
        视频剪辑师 17 条 AI 增强 JD 是设计系最大子类，但中位仅 ¥10k —— 多为短剧 / 漫剧 / 短视频流水线岗：
      </P>

      <Ul>
        <Li>典型岗位：AI 漫剧成片剪辑、AI 短剧剪辑、AI 视频剪辑师</Li>
        <Li>核心工具：Runway / Pika / 即梦 / 可灵 / CapCut + Pr/AE</Li>
        <Li>这条路径作为「主业升级」薪资偏低；作为「副业 / 自媒体 / 工作室」收入潜力大</Li>
      </Ul>

      <H3>路径 D · 转金融 / 互联网行业 UI 设计师（小样本但高薪）</H3>

      <P>
        UI 设计师在 finance 行业有 2 条 AI 硬件产品 UI 岗位 ¥40k —— 样本量小但反映：<Strong>金融 + 互联网 + AI 硬件</Strong>方向 UI 是高薪机会窗：
      </P>

      <Ul>
        <Li>典型岗位：AI 硬件产品 UI、AI 助理产品 UX、金融 AI 决策界面设计</Li>
        <Li>需补：交互原型（Figma 高阶）+ 多模态 AI 产品理解</Li>
        <Li>注意 2 条样本是噪声，不能保证 ¥40k 是普遍水平 — 但方向值得探索</Li>
      </Ul>

      <H2>选择决策表</H2>

      <DataTable
        headers={["你的画像", "推荐路径"]}
        rows={[
          ["制造 / 汽车 / 零售在职平面 / 视觉设计师", "路径 A · 留行 + AI 设计工具（最稳）"],
          ["互联网 / 电商美工想升级", "路径 A 优先 + 关注 ¥18-25k 区间的 AI 视觉岗"],
          ["有运营 / 标注经验想转岗", "路径 B · 媒体 AI 运营"],
          ["视频剪辑 + 想做副业 / 工作室", "路径 C · 视频流水线（主业别期待 ¥30k）"],
          ["UI 设计师 + 想跳金融 / AI 硬件", "路径 D · 高薪窗口 + 补交互能力"],
          ["完全没设计基础想转 AIGC", "❌ 直接学 AIGC 不如先入设计行业再叠 AI"],
        ]}
      />

      <H2>反贩卖焦虑提醒</H2>

      <Callout tone="warn" title="不要被「设计师必死论」吓到">
        AI 替代的是<Strong>低创意重复劳动</Strong>（详情页拼图、活动 banner 模板套用），不是<Strong>品牌策略 / 用户研究 / 创意叙事 / 设计系统</Strong>这些核心能力。
        给你卖「设计师转 AIGC ¥4980 训练营」的多半在卖焦虑 — 看 JD 数据：纯 AIGC 流水线岗 ¥10k 比留行做 AI 平面设计还低。本工具永久免费，数据自取。
      </Callout>

      <H2>下一步</H2>

      <Ul>
        <Li>
          <PostLink href="/diagnose-augment">
            /diagnose-augment 留行 + AI 增强诊断
          </PostLink>{" "}
          填「平面设计师 / 视觉设计师 / 美工 / 视频剪辑」→ 系统给 AI 工具优先级
        </Li>
        <Li>
          <PostLink href="/industry/manufacturing">
            /industry/manufacturing
          </PostLink>{" "}
          看制造业 152 条 AI 岗位完整切片（含 AI 设计相关岗）
        </Li>
        <Li>
          <PostLink href="/industry/media">/industry/media</PostLink>{" "}
          看媒体行业 85 条 AI 岗位（含视频剪辑 / 内容运营 / AIGC 流水线）
        </Li>
        <Li>
          <PostLink href="/skills">
            /skills 35 技能 × 14 角色矩阵
          </PostLink>{" "}
          看 AI 运营 / 创意角色的 top 5 必备技能
        </Li>
      </Ul>
    </PostShell>
  );
}
