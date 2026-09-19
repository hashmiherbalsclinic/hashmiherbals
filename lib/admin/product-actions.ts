"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { revalidateProductsCache } from "@/lib/admin/actions";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." as const, supabase: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { error: "Admin access required." as const, supabase: null };
  }

  return { error: null, supabase };
}

/** Permanently delete every product row. Admin only. */
export async function deleteAllProducts() {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) return { error: authError || "Unauthorized." };

  const { error, count } = await supabase
    .from("products")
    .delete({ count: "exact" })
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (error) {
    console.error("deleteAllProducts", error);
    return { error: error.message || "Could not delete products." };
  }

  try {
    await revalidateProductsCache();
  } catch (e) {
    console.error("revalidateProductsCache failed", e);
  }
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");

  return { ok: true as const, deleted: count ?? 0 };
}
