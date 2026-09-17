import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[#0f2a22] text-white/70">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
