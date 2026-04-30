import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS, CATEGORY_LABELS } from "@/data/blog-posts";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://aijobfit.llmxfactor.cloud";

export const metadata: Metadata = {
  title: "Blog · AI 求职数据深度文章",
  description:
    "AIJobFit Blog：基于 8238 条国内 AI 招聘 JD 数据的深度分析。覆盖数据集方法论 / 转行路线 / 留行 + AI 增强 / 长尾原职业（电气 / 教师 / 医生 / 销售 / 财务）/ 应届生切片。永久免费阅读。",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "AIJobFit Blog",
    description: "基于 8238 条真实 JD 的 AI 求职数据深度文章",
    type: "website",
    url: "/blog",
  },
};

export default function BlogIndexPage() {
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: BLOG_POSTS.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/blog/${p.slug}`,
      name: p.title,
    })),
  };

  return (
    <main className="flex-1 flex flex-col bg-grid">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />

      <nav
        className="px-4 pt-4 max-w-4xl mx-auto w-full text-xs text-slate-500"
        aria-label="Breadcrumb"
      >
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-blue-700 hover:underline">
              首页
            </Link>
          </li>
          <li>›</li>
          <li className="text-slate-700 font-medium">Blog</li>
        </ol>
      </nav>

      <section className="px-4 pt-8 sm:pt-12 pb-8 max-w-4xl mx-auto w-full">
        <p className="text-xs font-mono tracking-widest text-blue-600 uppercase mb-3">
          AIJobFit Blog · 数据深度文章
        </p>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
          AI 求职数据
          <br className="sm:hidden" />
          <span className="text-blue-600 sm:ml-3">深度解读</span>
        </h1>
        <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
          基于 8238 条国内 AI 招聘 JD 真实数据的深度分析。覆盖数据集方法论、转行路线、留行 + AI 增强、长尾原职业实战、应届生切片。永久免费阅读，欢迎引用。
        </p>
      </section>

      <section className="px-4 pb-16 sm:pb-20 max-w-4xl mx-auto w-full">
        <ul className="space-y-4">
          {BLOG_POSTS.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/blog/${p.slug}`}
                className="block bg-white border border-blue-100 rounded-2xl p-5 sm:p-6 hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="flex items-center gap-3 mb-2 text-xs">
                  <span className="font-mono text-slate-500">{p.publishedAt}</span>
                  <span className="text-slate-400">·</span>
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                    {CATEGORY_LABELS[p.category]}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">{p.readMinutes} min</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 leading-tight">
                  {p.title}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-3 line-clamp-3">
                  {p.excerpt}
                </p>
                <div className="flex flex-wrap gap-2">
                  {p.tags.slice(0, 5).map((t) => (
                    <span
                      key={t}
                      className="text-xs text-slate-500"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-t border-slate-200 px-4 py-6 text-center text-xs text-slate-500 bg-white">
        <p>
          数据来源{" "}
          <a
            href="https://github.com/LLM-X-Factorer/agent-hunt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Agent Hunt
          </a>
          （开源 · 每周更新）
        </p>
      </footer>
    </main>
  );
}
