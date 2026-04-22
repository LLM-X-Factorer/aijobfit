// OG 图字体加载。优先从 public/fonts/ 本地加载（部署时把 woff2 放进去即可），
// 失败则回退到 Google Fonts 中国镜像。两者都失败时，@vercel/og 会退化用 Noto Color Emoji 等
// 兜底，中文可能 tofu——这是最后的降级，而非设计。

import { readFile } from "node:fs/promises";
import path from "node:path";

type Weight = 400 | 700;

const LOCAL_FILES: Record<Weight, string> = {
  400: "noto-sans-sc-400.woff2",
  700: "noto-sans-sc-700.woff2",
};

async function tryLocal(weight: Weight): Promise<ArrayBuffer | null> {
  try {
    const file = path.join(
      process.cwd(),
      "public",
      "fonts",
      LOCAL_FILES[weight],
    );
    const buf = await readFile(file);
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  } catch {
    return null;
  }
}

async function tryRemote(weight: Weight): Promise<ArrayBuffer | null> {
  const cssUrl = `https://fonts.googleapis.cn/css2?family=Noto+Sans+SC:wght@${weight}&display=swap`;
  try {
    const cssRes = await fetch(cssUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      cache: "force-cache",
    });
    if (!cssRes.ok) return null;
    const css = await cssRes.text();
    const match = css.match(/url\((https:\/\/[^)]+\.woff2)\)/);
    if (!match) return null;
    const fontRes = await fetch(match[1], { cache: "force-cache" });
    if (!fontRes.ok) return null;
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

export async function loadNotoSansSC(
  weight: Weight,
): Promise<ArrayBuffer | null> {
  return (await tryLocal(weight)) || (await tryRemote(weight));
}
