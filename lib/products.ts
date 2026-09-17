import { createClient } from "@/lib/supabase/server";
import { getProductDetailFromProduct, type Product, type ProductDetail } from "@/lib/catalog";
import type { ProductRow } from "@/lib/admin/types";
import { mapProductRow } from "@/lib/products-map";

export { mapProductRow } from "@/lib/products-map";

type FetchOpts = {
  category?: string;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  excludeBestseller?: boolean;
  excludeNewArrival?: boolean;
  random?: boolean;
  limit?: number;
};

function shuffle<T>(list: T[]) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function fetchProducts(opts?: FetchOpts): Promise<Product[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }

  try {
    const supabase = await createClient();
    let query = supabase.from("products").select("*").eq("active", true);

    if (opts?.category) query = query.eq("category", opts.category);
    if (opts?.featured) query = query.eq("featured", true);
    if (opts?.bestseller) query = query.eq("bestseller", true);
    if (opts?.newArrival) query = query.eq("new_arrival", true);

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error || !data) {
      console.error("fetchProducts", error);
      return [];
    }

    let list = (data as ProductRow[]).map(mapProductRow);
    if (opts?.excludeBestseller) list = list.filter((p) => !p.bestseller);
    if (opts?.excludeNewArrival) list = list.filter((p) => !p.newArrival);
    if (opts?.random) list = shuffle(list);
    if (opts?.limit) list = list.slice(0, opts.limit);
    return list;
  } catch (e) {
    console.error("fetchProducts", e);
    return [];
  }
}

export async function fetchProductBySlug(slug: string): Promise<ProductDetail | undefined> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return undefined;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle();

    if (error || !data) return undefined;
    return getProductDetailFromProduct(mapProductRow(data as ProductRow));
  } catch (e) {
    console.error("fetchProductBySlug", e);
    return undefined;
  }
}

export async function fetchRelatedProducts(product: Product, limit = 4) {
  const list = await fetchProducts({ category: product.category, limit: limit + 8 });
  return list.filter((p) => p.id !== product.id).slice(0, limit);
}

/** Up to 3 products for the homepage hero: featured first, then bestsellers, then latest. */
export async function fetchHeroProducts(limit = 3): Promise<Product[]> {
  const featured = await fetchProducts({ featured: true, limit });
  if (featured.length >= limit) return featured.slice(0, limit);

  const seen = new Set(featured.map((p) => p.id));
  const fill: Product[] = [...featured];

  const bestsellers = await fetchProducts({ bestseller: true, limit: limit + 4 });
  for (const p of bestsellers) {
    if (fill.length >= limit) break;
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    fill.push(p);
  }

  if (fill.length >= limit) return fill.slice(0, limit);

  const latest = await fetchProducts({ limit: limit + 8 });
  for (const p of latest) {
    if (fill.length >= limit) break;
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    fill.push(p);
  }

  return fill.slice(0, limit);
}
