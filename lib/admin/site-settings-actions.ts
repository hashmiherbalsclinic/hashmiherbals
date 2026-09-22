"use server";

import { setMaintenanceMode } from "@/lib/site-settings";

export async function updateMaintenanceMode(enabled: boolean) {
  return setMaintenanceMode(enabled);
}
