"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  table: "products" | "blog_posts" | "contact_messages";
  id: string;
  label?: string;
  redirectTo?: string;
  confirmMessage?: string;
};

export function DeleteButton({
  table,
  id,
  label = "Delete",
  redirectTo,
  confirmMessage = "Delete this item permanently?",
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!window.confirm(confirmMessage)) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from(table).delete().eq("id", id);
    setLoading(false);
    if (error) {
      window.alert(error.message);
      return;
    }
    if (redirectTo) {
      router.push(redirectTo);
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {loading ? "Deleting…" : label}
    </button>
  );
}
