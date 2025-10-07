// components/auth/AuthCard.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type Props = {
  initialTab?: "signin" | "signup";
  callbackUrl?: string;
};

export default function AuthCard({ initialTab = "signin", callbackUrl = "/profile" }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">(initialTab);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");
    setErr(null);
    setLoading(true);
    await signIn("credentials", { redirect: true, email, password, callbackUrl });
    setLoading(false);
  }

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "");
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");

    setErr(null);
    setLoading(true);
    const resp = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const json = await resp.json().catch(() => ({}));
    if (!resp.ok || json?.ok === false) {
      setLoading(false);
      setErr(json?.error || "Could not create account");
      return;
    }
    await signIn("credentials", { redirect: true, email, password, callbackUrl });
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow max-w-md">
      {/* Optional heading */}
      <h2 className="mb-4 text-xl font-semibold">
        {mode === "signin" ? "Sign in to your account" : "Create your account"}
      </h2>

      {err && (
        <p role="alert" aria-live="polite" className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">
          {err}
        </p>
      )}

      {mode === "signin" ? (
        <form onSubmit={handleSignIn} className="space-y-4" noValidate>
          <div>
            <label htmlFor="signin-email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="signin-email"
              name="email"
              type="email"
              autoComplete="username"
              required
              className="mt-1 w-full rounded border p-2"
            />
          </div>
          <div>
            <label htmlFor="signin-password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="signin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 w-full rounded border p-2"
            />
          </div>

          {/* Bottom buttons: secondary toggle + single primary submit */}
          <div className="mt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="rounded border border-[#8B4513] px-4 py-2 text-[#8B4513] hover:bg-[#8B4513]/10"
            >
              Create account
            </button>
            <button
              type="submit"
              disabled={loading}
              // aria-disabled={loading}
              className="rounded bg-[#8B4513] px-4 py-2 text-white hover:bg-[#7b3f00] disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSignUp} className="space-y-4" noValidate>
          <div>
            <label htmlFor="signup-name" className="block text-sm font-medium">
              Name
            </label>
            <input id="signup-name" name="name" type="text" className="mt-1 w-full rounded border p-2" />
          </div>
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 w-full rounded border p-2"
            />
          </div>
          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="mt-1 w-full rounded border p-2"
            />
          </div>

          {/* Bottom buttons: secondary toggle + single primary submit */}
          <div className="mt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="rounded border border-[#8B4513] px-4 py-2 text-[#8B4513] hover:bg-[#8B4513]/10"
            >
              Back to sign in
            </button>
            <button
              type="submit"
              disabled={loading}
              // aria-disabled={loading}
              className="rounded bg-[#8B4513] px-4 py-2 text-white hover:bg-[#7b3f00] disabled:opacity-50"
            >
              {loading ? "Creating…" : "Create account"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
