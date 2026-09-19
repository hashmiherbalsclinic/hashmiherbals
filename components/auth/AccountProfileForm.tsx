"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { CustomerProfile } from "@/lib/auth/customer";

export function AccountProfileForm({ profile }: { profile: CustomerProfile }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
      })
      .eq("id", profile.id);

    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setMessage("Profile saved.");
    router.refresh();
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-[#1B4332]">Profile</h2>
          <p className="mt-1 text-sm text-stone-500">{profile.email}</p>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-[#1B4332] transition hover:bg-stone-50"
        >
          Sign out
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {message}
          </div>
        )}

        <label className="block text-sm font-medium text-[#1B4332]">
          Full name
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1.5 h-12 w-full rounded-xl border border-stone-300/80 bg-[#FDFBF7] px-4 text-sm outline-none transition focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/10"
          />
        </label>

        <label className="block text-sm font-medium text-[#1B4332]">
          Phone
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1.5 h-12 w-full rounded-xl border border-stone-300/80 bg-[#FDFBF7] px-4 text-sm outline-none transition focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/10"
            placeholder="03XX XXXXXXX"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 items-center rounded-full bg-[#1B4332] px-6 text-sm font-semibold text-white transition hover:bg-[#143326] disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
