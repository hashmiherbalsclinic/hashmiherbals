import { unstable_cache } from "next/cache";
import {
  categories,
  getProductDetailFromProduct,
  type CategoryId,
  type Product,
  type ProductDetail,
} from "@/lib/catalog";
import type { ProductRow } from "@/lib/admin/types";
import type { BlogPost } from "@/lib/blogs";
import { mapProductRow } from "@/lib/products-map";
import { createPublicClient } from "@/lib/supabase/public";

export { mapProductRow } from "@/lib/products-map";

export const PRODUCTS_CACHE_TAG = "products";
const REVALIDATE_SECONDS = 60;

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

function cacheKey(opts?: FetchOpts) {
  return [
    "products",
    opts?.category ?? "",
    opts?.featured ? "1" : "0",
    opts?.bestseller ? "1" : "0",
    opts?.newArrival ? "1" : "0",
    opts?.excludeBestseller ? "1" : "0",
    opts?.excludeNewArrival ? "1" : "0",
    opts?.random ? "1" : "0",
    String(opts?.limit ?? ""),
  ];
}

async function queryProducts(opts?: FetchOpts): Promise<Product[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];

  try {
    let query = supabase.from("products").select("*").eq("active", true);

    if (opts?.category) query = query.eq("category", opts.category);
    if (opts?.featured) query = query.eq("featured", true);
    if (opts?.bestseller) query = query.eq("bestseller", true);
    if (opts?.newArrival) query = query.eq("new_arrival", true);

    const needsPostFilter =
      Boolean(opts?.excludeBestseller) ||
      Boolean(opts?.excludeNewArrival) ||
      Boolean(opts?.random);

    if (opts?.limit && !needsPostFilter) {
      query = query.limit(opts.limit);
    } else if (opts?.limit && needsPostFilter) {
      // Fetch a modest buffer, then filter/shuffle client-side.
      query = query.limit(Math.max(opts.limit * 4, 24));
    }

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

export async function fetchProducts(opts?: FetchOpts): Promise<Product[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }

  return unstable_cache(() => queryProducts(opts), cacheKey(opts), {
    revalidate: REVALIDATE_SECONDS,
    tags: [PRODUCTS_CACHE_TAG],
  })();
}

async function queryProductBySlug(slug: string): Promise<ProductDetail | undefined> {
  const supabase = createPublicClient();
  if (!supabase) return undefined;

  try {
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

export async function fetchProductBySlug(slug: string): Promise<ProductDetail | undefined> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return undefined;
  }

  return unstable_cache(() => queryProductBySlug(slug), ["product", slug], {
    revalidate: REVALIDATE_SECONDS,
    tags: [PRODUCTS_CACHE_TAG, `product:${slug}`],
  })();
}

export async function fetchRelatedProducts(product: Product, limit = 4) {
  const list = await fetchProducts({ category: product.category, limit: limit + 8 });
  return list.filter((p) => p.id !== product.id).slice(0, limit);
}

const BLOG_CATEGORY_TO_PRODUCT: Record<string, CategoryId> = {
  oils: "oils",
  salajeet: "salajeet",
  majoon: "majoon",
  digestion: "digestion",
  powders: "powders",
  seeds: "seeds",
  "mens-care": "mens-care",
  "men's-care": "mens-care",
  "womens-care": "womens-care",
  "women's-care": "womens-care",
};

const CATEGORY_KEYWORDS: { id: CategoryId; words: string[] }[] = [
  { id: "oils", words: ["oil", "kalonji", "black seed", "massage"] },
  { id: "salajeet", words: ["salajeet", "shilajit", "resin"] },
  { id: "majoon", words: ["majoon", "paste"] },
  { id: "digestion", words: ["digest", "saunf", "stomach", "after meal"] },
  { id: "powders", words: ["powder", "safoof", "ground"] },
  { id: "seeds", words: ["seed", "flax", "til"] },
  { id: "mens-care", words: ["men", "vitality", "strength"] },
  { id: "womens-care", words: ["women", "hormonal", "ladies"] },
];

function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function blogTextHaystack(post: BlogPost) {
  const plainBody = post.bodyHtml.replace(/<[^>]+>/g, " ");
  return `${post.category} ${post.title} ${post.excerpt} ${plainBody}`.toLowerCase();
}

/** Map a blog post to the product categories it most likely discusses. */
export function inferBlogProductCategories(post: BlogPost): CategoryId[] {
  const matched = new Set<CategoryId>();
  const catKey = normalizeKey(post.category);
  const direct = BLOG_CATEGORY_TO_PRODUCT[catKey];
  if (direct) matched.add(direct);

  const haystack = blogTextHaystack(post);
  for (const entry of CATEGORY_KEYWORDS) {
    if (entry.words.some((w) => haystack.includes(w))) matched.add(entry.id);
  }

  return [...matched];
}

function scoreProductForBlog(product: Product, post: BlogPost, preferred: CategoryId[]) {
  let score = 0;
  const haystack = blogTextHaystack(post);
  const title = product.title.toLowerCase();
  const slug = product.slug.toLowerCase();

  if (preferred.includes(product.category)) score += 12;
  if (preferred[0] === product.category) score += 4;

  for (const word of title.split(/\s+/).filter((w) => w.length > 3)) {
    if (haystack.includes(word)) score += 3;
  }
  if (haystack.includes(slug.replace(/-/g, " "))) score += 5;

  const catName = categories.find((c) => c.id === product.category)?.name.toLowerCase();
  if (catName && haystack.includes(catName)) score += 2;

  if (product.featured) score += 1;
  if (product.bestseller) score += 2;

  return score;
}

/** Products that fit a blog’s topic (category + keyword overlap), with featured fallback. */
export async function fetchProductsRelatedToBlog(
  post: BlogPost,
  limit = 4
): Promise<Product[]> {
  const preferred = inferBlogProductCategories(post);
  const pool = await fetchProducts({ limit: 48 });
  if (!pool.length) return [];

  const ranked = [...pool]
    .map((p) => ({ p, score: scoreProductForBlog(p, post, preferred) }))
    .sort((a, b) => b.score - a.score);

  const strong = ranked.filter((r) => r.score > 0).map((r) => r.p);
  if (strong.length >= limit) return strong.slice(0, limit);

  const seen = new Set(strong.map((p) => p.id));
  const fillers = ranked.map((r) => r.p).filter((p) => !seen.has(p.id));
  return [...strong, ...fillers].slice(0, limit);
}

export async function fetchProductSlugs(limit = 100): Promise<string[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("products")
      .select("slug")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data.map((row) => row.slug as string).filter(Boolean);
  } catch {
    return [];
  }
}

/** Up to N products for the homepage hero - single parallel batch, no waterfalls. */
export async function fetchHeroProducts(limit = 3): Promise<Product[]> {
  const [featured, bestsellers, latest] = await Promise.all([
    fetchProducts({ featured: true, limit }),
    fetchProducts({ bestseller: true, limit: limit + 4 }),
    fetchProducts({ limit: limit + 8 }),
  ]);

  const fill: Product[] = [];
  const seen = new Set<string>();

  for (const list of [featured, bestsellers, latest]) {
    for (const p of list) {
      if (fill.length >= limit) return fill;
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      fill.push(p);
    }
  }

  return fill;
}
