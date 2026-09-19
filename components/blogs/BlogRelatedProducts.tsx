import Image from "next/image";
import Link from "next/link";
import { formatPrice, type Product } from "@/lib/catalog";

export function BlogRelatedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null;

  return (
    <aside className="lg:sticky lg:top-28">
      <div className="rounded-2xl border border-line bg-[#fafaf8] p-5 sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1f4d3a]/70">
          Shop this topic
        </p>
        <h2 className="font-display mt-1.5 text-xl font-bold text-ink">
          Related products
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Herbal picks that match what this post covers.
        </p>

        <ul className="mt-5 space-y-3">
          {products.map((product) => (
            <li key={product.id}>
              <Link
                href={`/shop/${product.slug}`}
                className="group flex gap-3 rounded-xl border border-transparent bg-white p-2.5 transition hover:border-[#1f5c45]/25"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#f6f4ef]">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                    sizes="64px"
                  />
                </div>
                <div className="min-w-0 flex-1 py-0.5">
                  <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink transition group-hover:text-[#1f5c45]">
                    {product.title}
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#1B4332]">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/shop"
          className="mt-5 inline-flex text-sm font-semibold text-green hover:underline"
        >
          Browse all products →
        </Link>
      </div>
    </aside>
  );
}
