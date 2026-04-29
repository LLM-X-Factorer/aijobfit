// 首页 server-side wrapper：fetch agent-hunt augmented-by-profession 算 E 主线
// 实时 jdCount / medianSalary / 覆盖职业数，传给纯展示的 TrackOverview。
//
// 不能直接让 TrackOverview 自己 async — form step 2 折叠面板（client component）
// 也用同一个组件。

import TrackOverview from "@/components/TrackOverview";
import { loadRolesAugmentedByProfession } from "@/lib/serverData";

async function loadETrackStats() {
  const data = await loadRolesAugmentedByProfession();
  if (!data) return undefined;
  const entries = Object.values(data.domestic);
  const jdCount = entries.reduce((sum, e) => sum + e.vacancyCount, 0);
  const sortedMedians = entries
    .map((e) => e.salaryMedian)
    .filter((m) => m > 0)
    .sort((a, b) => a - b);
  const medianSalary =
    sortedMedians.length > 0
      ? sortedMedians[Math.floor(sortedMedians.length / 2)]
      : 0;
  return { jdCount, medianSalary, professionCount: entries.length };
}

export default async function TrackOverviewServer() {
  const dynamicETrack = await loadETrackStats();
  return <TrackOverview dynamicETrack={dynamicETrack} />;
}
