// 10 字段表单定义（5 必填 + 5 推荐）

export type FieldType =
  | "text"
  | "select"
  | "multi-select"
  | "multi-select-custom"
  | "single-select"
  | "number-range";

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  placeholder?: string;
  step: 1 | 2 | 3;
  hint?: string;
}

export const FORM_FIELDS: FormField[] = [
  // Step 1：基础信息
  {
    id: "currentJob",
    label: "当前职位 + 行业",
    type: "text",
    required: true,
    placeholder: "如：互联网运营 / 教育行业",
    step: 1,
  },
  {
    id: "yearsExp",
    label: "工作年限 / 在校状态",
    type: "select",
    required: true,
    options: [
      "在读学生",
      "应届生（无实习）",
      "应届生（有实习）",
      "1-3 年",
      "3-5 年",
      "5-10 年",
      "10+ 年",
    ],
    step: 1,
  },
  {
    id: "education",
    label: "学历",
    type: "select",
    required: true,
    options: ["专科", "本科", "硕士", "博士"],
    step: 1,
  },
  {
    id: "city",
    label: "所在城市（可选）",
    type: "text",
    required: false,
    placeholder: "如：上海",
    step: 1,
  },

  // Step 2：技能 + 目标
  {
    id: "skills",
    label: "已掌握的技能（多选 + 可自定义）",
    type: "multi-select-custom",
    required: true,
    hint: "至少选 3 项，可在下方自定义补充",
    options: [
      // 编程 / 数据
      "Python",
      "SQL",
      "Excel",
      "数据分析",
      // AI 工具
      "Prompt Engineering",
      "ChatGPT",
      "Claude",
      "Cursor",
      "Dify",
      "Coze",
      "LangChain",
      "RAG",
      "Agent Architecture",
      // 产品 / 设计
      "PRD 写作",
      "用户研究",
      "Figma",
      "Photoshop",
      "Sketch",
      // AIGC
      "Stable Diffusion",
      "ComfyUI",
      "Midjourney",
      "Runway",
      "剪映",
      "Premiere",
      // 运营 / 商务
      "内容运营",
      "用户增长",
      "私域运营",
      "B 端销售",
      "项目管理",
      // 通用职场
      "PPT",
      "英语听说读写",
    ],
    step: 2,
  },
  {
    id: "targetTrack",
    label: "目标 AI 方向（可多选）",
    type: "multi-select",
    required: true,
    options: [
      "A · AI 产品经理",
      "B · AI 运营 / 训练师",
      "C · AI 转型咨询",
      "D · AIGC 创意",
      "我不知道",
    ],
    step: 2,
  },

  // Step 3：偏好（全部可选）
  {
    id: "motivation",
    label: "转岗动机（可选）",
    type: "single-select",
    required: false,
    options: ["升职加薪", "35 岁危机", "兴趣使然", "副业探索", "其他"],
    step: 3,
  },
  {
    id: "industry",
    label: "行业偏好（可选，多选）",
    type: "multi-select",
    required: false,
    options: ["互联网", "金融", "医疗", "制造", "零售", "教育", "其他"],
    step: 3,
  },
  {
    id: "expectedSalary",
    label: "期望月薪范围（可选，K）",
    type: "number-range",
    required: false,
    placeholder: "如 15-25",
    step: 3,
  },
  {
    id: "timeBudget",
    label: "每周可投入学习时间（可选）",
    type: "select",
    required: false,
    options: ["5 小时以内", "5-10 小时", "10-20 小时", "20 小时以上"],
    step: 3,
  },
];

export const STEP_TITLES: Record<1 | 2 | 3, string> = {
  1: "1 / 3 · 你是谁",
  2: "2 / 3 · 你会什么、想去哪",
  3: "3 / 3 · 偏好（全部可选，可跳过）",
};
