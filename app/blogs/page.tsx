import Image from "next/image";
import Link from "next/link";
import { fetchBlogPosts, formatBlogDate } from "@/lib/blogs";

export const metadata = {
  title: "Blogs",
  description:
    "Herbal wellness notes, traditional remedies, and shopping tips from Hashmi Herbals.",
};

export const revalidate = 60;

export default async function BlogsPage() {
  const posts = await fetchBlogPosts();

  return (
    <div className="bg-white">
      <section className="border-b border-line bg-[#fafaf8]">
        <div className="container-page py-14 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest">
            From our herbalists
          </p>
          <h1 className="font-display mt-3 max-w-2xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Blogs
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">
            Simple guides on oils, majoon, salajeet, digestion, and everyday herbal care.
          </p>
        </div>
      </section>

      <section className="container-page py-12 sm:py-16">
        {posts.length === 0 ? (
          <p className="text-center text-sm text-muted">No posts published yet.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article key={post.slug} className="group flex flex-col">
                <Link
                  href={`/blogs/${post.slug}`}
                  className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#f6f4ef]"
                >
                  <Image
                    src={post.image}
                    alt=""
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                  />
                </Link>
                <div className="mt-4 flex flex-1 flex-col">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1f4d3a]/70">
                    <span>{post.category}</span>
                    <span className="text-[#1f4d3a]/30">·</span>
                    <span>{formatBlogDate(post.date)}</span>
                    <span className="text-[#1f4d3a]/30">·</span>
                    <span>{post.readMinutes} min read</span>
                  </div>
                  <Link href={`/blogs/${post.slug}`}>
                    <h2 className="font-display mt-2 text-2xl font-bold leading-snug text-ink transition group-hover:text-[#1f5c45]">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                    {post.excerpt}
                  </p>
                  <Link
                    href={`/blogs/${post.slug}`}
                    className="mt-4 text-sm font-semibold text-green hover:underline"
                  >
                    Read more →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
