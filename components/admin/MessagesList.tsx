"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { MessageStatusBadge } from "@/components/admin/StatusBadge";
import type { ContactMessageRow } from "@/lib/admin/types";
import { createClient } from "@/lib/supabase/client";

export function MessagesList({ messages }: { messages: ContactMessageRow[] }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);

  async function openMessage(msg: ContactMessageRow) {
    const next = openId === msg.id ? null : msg.id;
    setOpenId(next);

    if (next && msg.status === "new") {
      const supabase = createClient();
      await supabase
        .from("contact_messages")
        .update({ status: "read" })
        .eq("id", msg.id);
      router.refresh();
    }
  }

  if (messages.length === 0) {
    return (
      <p className="rounded-2xl border border-[#d8e0d6] bg-white px-5 py-12 text-center text-sm text-muted shadow-sm">
        No messages yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((msg) => {
        const open = openId === msg.id;
        return (
          <div
            key={msg.id}
            className="rounded-2xl border border-[#d8e0d6] bg-white shadow-sm"
          >
            <button
              type="button"
              onClick={() => openMessage(msg)}
              className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-[#0f2a22]">{msg.name}</p>
                  <MessageStatusBadge status={msg.status} />
                </div>
                <p className="mt-0.5 truncate text-sm text-muted">{msg.email}</p>
                {!open && (
                  <p className="mt-2 line-clamp-1 text-sm text-[#0f2a22]/80">
                    {msg.message}
                  </p>
                )}
              </div>
              <time className="shrink-0 text-xs text-muted">
                {new Date(msg.created_at).toLocaleDateString("en-PK", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </time>
            </button>

            {open && (
              <div className="border-t border-[#e8eee6] px-5 py-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#0f2a22]">
                  {msg.message}
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <a
                    href={`mailto:${msg.email}`}
                    className="rounded-lg bg-[#1f5c45] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#174a37]"
                  >
                    Reply by email
                  </a>
                  <DeleteButton
                    table="contact_messages"
                    id={msg.id}
                    confirmMessage="Delete this message?"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
