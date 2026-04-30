// 构造 /api/og/dynamic 的 query string。给 pSEO 页面 generateMetadata 复用，
// 让 OG 图带具体页面的数据锚点（角色名 / JD 数 / 中位薪资 / 应届口径等）。

export interface OgParams {
  title: string;
  subtitle?: string;
  tag?: string;
  stat1?: string;
  stat2?: string;
  stat3?: string;
  theme?: "blue" | "emerald";
}

function build(params: OgParams, size: "wide" | "square"): string {
  const sp = new URLSearchParams();
  sp.set("title", params.title);
  if (params.subtitle) sp.set("subtitle", params.subtitle);
  if (params.tag) sp.set("tag", params.tag);
  if (params.stat1) sp.set("stat1", params.stat1);
  if (params.stat2) sp.set("stat2", params.stat2);
  if (params.stat3) sp.set("stat3", params.stat3);
  if (params.theme) sp.set("theme", params.theme);
  sp.set("size", size);
  return `/api/og/dynamic?${sp.toString()}`;
}

export function buildOgImages(params: OgParams) {
  return [
    { url: build(params, "wide"), width: 1200, height: 630 },
    { url: build(params, "square"), width: 800, height: 800 },
  ];
}
