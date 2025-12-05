"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import NeuralBackground from "@/app/components/NeuralBackground";

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
    <div className="min-h-screen flex relative text-white overflow-hidden">
      {/* Neural Network Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 z-0">
        <NeuralBackground />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 w-full">
        <div className="w-full max-w-md rounded-xl border border-blue-500/30 bg-black/30 backdrop-blur-sm p-8 shadow-2xl shadow-blue-500/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Mnemonic</h1>
              <p className="text-xs text-blue-300/80 uppercase tracking-wider">
                Your AI Memory Assistant
              </p>
            </div>
          </div>

          <p className="text-xs uppercase tracking-[0.3em] text-blue-300/60 mb-2">
            Welcome back
          </p>
          <h2 className="mb-2 text-3xl font-semibold text-white">Log in</h2>
          <p className="mb-6 text-sm text-blue-200/70">
            Access your uploads and continue where you left off.
          </p>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200 backdrop-blur-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200 backdrop-blur-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-xs uppercase tracking-wide text-blue-300/70"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="w-full rounded-lg border border-blue-500/30 bg-black/30 px-3 py-2 text-sm text-white shadow-inner transition focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/40"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-xs uppercase tracking-wide text-blue-300/70"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="w-full rounded-lg border border-blue-500/30 bg-black/30 px-3 py-2 text-sm text-white shadow-inner transition focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/40"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/50 border border-blue-400/80 transition-all hover:shadow-blue-500/70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-blue-200/70">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-blue-300 underline-offset-4 hover:text-blue-200 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
