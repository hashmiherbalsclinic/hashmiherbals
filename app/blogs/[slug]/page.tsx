import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogRelatedProducts } from "@/components/blogs/BlogRelatedProducts";
import {
  fetchBlogPost,
  fetchBlogPosts,
  formatBlogDate,
  sanitizeBlogHtml,
} from "@/lib/blogs";
import { fetchProductsRelatedToBlog } from "@/lib/products";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await fetchBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
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
  const post = await fetchBlogPost(slug);
  if (!post) notFound();

  const [all, relatedProducts] = await Promise.all([
    fetchBlogPosts(),
    fetchProductsRelatedToBlog(post, 4),
  ]);
  const others = all.filter((p) => p.slug !== post.slug);
  const sameCategory = others.filter(
    (p) => p.category.toLowerCase() === post.category.toLowerCase()
  );
  const related = [
    ...sameCategory,
    ...others.filter((p) => !sameCategory.some((s) => s.slug === p.slug)),
  ].slice(0, 3);
  const safeHtml = sanitizeBlogHtml(post.bodyHtml);

  return (
    <article className="bg-white">
      <div className="border-b border-line bg-[#fafaf8]">
        <div className="container-page max-w-6xl py-12 sm:py-16">
          <div className="max-w-3xl">
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
      </div>

      <div className="container-page max-w-6xl py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:gap-12">
          <div className="min-w-0">
            <div className="relative mx-auto mb-6 aspect-[16/9] max-w-2xl overflow-hidden rounded-[1.5rem] bg-[#f6f4ef] lg:mx-0 lg:max-w-none">
              <Image
                src={post.image}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 720px"
                priority
              />
            </div>

            {post.images && post.images.filter((src) => src !== post.image).length > 0 && (
              <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {post.images
                  .filter((src) => src !== post.image)
                  .map((src) => (
                    <div
                      key={src}
                      className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#f6f4ef]"
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width:768px) 50vw, 220px"
                      />
                    </div>
                  ))}
              </div>
            )}

            <div
              className="blog-prose space-y-4 text-[15px] leading-[1.75] text-[#44403c] sm:text-base [&_a]:font-semibold [&_a]:text-[#1f5c45] [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-[#1f5c45]/35 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:font-display [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-ink [&_h3]:font-display [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-ink [&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-2xl [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />

            <p className="mt-10 rounded-2xl border border-line bg-[#fafaf8] px-5 py-4 text-xs leading-relaxed text-muted">
              Traditional herbal notes are for general education. They are not medical advice.
              Consult a qualified practitioner for personal health questions.
            </p>
          </div>

          <div className="lg:pt-1">
            <BlogRelatedProducts products={relatedProducts} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-line bg-[#fafaf8] py-14 sm:py-16">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1f4d3a]/70">
                  Keep reading
                </p>
                <h2 className="font-display mt-1.5 text-2xl font-bold text-ink sm:text-3xl">
                  More to read
                </h2>
              </div>
              <Link
                href="/blogs"
                className="text-sm font-semibold text-[#1f5c45] hover:underline"
              >
                All blogs →
              </Link>
            </div>

            <div
              className={`mt-8 grid gap-6 sm:gap-8 ${
                related.length === 1
                  ? "max-w-md"
                  : related.length === 2
                    ? "sm:grid-cols-2"
                    : "sm:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {related.map((p) => (
                <article key={p.slug} className="group flex flex-col">
                  <Link
                    href={`/blogs/${p.slug}`}
                    className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#f0ebe3]"
                  >
                    <Image
                      src={p.image}
                      alt=""
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                    />
                  </Link>
                  <div className="mt-4 flex flex-1 flex-col">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1f4d3a]/70">
                      <span>{p.category}</span>
                      <span className="text-[#1f4d3a]/30">·</span>
                      <span>{formatBlogDate(p.date)}</span>
                      <span className="text-[#1f4d3a]/30">·</span>
                      <span>{p.readMinutes} min</span>
                    </div>
                    <Link href={`/blogs/${p.slug}`}>
                      <h3 className="font-display mt-2 text-xl font-bold leading-snug text-ink transition group-hover:text-[#1f5c45] sm:text-[1.35rem]">
                        {p.title}
                      </h3>
                    </Link>
                    {p.excerpt ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                        {p.excerpt}
                      </p>
                    ) : null}
                    <Link
                      href={`/blogs/${p.slug}`}
                      className="mt-3 text-sm font-semibold text-[#1f5c45] hover:underline"
                    >
                      Read article →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
