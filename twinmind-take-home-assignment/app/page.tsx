import NeuralBackground from "@/app/components/NeuralBackground";

export default function Home() {
  return (
    <div className="min-h-screen flex relative text-white overflow-hidden">
      {/* Neural Network Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 z-0">
        <NeuralBackground />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 w-full">
        <main className="w-full max-w-md rounded-xl border border-blue-500/30 bg-black/30 backdrop-blur-sm p-8 shadow-2xl shadow-blue-500/20">
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
            Welcome
          </p>
          <h2 className="mb-3 text-3xl font-semibold text-white">
            Welcome back
          </h2>
          <p className="mb-8 text-sm text-blue-200/70">
            Sign in to upload audio, documents, and text in a unified workspace.
          </p>

          <div className="space-y-3">
            <a
              href="/signup"
              className="inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/50 border border-blue-400/80 transition-all hover:shadow-blue-500/70"
            >
              Create an account
            </a>
            <a
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-950/60 via-blue-900/50 to-purple-950/60 text-white/90 border border-blue-500/20 px-4 py-3 text-sm font-semibold transition-all hover:bg-gradient-to-r hover:from-blue-500 hover:via-blue-600 hover:to-purple-600 hover:text-white hover:border-blue-400/80 hover:shadow-lg hover:shadow-blue-500/50"
            >
              Log in
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}
