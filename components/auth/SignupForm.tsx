"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (password.length < 6) {
      setLoading(false);
      setError("Password must be at least 6 characters.");
      return;
    }

    const supabase = createClient();
    const origin = window.location.origin;

    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
        },
      },
    });

    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }

    // If email confirmation is disabled, session is returned immediately
    if (data.session) {
      if (data.user) {
        await supabase
          .from("profiles")
          .update({
            full_name: fullName.trim(),
            phone: phone.trim() || null,
            email: email.trim().toLowerCase(),
          })
          .eq("id", data.user.id);
      }
      router.push(next.startsWith("/") ? next : "/account");
      router.refresh();
      return;
    }

    setLoading(false);
    setInfo("Check your email to confirm your account, then sign in.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      {info && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {info}
        </div>
      )}

      <label className="block text-sm font-medium text-[#1B4332]">
        Full name
        <input
          type="text"
          required
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1.5 h-12 w-full rounded-xl border border-stone-300/80 bg-[#FDFBF7] px-4 text-sm outline-none transition focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/10"
          placeholder="Your name"
        />
      </label>

      <label className="block text-sm font-medium text-[#1B4332]">
        Email
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 h-12 w-full rounded-xl border border-stone-300/80 bg-[#FDFBF7] px-4 text-sm outline-none transition focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/10"
          placeholder="you@email.com"
        />
      </label>

      <label className="block text-sm font-medium text-[#1B4332]">
        Phone <span className="font-normal text-stone-400">(optional)</span>
        <input
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1.5 h-12 w-full rounded-xl border border-stone-300/80 bg-[#FDFBF7] px-4 text-sm outline-none transition focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/10"
          placeholder="03XX XXXXXXX"
        />
      </label>

      <PasswordInput
        label="Password"
        required
        minLength={6}
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="At least 6 characters"
      />

      <button
        type="submit"
        disabled={loading}
        className="flex h-12 w-full items-center justify-center rounded-full bg-[#1B4332] text-sm font-semibold text-white transition hover:bg-[#143326] disabled:opacity-60"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-stone-600">
        Already have an account?{" "}
        <Link
          href={`/login${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-semibold text-[#1B4332] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
