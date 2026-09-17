import { MessagesList } from "@/components/admin/MessagesList";
import type { ContactMessageRow } from "@/lib/admin/types";
import { createClient } from "@/lib/supabase/server";

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  const messages = (data ?? []) as ContactMessageRow[];
  const newCount = messages.filter((m) => m.status === "new").length;

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">
        {messages.length} messages
        {newCount > 0 ? ` · ${newCount} new` : ""}
      </p>
      <MessagesList messages={messages} />
    </div>
  );
}
