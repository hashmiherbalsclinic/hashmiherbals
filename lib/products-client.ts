import type { Product } from "@/lib/catalog";
import type { ProductRow } from "@/lib/admin/types";
import { mapProductRow } from "@/lib/products-map";

export async function fetchProductsClient(opts?: {
  category?: string;
  limit?: number;
}): Promise<Product[]> {
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  let query = supabase.from("products").select("*").eq("active", true);
  if (opts?.category) query = query.eq("category", opts.category);
  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(opts?.limit ?? 24);
  if (error || !data) return [];
  return (data as ProductRow[]).map(mapProductRow);
}
