import { unstable_cache } from "next/cache";
import {
  MAINTENANCE_MODE_KEY,
  SITE_SETTINGS_CACHE_TAG,
} from "@/lib/maintenance";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";

export { MAINTENANCE_MODE_KEY, SITE_SETTINGS_CACHE_TAG };

function parseBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true" || value === "1";
  if (typeof value === "number") return value === 1;
  return false;
}

async function queryMaintenanceMode(): Promise<boolean> {
  const supabase = createPublicClient();
  if (!supabase) return false;

  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", MAINTENANCE_MODE_KEY)
      .maybeSingle();

    if (error) {
      console.error("queryMaintenanceMode", error);
      return false;
    }
    return parseBool(data?.value);
  } catch (e) {
    console.error("queryMaintenanceMode", e);
    return false;
  }
}

/** Cached read for storefront / middleware-adjacent server usage. */
export async function isMaintenanceMode(): Promise<boolean> {
  return unstable_cache(queryMaintenanceMode, ["maintenance-mode"], {
    revalidate: 15,
    tags: [SITE_SETTINGS_CACHE_TAG],
  })();
}

/** Uncached read for admin UI. */
export async function getMaintenanceMode(): Promise<boolean> {
  return queryMaintenanceMode();
}

export async function setMaintenanceMode(
  enabled: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { ok: false, error: "Admin access required." };
  }

  const { error } = await supabase.from("site_settings").upsert(
    {
      key: MAINTENANCE_MODE_KEY,
      value: enabled,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

  if (error) {
    console.error("setMaintenanceMode", error);
    return { ok: false, error: error.message || "Could not update setting." };
  }

  try {
    const { revalidatePath, revalidateTag } = await import("next/cache");
    revalidateTag(SITE_SETTINGS_CACHE_TAG);
    revalidatePath("/", "layout");
    revalidatePath("/under-construction");
  } catch {
    // best-effort
  }

  return { ok: true };
}
