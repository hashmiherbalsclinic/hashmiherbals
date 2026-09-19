import { CategorySection } from "@/components/CategorySection";
import { HeroSection } from "@/components/hero/HeroSection";
import { BrandStory } from "@/components/home/BrandStory";
import { CuratedProducts } from "@/components/home/CuratedProducts";
import { TrustTicker } from "@/components/home/TrustTicker";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { fetchHeroProducts, fetchProducts } from "@/lib/products";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense } from "react";

const ContactSection = dynamic(
  () => import("@/components/ContactSection").then((m) => m.ContactSection),
  {
    loading: () => (
      <div className="mx-auto max-w-6xl animate-pulse px-6 py-20">
        <div className="h-64 rounded-3xl bg-stone-100" />
      </div>
    ),
  }
);

export async function HomePage() {
  const [heroProducts, newArrivals, bestsellers, exploreProducts] = await Promise.all([
    fetchHeroProducts(3),
    fetchProducts({ newArrival: true, limit: 12 }),
    fetchProducts({ bestseller: true, limit: 12 }),
    fetchProducts({
      excludeBestseller: true,
      excludeNewArrival: true,
      random: true,
      limit: 8,
    }),
  ]);

  return (
    <>
      <HeroSection products={heroProducts} />
      <TrustTicker />
      <CategorySection />
      <CuratedProducts bestsellers={bestsellers} newArrivals={newArrivals} />
      <BrandStory />

      {exploreProducts.length > 0 && (
        <section className="relative overflow-hidden border-y border-stone-200/60 bg-white py-20">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-12 xl:px-16">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B4332]/65">
                    From the Cabinet
                  </p>
                  <h2 className="font-display mt-2 text-3xl font-bold text-[#141414] sm:text-4xl">
                    Explore More
                  </h2>
                </div>
                <Link
                  href="/shop"
                  className="text-sm font-semibold text-[#1B4332] transition hover:underline"
                >
                  Browse collection →
                </Link>
              </div>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {exploreProducts.map((p, i) => (
                <Reveal key={`explore-${p.id}`} delay={(i % 4) * 0.08}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl animate-pulse px-6 py-20">
            <div className="h-64 rounded-3xl bg-stone-100" />
          </div>
        }
      >
        <ContactSection />
      </Suspense>
    </>
  );
}
