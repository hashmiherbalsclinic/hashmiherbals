import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, formatBlogDate, getBlogPost } from "@/lib/blogs";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Blog" };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <article className="bg-white">
      <div className="border-b border-line bg-[#fafaf8]">
        <div className="container-page max-w-3xl py-12 sm:py-16">
          <Link
            href="/blogs"
            className="text-xs font-semibold uppercase tracking-[0.16em] text-forest hover:underline"
          >
            ← All blogs
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1f4d3a]/70">
            <span>{post.category}</span>
            <span className="text-[#1f4d3a]/30">·</span>
            <span>{formatBlogDate(post.date)}</span>
            <span className="text-[#1f4d3a]/30">·</span>
            <span>{post.readMinutes} min read</span>
          </div>
          <h1 className="font-display mt-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-muted">{post.excerpt}</p>
        </div>
      </div>

      <div className="container-page max-w-3xl py-10 sm:py-14">
        <div className="relative mx-auto mb-10 aspect-[16/9] max-w-2xl overflow-hidden rounded-[1.5rem] bg-[#f6f4ef]">
          <Image
            src={post.image}
            alt=""
            fill
            className="object-contain p-10"
            sizes="(max-width:768px) 100vw, 672px"
            priority
          />
        </div>

        <div className="space-y-5 text-[15px] leading-[1.75] text-muted sm:text-base">
          {post.body.map((para) => (
            <p key={para.slice(0, 32)}>{para}</p>
          ))}
        </div>

        <p className="mt-10 rounded-2xl border border-line bg-[#fafaf8] px-5 py-4 text-xs leading-relaxed text-muted">
          Traditional herbal notes are for general education. They are not medical advice. Consult a
          qualified practitioner for personal health questions.
        </p>
      </div>

      {related.length > 0 && (
        <section className="border-t border-line bg-[#fafaf8] py-12 sm:py-14">
          <div className="container-page">
            <h2 className="font-display text-2xl font-bold">More to read</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blogs/${p.slug}`}
                  className="rounded-2xl border border-line bg-white p-5 transition hover:border-[#1f5c45]/30"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#1f4d3a]/70">
                    {p.category}
                  </p>
                  <p className="font-display mt-2 text-lg font-bold leading-snug text-ink">
                    {p.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
