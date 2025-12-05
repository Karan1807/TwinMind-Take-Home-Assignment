"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    lastname: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.email || !form.password || !form.name || !form.lastname) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      setSuccess("Account created. You can now log in.");
      setForm({ email: "", password: "", name: "", lastname: "" });
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
          Join Mnemonic
        </p>
        <h1 className="mb-2 mt-2 text-3xl font-semibold text-white">
          Create an account
        </h1>
        <p className="mb-6 text-sm text-zinc-400">
          Securely upload audio, docs, URLs, and more in one place.
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
          <div className="flex gap-3">
            <div className="flex-1">
              <label
                htmlFor="name"
                className="mb-1 block text-xs uppercase tracking-wide text-zinc-500"
              >
                First name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="given-name"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white shadow-inner shadow-black/20 transition focus:border-white focus:outline-none focus:ring-1 focus:ring-white/50"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="lastname"
                className="mb-1 block text-xs uppercase tracking-wide text-zinc-500"
              >
                Last name
              </label>
              <input
                id="lastname"
                type="text"
                autoComplete="family-name"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white shadow-inner shadow-black/20 transition focus:border-white focus:outline-none focus:ring-1 focus:ring-white/50"
                value={form.lastname}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastname: e.target.value }))
                }
              />
            </div>
          </div>

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
              autoComplete="new-password"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white shadow-inner shadow-black/20 transition focus:border-white focus:outline-none focus:ring-1 focus:ring-white/50"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
            />
            <p className="mt-2 text-xs text-zinc-500">
              At least 8 characters. Use a mix of letters, numbers, and symbols.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-white/90 px-4 py-3 text-sm font-semibold text-zinc-900 shadow-lg shadow-black/40 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-white/50"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-white underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
