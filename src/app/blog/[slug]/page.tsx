import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOG_POSTS, findPost } from "@/data/blog-posts";
import { buildOgImages } from "@/lib/ogUrl";

export const dynamicParams = false;

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `/blog/${slug}`,
      publishedTime: post.publishedAt,
      tags: post.tags,
      images: buildOgImages({
        title: post.title,
        subtitle: post.excerpt.slice(0, 110),
        tag: "Blog · 数据深度文章",
        stat1: `${post.readMinutes} 分钟阅读`,
        stat2: post.publishedAt,
        stat3: post.tags.slice(0, 2).map((t) => `#${t}`).join(" "),
      }),
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) return notFound();
  const Component = post.Component;
  return <Component />;
}
