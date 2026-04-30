import Link from "next/link";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://aijobfit.llmxfactor.cloud";

export interface PostMeta {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  modifiedAt?: string;
  tags: string[];
  readMinutes: number;
}

export function PostShell({
  meta,
  children,
}: {
  meta: PostMeta;
  children: React.ReactNode;
}) {
  const url = `${SITE_URL}/blog/${meta.slug}`;
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.excerpt,
    datePublished: meta.publishedAt,
    dateModified: meta.modifiedAt || meta.publishedAt,
    author: { "@type": "Organization", name: "AIJobFit", url: SITE_URL },
    publisher: { "@type": "Organization", name: "AIJobFit", url: SITE_URL },
    mainEntityOfPage: url,
    keywords: meta.tags.join(", "),
    isBasedOn: {
      "@type": "Dataset",
      name: "Agent Hunt · 中国 AI 岗位真实 JD 数据集",
      url: "https://github.com/LLM-X-Factorer/agent-hunt",
    },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "首页", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: meta.title, item: url },
    ],
  };

  return (
    <main className="flex-1 flex flex-col bg-grid">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <nav
        className="px-4 pt-4 max-w-4xl mx-auto w-full text-xs text-slate-500"
        aria-label="Breadcrumb"
      >
        <ol className="flex items-center gap-2 flex-wrap">
          <li>
            <Link href="/" className="hover:text-blue-700 hover:underline">
              首页
            </Link>
          </li>
          <li>›</li>
          <li>
            <Link href="/blog" className="hover:text-blue-700 hover:underline">
              Blog
            </Link>
          </li>
          <li>›</li>
          <li className="text-slate-700 font-medium truncate">{meta.title}</li>
        </ol>
      </nav>

      <header className="px-4 pt-8 sm:pt-12 pb-6 max-w-3xl mx-auto w-full">
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
          <time
            dateTime={meta.publishedAt}
            className="font-mono text-slate-500"
          >
            {meta.publishedAt}
          </time>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500">{meta.readMinutes} 分钟阅读</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
          {meta.title}
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">{meta.excerpt}</p>
        <div className="flex flex-wrap gap-2 mt-5">
          {meta.tags.map((t) => (
            <span
              key={t}
              className="text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-3 py-1"
            >
              #{t}
            </span>
          ))}
        </div>
      </header>

      <article className="px-4 pb-12 max-w-3xl mx-auto w-full prose-content">
        {children}
      </article>

      <section className="px-4 py-12 bg-blue-50/40 border-y border-blue-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-black text-slate-900 mb-3">
            想看自己适合走哪条 AI 求职路线？
          </h2>
          <p className="text-sm text-slate-500 mb-6 max-w-2xl mx-auto">
            10 分钟出 7 节诊断报告：技能匹配率 / Gap / 7-30-90 日补齐路径 / 薪资分布。永久免费。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
            <Link
              href="/diagnose-target"
              className="text-center bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-4 py-4"
            >
              <div>转行 Gap 诊断</div>
              <div className="text-xs font-normal opacity-90 mt-1">锁定行业 + 岗位</div>
            </Link>
            <Link
              href="/diagnose-augment"
              className="text-center bg-white border-2 border-emerald-600 text-emerald-700 font-bold rounded-xl px-4 py-4 hover:bg-emerald-50"
            >
              <div>留行 + AI 增强</div>
              <div className="text-xs font-normal mt-1 text-slate-500">填原职业看 AI 增强</div>
            </Link>
            <Link
              href="/diagnose"
              className="text-center bg-white border border-slate-300 text-slate-700 font-bold rounded-xl px-4 py-4 hover:border-blue-400"
            >
              <div>系统推荐 Top 3</div>
              <div className="text-xs font-normal mt-1 text-slate-500">填技能让算法挑</div>
            </Link>
          </div>
        </div>
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

// 文章内重用的语义元素，统一视觉

export function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2
      id={id}
      className="text-2xl sm:text-3xl font-black text-slate-900 mt-12 mb-4 scroll-mt-20"
    >
      {children}
    </h2>
  );
}

export function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xl font-bold text-slate-900 mt-8 mb-3">{children}</h3>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-base text-slate-700 leading-relaxed mb-4">{children}</p>
  );
}

export function Ul({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc list-outside ml-5 space-y-2 mb-4 text-slate-700">
      {children}
    </ul>
  );
}

export function Ol({ children }: { children: React.ReactNode }) {
  return (
    <ol className="list-decimal list-outside ml-5 space-y-2 mb-4 text-slate-700">
      {children}
    </ol>
  );
}

export function Li({ children }: { children: React.ReactNode }) {
  return <li className="leading-relaxed">{children}</li>;
}

export function Quote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="border-l-4 border-blue-500 bg-blue-50/40 px-5 py-3 my-6 text-slate-700 italic">
      {children}
    </blockquote>
  );
}

export function Callout({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warn" | "ok";
  title?: string;
  children: React.ReactNode;
}) {
  const map = {
    info: "bg-blue-50 border-blue-300 text-blue-900",
    warn: "bg-amber-50 border-amber-300 text-amber-900",
    ok: "bg-emerald-50 border-emerald-300 text-emerald-900",
  } as const;
  return (
    <div className={`border-l-4 rounded-r-lg px-5 py-4 my-6 ${map[tone]}`}>
      {title && <div className="font-bold mb-1">{title}</div>}
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full text-sm border-collapse">
        <thead className="bg-blue-50 text-slate-700">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left font-bold border border-blue-100"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td
                  key={j}
                  className="px-4 py-3 border border-blue-100 text-slate-700 font-mono"
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-sm font-mono">
      {children}
    </code>
  );
}

export function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="font-bold text-slate-900">{children}</strong>;
}

export function PostLink({ href, children }: { href: string; children: React.ReactNode }) {
  const isExternal = href.startsWith("http");
  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline font-medium"
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className="text-blue-600 hover:underline font-medium">
      {children}
    </Link>
  );
}
