/** Shared cache tag — keep free of Node-only imports so middleware can use it. */
export const SITE_SETTINGS_CACHE_TAG = "site-settings";
export const MAINTENANCE_MODE_KEY = "maintenance_mode";

/**
 * Edge-safe maintenance flag check for middleware.
 * Uses a short-lived fetch cache so the public site isn't hammering Supabase.
 */
export async function fetchMaintenanceModeEdge(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;

  try {
    const res = await fetch(
      `${url}/rest/v1/site_settings?key=eq.${MAINTENANCE_MODE_KEY}&select=value`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          Accept: "application/json",
        },
        next: { revalidate: 10, tags: [SITE_SETTINGS_CACHE_TAG] },
      }
    );

    if (!res.ok) return false;
    const rows = (await res.json()) as Array<{ value: unknown }>;
    const value = rows?.[0]?.value;
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return value === "true" || value === "1";
    return false;
  } catch {
    return false;
  }
}

export function isMaintenanceBypassPath(pathname: string): boolean {
  if (pathname === "/under-construction") return true;
  if (pathname.startsWith("/admin")) return true;
  if (pathname.startsWith("/auth")) return true;
  return false;
}
