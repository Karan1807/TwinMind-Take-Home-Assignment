export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      <main className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl shadow-black/50 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
          Mnemonic
        </p>
        <h1 className="mb-3 mt-2 text-3xl font-semibold text-white">
          Welcome back
        </h1>
        <p className="mb-8 text-sm text-zinc-400">
          Sign in to upload audio, documents, text, images, and more in a
          unified workspace.
        </p>

        <div className="space-y-3">
          <a
            href="/signup"
            className="inline-flex w-full items-center justify-center rounded-xl bg-white/90 px-4 py-3 text-sm font-medium text-zinc-900 shadow-lg shadow-black/30 transition hover:bg-white"
          >
            Create an account
          </a>
          <a
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-700/80 px-4 py-3 text-sm font-medium text-zinc-100 shadow-lg shadow-black/25 transition hover:border-white/30 hover:bg-white/5"
          >
            Log in
          </a>
          <a
            href="/dashboard"
            className="inline-flex w-full items-center justify-center rounded-xl border border-emerald-500/40 px-4 py-3 text-sm font-medium text-emerald-200 shadow-lg shadow-emerald-900/40 transition hover:border-emerald-300/80 hover:bg-emerald-500/10"
          >
            Go to dashboard
          </a>
        </div>
      </main>
    </div>
  );
}
