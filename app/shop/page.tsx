import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { categories } from "@/lib/catalog";
import { fetchProducts } from "@/lib/products";

export const metadata = { title: "Shop" };
export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const list = await fetchProducts({ category });

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Shop</h1>
      <p className="mt-2 text-muted">Authentic Unani remedies & pure botanicals</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/shop"
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            !category ? "bg-ink text-white" : "border border-line bg-white hover:border-green"
          }`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/shop?category=${c.id}`}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              category === c.id ? "bg-ink text-white" : "border border-line bg-white hover:border-green"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="mt-10 text-muted">
          No products yet. Add them in{" "}
          <Link href="/admin/products/new" className="font-semibold text-green hover:underline">
            Admin → Products
          </Link>
          .
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4 lg:gap-5">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
