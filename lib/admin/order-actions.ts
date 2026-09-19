"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." as const, supabase: null, user: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { error: "Admin access required." as const, supabase: null, user: null };
  }

  return { error: null, supabase, user };
}

/** Permanently delete every order (and cascaded order items). Requires admin password. */
export async function deleteAllOrders(password: string) {
  const pwd = password?.trim() ?? "";
  if (!pwd) return { error: "Enter your admin password to confirm." };

  const { error: authError, supabase, user } = await requireAdmin();
  if (authError || !supabase || !user) {
    return { error: authError || "Unauthorized." };
  }

  if (!user.email) {
    return { error: "Admin account has no email for password confirmation." };
  }

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: pwd,
  });

  if (reauthError) {
    return { error: "Incorrect admin password." };
  }

  const { error, count } = await supabase
    .from("orders")
    .delete({ count: "exact" })
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (error) {
    console.error("deleteAllOrders", error);
    return { error: error.message || "Could not delete orders." };
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/account");

  return { ok: true as const, deleted: count ?? 0 };
}
