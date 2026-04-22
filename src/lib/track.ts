// 最小漏斗埋点。
// 初期 sink: console.log（dev） + localStorage ring buffer（上限 50 条，便于线上调试）。
// 如设置 NEXT_PUBLIC_PLAUSIBLE_DOMAIN 且 window.plausible 可用，则同步上报。
// 不引第三方 SDK，不影响 bundle。

const STORAGE_KEY = "aijobfit_events";
const MAX_EVENTS = 50;

export type EventProps = Record<string, string | number | boolean | undefined>;

export type TrackedEvent = {
  name: string;
  ts: number;
  props?: EventProps;
};

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: EventProps }) => void;
  }
}

export function track(name: string, props?: EventProps): void {
  if (typeof window === "undefined") return;

  const event: TrackedEvent = { name, ts: Date.now(), props };

  if (process.env.NODE_ENV !== "production") {
    console.log(`[track] ${name}`, props ?? {});
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr: TrackedEvent[] = raw ? JSON.parse(raw) : [];
    arr.push(event);
    if (arr.length > MAX_EVENTS) arr.splice(0, arr.length - MAX_EVENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch {
    // quota 或 JSON parse 失败，忽略
  }

  if (window.plausible) {
    window.plausible(name, props ? { props } : undefined);
  }
}

export function getTrackedEvents(): TrackedEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
