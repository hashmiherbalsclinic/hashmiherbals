import { AdminShell } from "@/components/admin/AdminShell";

/** Gemini blog/product generation can exceed the default 10s serverless limit. */
export const maxDuration = 60;

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
