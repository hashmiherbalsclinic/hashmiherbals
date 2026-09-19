"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AccountNavButton() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setLoggedIn(Boolean(data.user));
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session?.user));
      setReady(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Link
      href={loggedIn ? "/account" : "/login"}
      className="hidden rounded-full p-2.5 text-[#1B4332] transition hover:bg-stone-100/80 sm:inline-flex"
      aria-label={loggedIn ? "My account" : "Sign in"}
      title={ready ? (loggedIn ? "My account" : "Sign in") : "Account"}
    >
      <User className="h-5 w-5" strokeWidth={1.75} />
    </Link>
  );
}
