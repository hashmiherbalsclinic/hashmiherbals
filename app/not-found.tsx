import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-20">
      <div className="w-full max-w-lg rounded-2xl border border-[#d8e0d6] bg-white p-8 text-center shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#1f5c45]/70">
          404
        </p>
        <h1 className="font-display mt-2 text-3xl font-bold text-[#0f2a22]">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          This page doesn’t exist or may have been moved. Head back to the shop
          or browse our herbal blogs.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn-primary inline-flex">
            Go home
          </Link>
          <Link
            href="/shop"
            className="inline-flex rounded-xl border border-[#d8e0d6] bg-white px-5 py-2.5 text-sm font-semibold text-[#0f2a22] hover:bg-[#f3f6f2]"
          >
            Shop
          </Link>
          <Link
            href="/blogs"
            className="inline-flex rounded-xl border border-[#d8e0d6] bg-white px-5 py-2.5 text-sm font-semibold text-[#0f2a22] hover:bg-[#f3f6f2]"
          >
            Blogs
          </Link>
        </div>
      </div>
    </div>
  );
}
