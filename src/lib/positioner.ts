// AI 工程师位置诊断（/positioner）核心逻辑。
//
// 与 aijobfit 三路线（A/B/C）完全独立：
// - 受众不同：A/B/C = 不会编程的转行用户；positioner = 已经在写代码的人
// - URL 编码不同：A/B/C 用 base64url(JSON)；positioner 用 4 位 0/1/2 字符（如 "0210"）
// - 报告结构不同：A/B/C 是 7 节；positioner 是 4 节
//
// 4 题原文与象限文案由业务方锁定，措辞不要改。

export type Answer = 0 | 1 | 2; // 0 = 正向 / 1 = 负向 / 2 = 不确定

export type QuadrantId = "Q1" | "Q2" | "Q3" | "Q4";

export type CtaAction = "joinClass" | "previewClass" | "consult1v1";

export interface PositionerInput {
  q1: Answer;
  q2: Answer;
  q3: Answer;
  q4: Answer;
}

export interface PositionerQuestion {
  id: keyof PositionerInput;
  label: string; // 短标签（步骤条 + 报告附注用）
  title: string; // 题面主体（凭直觉答，没有标准答案）
  options: [string, string, string]; // 顺序固定：正向 / 负向 / 不确定
}

export const POSITIONER_QUESTIONS: PositionerQuestion[] = [
  {
    id: "q1",
    label: "代码反思",
    title:
      "上次完成一个项目后，你有没有花时间回头删 / 重构掉那些「能跑但难维护」的部分？",
    options: ["是", "否", "不确定"],
  },
  {
    id: "q2",
    label: "意图清晰度",
    title: "你给 AI 写 prompt 时，是先想清楚再写，还是边写边改、来回试？",
    options: ["先想清楚再写", "边写边改", "不确定"],
  },
  {
    id: "q3",
    label: "协作维度",
    title:
      "身边有没有比你更懂这个方向的人，会直接指出你的判断错误？（不是只夸你的那种）",
    options: ["有", "没有", "不确定"],
  },
  {
    id: "q4",
    label: "价值显示度",
    title:
      "你过去 3 个月最满意的产出，是能用数据 / 截图直接展示，还是需要你解释才能让别人看懂价值？",
    options: ["数据 / 截图直接展示", "需要解释", "不确定"],
  },
];

const CODE_RE = /^[012]{4}$/;

export function encodeAnswers(input: PositionerInput): string {
  return `${input.q1}${input.q2}${input.q3}${input.q4}`;
}

export function decodeAnswers(code: string): PositionerInput {
  if (!CODE_RE.test(code)) throw new Error("invalid positioner code");
  return {
    q1: Number(code[0]) as Answer,
    q2: Number(code[1]) as Answer,
    q3: Number(code[2]) as Answer,
    q4: Number(code[3]) as Answer,
  };
}

export function scoreAnswers(input: PositionerInput): {
  positive: number;
  uncertain: number;
} {
  let positive = 0;
  let uncertain = 0;
  for (const a of [input.q1, input.q2, input.q3, input.q4]) {
    if (a === 0) positive += 1;
    else if (a === 2) uncertain += 1;
  }
  return { positive, uncertain };
}

// 不确定 ≥3 优先于按分数判定，避免「2 正向 + 2 不确定」被推进就业班的危险状态。
export function classifyQuadrant(input: PositionerInput): QuadrantId {
  const { positive, uncertain } = scoreAnswers(input);
  if (uncertain >= 3) return "Q4";
  if (positive >= 3) return "Q1";
  if (positive === 2) return "Q2";
  return "Q3";
}

export interface QuadrantCta {
  label: string;
  action: CtaAction;
}

export interface QuadrantContent {
  id: QuadrantId;
  name: string; // 「第 X 象限 · 标签」
  tagline: string; // 标签
  axes: { x: -1 | 1; y: -1 | 1 }; // 在 2x2 象限图中的位置：x 横轴（位置清晰度），y 纵轴（能力底子）
  meaning: string;
  advice: string[];
  primaryCta: QuadrantCta;
  secondaryCta?: QuadrantCta;
}

// 2x2 象限图坐标约定：
//   横轴 X = 位置清晰度（左 -1：模糊 → 右 +1：清晰）
//   纵轴 Y = 能力底子（下 -1：弱 → 上 +1：强）
// 第一象限（Q1）= 右上：底子强 + 位置清晰
// 第二象限（Q2）= 左上：底子强 + 位置模糊（最大那群人）
// 第三象限（Q3）= 左下：底子弱 + 位置模糊
// 第四象限（Q4）= 右下保留给「先停下来」——独立判定，不靠分数推
export const QUADRANTS: Record<QuadrantId, QuadrantContent> = {
  Q1: {
    id: "Q1",
    name: "第一象限 · 方向已对，加速即可",
    tagline: "方向已对，加速即可",
    axes: { x: 1, y: 1 },
    meaning:
      "你已经在做对的事——有删除的习惯、写 prompt 前会想清楚、身边有诤友、产出能被一眼看见。这四件事在国内 AI 工程师 JD 里，只有不到 5% 的候选人同时具备。你不缺方法论，缺的是把现有产出转换成可识别的简历素材。",
    advice: [
      "把过去 3 个月的删除 / 重构记录整理成 case",
      "找一个能给「不清晰回馈信号」的项目（不是 leetcode 那种确定答案的）",
      "直接面试，校准市场定价",
    ],
    primaryCta: {
      label: "报名 V8 就业班 · 已具备底子，27 课时直接加速",
      action: "joinClass",
    },
    secondaryCta: { label: "先听公开课", action: "previewClass" },
  },
  Q2: {
    id: "Q2",
    name: "第二象限 · 有底子，但缺位置",
    tagline: "有底子，但缺位置",
    axes: { x: -1, y: 1 },
    meaning:
      "你有技术储备，但出现了「能力廉价 / 位置昂贵」的典型症状——做了不少东西，却很难让招聘方一眼看出你能解决什么具体问题。这是国内 AI 工程师候选人最大的一群，约 60-70%。",
    advice: [
      "看清国内 AI 工程岗的真实结构（14 种角色，TOP3 占 60%+）",
      "找到自己的「位置」而不是继续堆能力",
      "用一套位置导向的训练替代「学更多技术」",
    ],
    primaryCta: {
      label: "预约公开课 · 45 分钟讲透位置框架",
      action: "previewClass",
    },
    secondaryCta: { label: "直接 1v1 咨询", action: "consult1v1" },
  },
  Q3: {
    id: "Q3",
    name: "第三象限 · 要补的是认知框架，不只是技术",
    tagline: "要补的是认知框架，不只是技术",
    axes: { x: -1, y: -1 },
    meaning:
      "你需要的不是再学一门技术，而是先理解 AI 时代价值评估的反转——为什么删除比 commit 重要、为什么意图密度比代码量重要、为什么「诤友」比「夸夸群」重要。这些底层框架不补齐，学多少技术都会被 AI 加速摊薄。",
    advice: [
      "先做一次认知校准（不是技术补习）",
      "找一个真实场景判断自己当下的位置",
      "在框架对齐后再决定学什么",
    ],
    primaryCta: {
      label: "1v1 咨询 · 私聊领《AI 工程师位置诊断表》",
      action: "consult1v1",
    },
    secondaryCta: { label: "先看看公开课", action: "previewClass" },
  },
  Q4: {
    id: "Q4",
    name: "第四象限 · 先停下来看清自己",
    tagline: "先停下来看清自己",
    axes: { x: 1, y: -1 },
    meaning:
      "你的「不确定」太多——这不是坏事，但意味着你现在还没站到能判断自己的视角上。继续往前堆能力或盲目跨进就业班，可能加速错误方向（这是 AI 时代最危险的状态：高能力 × 低判断 = 加速器）。",
    advice: [
      "不要先报课",
      "先做一次 1v1 诊断对话，让外部视角校准你的判断",
      "校准后再决定下一步",
    ],
    primaryCta: { label: "1v1 咨询 · 私聊关键词「位置」", action: "consult1v1" },
  },
};
