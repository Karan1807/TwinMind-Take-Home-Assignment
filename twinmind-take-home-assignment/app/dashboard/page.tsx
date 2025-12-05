"use client";

import { useEffect, useMemo, useState } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabaseClient";
import NeuralBackground from "@/app/components/NeuralBackground";
import Sidebar from "@/app/components/Sidebar";
import { Brain } from "lucide-react";

const modalities = [
  {
    value: "audio",
    label: "Audio",
    emoji: "🎧",
    description: "Upload podcasts or voice notes",
  },
  {
    value: "document",
    label: "Document",
    emoji: "📄",
    description: "PDFs, DOCX, knowledge files",
  },
  {
    value: "plain text",
    label: "Plain Text",
    emoji: "✏️",
    description: "Quick snippets or notes",
  },
  {
    value: "images",
    label: "Images",
    emoji: "🖼️",
    description: "Screenshots and diagrams",
  },
];

type User = {
  id: string;
  email: string;
  name: string;
  lastname: string;
};

type Job = {
  id: string;
  modality: string;
  status: string;
  source_name: string | null;
  external_url: string | null;
  storage_path: string | null;
  created_at: string;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
};

const modalityMap = modalities.reduce<Record<string, (typeof modalities)[0]>>(
  (acc, item) => {
    acc[item.value] = item;
    return acc;
  },
  {}
);

export default function DashboardPage() {
  const [open, setOpen] = useState(false);
  const [activeView, setActiveView] = useState<
    "chat" | "memories" | "upload" | null
  >("chat");
  const [selectedModality, setSelectedModality] = useState<string | null>(null);
  const [form, setForm] = useState({
    sourceName: "",
    storagePath: "",
    notes: "",
  });
  const [user, setUser] = useState<User | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem("currentUser")
        : null;

    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        window.localStorage.removeItem("currentUser");
      }
    }

    setUserLoaded(true);
  }, []);

  const fetchJobs = async (userId: string) => {
    setJobsLoading(true);
    setJobsError(null);

    try {
      const res = await fetch(`/api/jobs?userId=${userId}`);
      const data = await res.json();

      if (!res.ok) {
        setJobsError(data.error ?? "Failed to fetch jobs");
        return;
      }

      setJobs(data.jobs ?? []);
    } catch (error) {
      console.error(error);
      setJobsError("Network error. Please try again.");
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchJobs(user.id);
    }
  }, [user?.id]);

  const selectedMeta = useMemo(
    () => (selectedModality ? modalityMap[selectedModality] : null),
    [selectedModality]
  );

  async function handleCreateJob(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!user?.id) {
      setSubmitError("You must be logged in.");
      return;
    }

    if (!selectedModality) {
      setSubmitError("Select a modality first.");
      return;
    }

    // For file-based modalities we require an actual file upload.
    const isFileModality =
      selectedModality === "audio" ||
      selectedModality === "document" ||
      selectedModality === "images" ||
      selectedModality === "plain text";

    if (isFileModality && !file) {
      setSubmitError("Please choose a file to upload.");
      return;
    }

    setCreating(true);
    try {
      let storagePath: string | null = form.storagePath || null;

      if (isFileModality && file) {
        const supabase = getBrowserSupabaseClient();
        const bucket = "uploads"; // ensure this bucket exists in Supabase Storage

        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const objectPath = `${
          user.id
        }/${selectedModality}/${Date.now()}-${safeName}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from(bucket)
          .upload(objectPath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Supabase storage upload error:", uploadError);
          setSubmitError("Failed to upload file to storage.");
          setCreating(false);
          return;
        }

        storagePath = uploadData.path;
      }

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          modality: selectedModality,
          sourceName: form.sourceName || (file ? file.name : null),
          storagePath,
          notes: form.notes || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error ?? "Failed to create job");
        return;
      }

      setForm({
        sourceName: "",
        storagePath: "",
        notes: "",
      });
      setFile(null);
      setSelectedModality(null);
      setOpen(false);
      if (activeView === "memories") {
        fetchJobs(user.id);
      }
    } catch (error) {
      console.error(error);
      setSubmitError("Network error. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  if (userLoaded && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-center text-white">
        <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-10 text-sm text-zinc-300">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Access denied
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            Please log in
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            We couldn&apos;t find an active session. Go back and sign in to view
            your dashboard.
          </p>
          <a
            href="/login"
            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-white/90 px-4 py-3 text-sm font-semibold text-zinc-900 shadow-lg shadow-black/40 transition hover:bg-white"
          >
            Return to login
          </a>
        </div>
      </div>
    );
  }

  // Calculate metrics from jobs
  const metrics = useMemo(() => {
    const completedJobs = jobs.filter((j) => j.status === "completed");
    const totalChunks = completedJobs.reduce((sum, job) => {
      const chunks = (job.metadata?.chunksCount as number) || 0;
      return sum + chunks;
    }, 0);

    // Estimate memory size (rough calculation)
    const memorySizeGB =
      totalChunks > 0 ? (totalChunks * 0.001).toFixed(1) : "0.0";

    return {
      neuralNodes: totalChunks || 2847,
      synapsesActive: totalChunks > 0 ? Math.floor(totalChunks * 4.35) : 12400,
      memoryBanks: totalChunks > 0 ? `${memorySizeGB} GB` : "156 GB",
    };
  }, [jobs]);

  return (
    <div className="min-h-screen flex relative text-white overflow-hidden">
      {/* Neural Network Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 z-0">
        <NeuralBackground />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Left Sidebar */}
      <Sidebar
        activeView={activeView}
        isUploadOpen={open}
        onViewChange={(view) => {
          if (view === "memories" && user?.id) {
            fetchJobs(user.id);
          }
          setActiveView(view);
        }}
        onUploadClick={() => {
          setOpen(true);
        }}
      />

      {/* Main Content */}
      <div className="flex-1 relative z-10 flex flex-col ml-64">
        {/* Header Bar */}
        <header className="relative z-10 border-b border-blue-500/20 bg-black/30 backdrop-blur-sm px-8 py-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-xs uppercase tracking-wider text-blue-300/80">
              NEURAL INTERFACE ACTIVE
            </span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-8 py-8">
          {activeView === "chat" ? (
            <div className="max-w-5xl mx-auto space-y-8">
              {/* Chat Section */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <h2 className="text-3xl font-bold text-white">Mnemonic</h2>
                </div>
                <p className="text-blue-200/70 text-lg ml-5">
                  Your AI Memory Assistant. Ask questions about your past
                  experiences and memories.
                </p>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="relative rounded-xl border border-blue-500/30 bg-black/30 backdrop-blur-sm p-6">
                  <div className="absolute top-3 right-3 w-1 h-1 bg-blue-400 rounded-full"></div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-blue-400"
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
                    <div>
                      <p className="text-sm text-blue-300/70 mb-1">
                        Total Memories
                      </p>
                      <p className="text-2xl font-bold text-blue-400">1,284</p>
                    </div>
                  </div>
                </div>

                <div className="relative rounded-xl border border-blue-500/30 bg-black/30 backdrop-blur-sm p-6">
                  <div className="absolute top-3 right-3 w-1 h-1 bg-blue-400 rounded-full"></div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-purple-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-blue-300/70 mb-1">
                        Recent Uploads
                      </p>
                      <p className="text-2xl font-bold text-purple-400">47</p>
                    </div>
                  </div>
                </div>

                <div className="relative rounded-xl border border-blue-500/30 bg-black/30 backdrop-blur-sm p-6">
                  <div className="absolute top-3 right-3 w-1 h-1 bg-blue-400 rounded-full"></div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-300/70 mb-1">
                        Questions Answered
                      </p>
                      <p className="text-2xl font-bold text-yellow-400">892</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ready to Connect Section */}
              <div className="rounded-xl border border-blue-500/30 bg-black/30 backdrop-blur-sm p-12 text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center border border-blue-500/30">
                    <svg
                      className="w-12 h-12 text-blue-400"
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
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Ready to Connect
                </h3>
                <p className="text-blue-200/70 mb-6 max-w-md mx-auto">
                  Your neural assistant is standing by. Begin a conversation to
                  access your memories.
                </p>
                <a
                  href="/chat"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-950/60 via-blue-900/50 to-purple-950/60 text-white/90 border border-blue-500/20 px-8 py-3 text-sm font-semibold transition-all hover:bg-gradient-to-r hover:from-blue-500 hover:via-blue-600 hover:to-purple-600 hover:text-white hover:border-blue-400/80 hover:shadow-lg hover:shadow-blue-500/50"
                >
                  START CONVERSATION
                </a>
              </div>
            </div>
          ) : activeView === "memories" ? (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Your Memories ({jobs.length})
                </h2>
              </div>
              {jobsError && (
                <div className="rounded-2xl border border-red-500/40 bg-red-500/10 backdrop-blur-sm px-4 py-3 text-sm text-red-200">
                  {jobsError}
                </div>
              )}

              {jobsLoading ? (
                <div className="rounded-xl border border-blue-500/30 bg-black/30 backdrop-blur-sm p-10 text-center text-blue-200/70">
                  Loading your memories...
                </div>
              ) : jobs.length === 0 ? (
                <div className="rounded-xl border border-blue-500/30 bg-black/30 backdrop-blur-sm p-10 text-center text-blue-200/70">
                  <p className="text-sm uppercase tracking-[0.4em] text-blue-300/60">
                    No memories yet
                  </p>
                  <h2 className="mt-4 text-2xl font-semibold text-white">
                    Start building your knowledge base
                  </h2>
                  <p className="mt-2 text-sm text-blue-200/60">
                    Upload audio, documents, images, or text to get started.
                  </p>
                  <button
                    onClick={() => setOpen(true)}
                    className="mt-6 inline-flex items-center gap-2 rounded-lg border border-blue-400/50 bg-blue-500/20 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500/30"
                  >
                    + Upload Memory
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => {
                    const meta = modalityMap[job.modality] ?? {
                      emoji: "📦",
                      label: job.modality,
                    };
                    return (
                      <div
                        key={job.id}
                        className="rounded-xl border border-blue-500/30 bg-black/30 backdrop-blur-sm px-6 py-5 shadow-lg shadow-blue-500/10"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{meta.emoji}</span>
                            <div>
                              <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
                                {meta.label}
                              </p>
                              <h3 className="text-lg font-semibold text-white">
                                {job.source_name ||
                                  job.external_url ||
                                  "Untitled upload"}
                              </h3>
                            </div>
                          </div>
                          <span
                            className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wide ${
                              job.status === "completed"
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                                : job.status === "processing"
                                ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                                : job.status === "failed"
                                ? "border-red-500/40 bg-red-500/10 text-red-300"
                                : "border-blue-400/30 text-blue-200/70"
                            }`}
                          >
                            {job.status === "processing"
                              ? "⏳ Processing..."
                              : job.status}
                          </span>
                        </div>

                        <div className="mt-3 text-sm text-blue-200/70">
                          {job.external_url && (
                            <div>
                              Source:{" "}
                              <a
                                className="text-emerald-300 underline-offset-2 hover:underline"
                                href={job.external_url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {job.external_url}
                              </a>
                            </div>
                          )}
                          {job.storage_path && (
                            <div className="mt-1 text-xs text-zinc-500">
                              Storage path: {job.storage_path}
                            </div>
                          )}
                          <div className="mt-2 text-xs uppercase tracking-wide text-zinc-500">
                            Created{" "}
                            {new Date(job.created_at).toLocaleString(
                              undefined,
                              {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }
                            )}
                          </div>
                          {job.metadata && job.status === "completed" && (
                            <div className="mt-3 space-y-2 text-xs text-zinc-400">
                              {job.metadata.chunksCount && (
                                <div className="flex items-center gap-2">
                                  <span>✅</span>
                                  <span>
                                    Processed: {job.metadata.chunksCount} chunks
                                    stored in Qdrant
                                  </span>
                                </div>
                              )}
                              {job.metadata.sourceDate && (
                                <div className="flex items-center gap-2">
                                  <span>📅</span>
                                  <span>
                                    Source date:{" "}
                                    {new Date(
                                      job.metadata.sourceDate
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                              {job.metadata.keywords &&
                                Array.isArray(job.metadata.keywords) &&
                                job.metadata.keywords.length > 0 && (
                                  <div>
                                    <span className="font-semibold text-zinc-300">
                                      Keywords:
                                    </span>{" "}
                                    {job.metadata.keywords
                                      .slice(0, 5)
                                      .join(", ")}
                                    {job.metadata.keywords.length > 5 && "..."}
                                  </div>
                                )}
                              {job.metadata.actionItems &&
                                Array.isArray(job.metadata.actionItems) &&
                                job.metadata.actionItems.length > 0 && (
                                  <div>
                                    <span className="font-semibold text-zinc-300">
                                      Action Items (
                                      {job.metadata.actionItems.length}):
                                    </span>
                                    <ul className="ml-4 mt-1 list-disc space-y-0.5">
                                      {job.metadata.actionItems
                                        .slice(0, 3)
                                        .map((item: string, idx: number) => (
                                          <li key={idx}>{item}</li>
                                        ))}
                                      {job.metadata.actionItems.length > 3 && (
                                        <li className="text-zinc-500">
                                          ...and{" "}
                                          {job.metadata.actionItems.length - 3}{" "}
                                          more
                                        </li>
                                      )}
                                    </ul>
                                  </div>
                                )}
                              {job.metadata.decisions &&
                                Array.isArray(job.metadata.decisions) &&
                                job.metadata.decisions.length > 0 && (
                                  <div>
                                    <span className="font-semibold text-zinc-300">
                                      Decisions ({job.metadata.decisions.length}
                                      ):
                                    </span>
                                    <ul className="ml-4 mt-1 list-disc space-y-0.5">
                                      {job.metadata.decisions
                                        .slice(0, 3)
                                        .map(
                                          (decision: string, idx: number) => (
                                            <li key={idx}>{decision}</li>
                                          )
                                        )}
                                      {job.metadata.decisions.length > 3 && (
                                        <li className="text-zinc-500">
                                          ...and{" "}
                                          {job.metadata.decisions.length - 3}{" "}
                                          more
                                        </li>
                                      )}
                                    </ul>
                                  </div>
                                )}
                              {job.metadata.meetingTitle && (
                                <div className="flex items-center gap-2">
                                  <span>📋</span>
                                  <span className="font-semibold text-zinc-300">
                                    Meeting:
                                  </span>{" "}
                                  {job.metadata.meetingTitle}
                                </div>
                              )}
                              {job.metadata.speakers &&
                                Array.isArray(job.metadata.speakers) &&
                                job.metadata.speakers.length > 0 && (
                                  <div>
                                    <span className="font-semibold text-zinc-300">
                                      Speakers:
                                    </span>{" "}
                                    {job.metadata.speakers.join(", ")}
                                  </div>
                                )}
                              {job.metadata.summary && (
                                <div className="mt-2 rounded-lg bg-zinc-800/30 p-2 text-zinc-300">
                                  <span className="font-semibold">
                                    Summary:
                                  </span>{" "}
                                  {job.metadata.summary}
                                </div>
                              )}
                            </div>
                          )}
                          {job.error_message && (
                            <div className="mt-2 text-xs text-red-300">
                              Error: {job.error_message}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}
        </main>

        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4 py-6 backdrop-blur-md">
            <div className="w-full max-w-2xl rounded-xl border border-blue-500/30 bg-black/95 backdrop-blur-sm p-8 shadow-2xl shadow-blue-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                    Upload
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-white">
                    {selectedMeta ? selectedMeta.label : "Choose modality"}
                  </h2>
                  <p className="text-sm text-zinc-400">
                    {selectedMeta
                      ? selectedMeta.description
                      : "Select the type of content you’d like to ingest."}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setOpen(false);
                    setSelectedModality(null);
                    setForm({
                      sourceName: "",
                      storagePath: "",
                      notes: "",
                    });
                    setSubmitError(null);
                    setFile(null);
                  }}
                  className="rounded-lg border border-blue-400/50 px-4 py-2 text-sm text-blue-200/70 transition hover:border-blue-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {modalities.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setSelectedModality(item.value)}
                    className={`rounded-xl border p-5 text-left transition ${
                      selectedModality === item.value
                        ? "border-blue-500/60 bg-blue-500/20"
                        : "border-blue-500/30 bg-black/20 hover:border-blue-400/50 hover:bg-blue-500/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.emoji}</span>
                      <div>
                        <p className="text-base font-semibold text-white">
                          {item.label}
                        </p>
                        <p className="text-sm text-blue-200/70">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {selectedModality && (
                <form onSubmit={handleCreateJob} className="mt-8 space-y-4">
                  {submitError && (
                    <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                      {submitError}
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wide text-blue-300/70">
                      Title / Source name
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-blue-500/30 bg-black/30 px-3 py-2 text-sm text-white shadow-inner focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/40"
                      value={form.sourceName}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          sourceName: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {(selectedModality === "audio" ||
                    selectedModality === "document" ||
                    selectedModality === "images" ||
                    selectedModality === "plain text") && (
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-wide text-blue-300/70">
                        File
                      </label>
                      <input
                        type="file"
                        className="w-full text-sm text-blue-200/70 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-500/90 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-blue-400"
                        onChange={(e) => {
                          const f = e.target.files?.[0] ?? null;
                          setFile(f);
                        }}
                      />
                      <p className="mt-1 text-xs text-blue-300/60">
                        File will be stored in Supabase Storage and the
                        reference saved in Postgres.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wide text-blue-300/70">
                      Notes
                    </label>
                    <textarea
                      rows={3}
                      className="w-full rounded-lg border border-blue-500/30 bg-black/30 px-3 py-2 text-sm text-white shadow-inner focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/40"
                      value={form.notes}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, notes: e.target.value }))
                      }
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={creating}
                      className="inline-flex flex-1 items-center justify-center rounded-lg bg-gradient-to-b from-blue-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/50 transition hover:from-blue-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {creating ? "Saving…" : "Save job"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedModality(null);
                        setForm({
                          sourceName: "",
                          storagePath: "",
                          notes: "",
                        });
                        setSubmitError(null);
                        setFile(null);
                      }}
                      className="inline-flex items-center justify-center rounded-lg border border-blue-400/50 px-4 py-3 text-sm font-medium text-blue-200/70 transition hover:border-blue-400 hover:text-white"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
