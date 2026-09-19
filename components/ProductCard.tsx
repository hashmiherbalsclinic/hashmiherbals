"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Star } from "lucide-react";
import { formatPrice, type Product } from "@/lib/catalog";
import { useCart } from "@/store/cart";

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);
  const discount =
    product.compareAt && product.compareAt > product.price
      ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
      : 0;
  const benefit =
    product.tagline || product.benefits?.[0] || "Traditional Unani herbal care";

  const handleAdd = () => {
    add(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
      <Link
        href={`/shop/${product.slug}`}
        className="relative aspect-[4/5] overflow-hidden bg-[#F5F1E9]"
      >
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          sizes="(max-width:640px) 50vw, 280px"
        />

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="rounded-full bg-[#1B4332] px-2.5 py-1 text-[10px] font-bold text-white">
              -{discount}%
            </span>
          )}
          {product.bestseller && (
            <span className="rounded-full bg-[#C89D42] px-2.5 py-1 text-[10px] font-bold text-white">
              Bestseller
            </span>
          )}
          {product.newArrival && !product.bestseller && (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-[#1B4332] shadow-sm">
              Pure Organic
            </span>
          )}
        </div>

      </Link>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
        <div className="flex items-center gap-1 text-[11px] text-[#8a918c]">
          <Star className="h-3 w-3 fill-[#C89D42] text-[#C89D42]" />
          {product.rating} · {product.reviews}
        </div>
        <Link href={`/shop/${product.slug}`}>
          <h3 className="mt-1.5 line-clamp-2 font-display text-lg font-bold leading-snug text-[#141414] transition group-hover:text-[#1B4332]">
            {product.title}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#6b7280]">{benefit}</p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-base font-bold text-[#1B4332]">{formatPrice(product.price)}</span>
          {product.compareAt && (
            <span className="text-sm text-[#9ca3af] line-through">
              {formatPrice(product.compareAt)}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className={`mt-4 flex h-12 min-h-12 w-full items-center justify-center rounded-full text-sm font-semibold transition ${
            added
              ? "bg-[#406343] text-white"
              : "bg-[#1B4332] text-white hover:bg-[#143528]"
          }`}
        >
          {added ? "Added" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}
