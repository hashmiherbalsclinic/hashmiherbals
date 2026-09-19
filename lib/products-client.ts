import type { Product } from "@/lib/catalog";
import type { ProductRow } from "@/lib/admin/types";
import { mapProductRow } from "@/lib/products-map";

export async function fetchProductsClient(opts?: {
  category?: string;
  limit?: number;
  q?: string;
}): Promise<Product[]> {
  const { createClient, isSupabaseConfigured } = await import(
    "@/lib/supabase/client"
  );
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = createClient();
    let query = supabase.from("products").select("*").eq("active", true);
    if (opts?.category) query = query.eq("category", opts.category);
    if (opts?.q?.trim()) {
      query = query.ilike("title", `%${opts.q.trim()}%`);
    }
    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(opts?.limit ?? 24);
    if (error || !data) return [];
    return (data as ProductRow[]).map(mapProductRow);
  } catch (e) {
    console.error("fetchProductsClient", e);
    return [];
  }
}
