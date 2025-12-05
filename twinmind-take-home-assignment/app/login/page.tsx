"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Invalid email or password");
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("currentUser", JSON.stringify(data.user));
      }

      setSuccess(`Welcome back, ${data.user.name}!`);
      // In a real app you'd persist auth; for now redirect to dashboard.
      setTimeout(() => {
        router.push("/dashboard");
      }, 650);
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/60 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
          Welcome back
        </p>
        <h1 className="mb-2 mt-2 text-3xl font-semibold text-white">Log in</h1>
        <p className="mb-6 text-sm text-zinc-400">
          Access your uploads and continue where you left off.
        </p>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-xs uppercase tracking-wide text-zinc-500"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white shadow-inner shadow-black/20 transition focus:border-white focus:outline-none focus:ring-1 focus:ring-white/50"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-xs uppercase tracking-wide text-zinc-500"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white shadow-inner shadow-black/20 transition focus:border-white focus:outline-none focus:ring-1 focus:ring-white/50"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-white/90 px-4 py-3 text-sm font-semibold text-zinc-900 shadow-lg shadow-black/40 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-white/50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-white underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
