"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const unauthorized = searchParams.get("error") === "unauthorized";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    unauthorized ? "You do not have admin access." : null
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !data.user) {
      setLoading(false);
      setError(authError?.message ?? "Sign in failed.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      setLoading(false);
      setError("You do not have admin access.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#0f2a22] px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, #74a13a55, transparent), radial-gradient(ellipse 60% 40% at 100% 100%, #1f5c4555, transparent)",
        }}
      />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Hashmi Admin
          </p>
          <p className="mt-2 text-sm text-white/55">Sign in to manage the clinic store</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-white/10 bg-white/95 p-6 shadow-2xl backdrop-blur sm:p-8"
        >
          {error && (
            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <label className="block text-sm font-medium text-[#0f2a22]">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#d8e0d6] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#74a13a] focus:ring-2 focus:ring-[#74a13a]/25"
              placeholder="admin@hashmiherbals.com"
            />
          </label>

          <label className="mt-4 block text-sm font-medium text-[#0f2a22]">
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#d8e0d6] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#74a13a] focus:ring-2 focus:ring-[#74a13a]/25"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-[#1f5c45] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#174a37] disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
