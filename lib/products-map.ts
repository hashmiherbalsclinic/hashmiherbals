import { categories, type CategoryId, type Product, type ProductSize } from "@/lib/catalog";
import type { ProductRow, ProductWeightRow } from "@/lib/admin/types";

function isCategoryId(value: string): value is CategoryId {
  return categories.some((c) => c.id === value);
}

export function weightToSize(w: ProductWeightRow): ProductSize {
  const value = Number(w.value) || 0;
  const unit = w.unit === "kg" ? "kg" : "g";
  const grams = unit === "kg" ? value * 1000 : value;
  const label = unit === "kg" ? `${value} kg` : `${value} g`;
  return {
    id: `${grams}g`,
    label,
    grams,
    unit,
    price: Number(w.price) || 0,
    compareAt:
      w.compare_at != null ? Number(w.compare_at) : undefined,
  };
}

export function mapProductWeights(weights?: ProductWeightRow[] | null): ProductSize[] | undefined {
  if (!weights?.length) return undefined;
  return weights
    .filter((w) => Number(w.value) > 0)
    .map(weightToSize)
    .sort((a, b) => a.grams - b.grams);
}

export function mapProductRow(row: ProductRow): Product {
  const category: CategoryId = isCategoryId(row.category) ? row.category : "oils";
  const sizes = mapProductWeights(row.weights);
  const defaultSize = sizes?.[0];
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    benefits: row.benefits ?? [],
    price: defaultSize?.price ?? (Number(row.price) || 0),
    compareAt:
      defaultSize?.compareAt ??
      (row.compare_at != null ? Number(row.compare_at) : undefined),
    stock: row.stock ?? 0,
    category,
    image: row.image || "/images/categories/oils.webp",
    images: row.images ?? [],
    featured: row.featured,
    bestseller: row.bestseller,
    newArrival: row.new_arrival,
    rating: Number(row.rating) || 5,
    reviews: row.reviews ?? 0,
    tagline: row.tagline ?? undefined,
    tasteNote: row.taste_note ?? undefined,
    ingredients: row.ingredients?.length ? row.ingredients : undefined,
    howToUse: row.how_to_use?.length ? row.how_to_use : undefined,
    highlights: row.highlights?.length ? row.highlights : undefined,
    faqs: row.faqs?.length ? row.faqs : undefined,
    sizes,
  };
}
