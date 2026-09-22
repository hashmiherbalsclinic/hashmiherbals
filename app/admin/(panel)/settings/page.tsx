import { getMaintenanceMode } from "@/lib/site-settings";
import { MaintenanceToggle } from "@/components/admin/MaintenanceToggle";

export default async function AdminSettingsPage() {
  const maintenanceMode = await getMaintenanceMode();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <p className="text-sm text-[#5a6b63]">
        Control storefront visibility and other site-wide options.
      </p>
      <MaintenanceToggle initialEnabled={maintenanceMode} />
    </div>
  );
}
