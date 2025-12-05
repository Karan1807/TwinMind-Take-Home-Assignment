"use client";

import { useEffect, useRef, useState } from "react";
import NeuralBackground from "@/app/components/NeuralBackground";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export default function ChatPage() {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem("currentUser")
        : null;

    if (stored) {
      try {
        const userData = JSON.parse(stored);
        setUser(userData);
      } catch {
        window.localStorage.removeItem("currentUser");
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);

  // Typing effect function
  const typeMessage = (fullText: string, messageId: string) => {
    setIsStreaming(true);
    setStreamingMessageId(messageId);
    setStreamingMessage("");
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setStreamingMessage(fullText.slice(0, currentIndex + 1));
        currentIndex++;
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      } else {
        clearInterval(typingInterval);
        setIsStreaming(false);
        setStreamingMessageId(null);
        // Update the message with complete content
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, content: fullText } : msg
          )
        );
        setStreamingMessage("");
      }
    }, 15); // Adjust speed here (lower = faster, 15ms = ~67 chars/sec)
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Create a placeholder assistant message for streaming
    const assistantMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          query: userMessage.content,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      // Start typing effect
      typeMessage(data.answer, assistantMessageId);
    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: `Error: ${error.message || "Failed to get response"}`,
        timestamp: new Date(),
      };
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== assistantMessageId);
        return [...filtered, errorMessage];
      });
      setIsStreaming(false);
      setStreamingMessageId(null);
      setStreamingMessage("");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center relative px-6 text-center text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 z-0">
          <NeuralBackground />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 max-w-md rounded-3xl border border-blue-500/30 bg-black/30 backdrop-blur-sm p-10 text-sm text-blue-200/70">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-300/60">
            Access denied
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            Please log in
          </h1>
          <p className="mt-2 text-sm text-blue-200/60">
            You need to be logged in to use the chat.
          </p>
          <a
            href="/login"
            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/50 transition hover:shadow-blue-500/70"
          >
            Return to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col relative text-white overflow-hidden">
      {/* Neural Network Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 z-0">
        <NeuralBackground />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-blue-500/20 bg-black/30 backdrop-blur-sm px-8 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-300/80">
                Mnemonic
              </p>
            </div>
            <h1 className="text-2xl font-semibold text-white">
              Your AI Memory Assistant
            </h1>
          </div>
          <a
            href="/dashboard"
            className="rounded-xl border border-blue-500/30 bg-black/30 backdrop-blur-sm px-4 py-2 text-sm text-blue-200/70 transition hover:border-blue-400/50 hover:text-white hover:bg-blue-500/10"
          >
            ← Dashboard
          </a>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-8 relative z-10">
        <div className="mx-auto max-w-5xl space-y-6">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <div className="max-w-md">
                <p className="text-sm uppercase tracking-[0.4em] text-blue-300/60">
                  Start a conversation
                </p>
                <h2 className="mt-4 text-2xl font-semibold text-white">
                  Ask questions about your uploaded content
                </h2>
                <p className="mt-2 text-sm text-blue-200/70">
                  Your queries will search through all your audio
                  transcriptions, documents, web content, and other uploaded
                  content using hybrid search.
                </p>
                <div className="mt-4 space-y-2 text-left text-xs text-blue-200/60 rounded-xl border border-blue-500/30 bg-black/30 backdrop-blur-sm p-4">
                  <p className="text-blue-300/80">
                    💡 <strong>Try temporal queries:</strong>
                  </p>
                  <ul className="ml-4 list-disc space-y-1 mt-2">
                    <li>"What did I work on last month?"</li>
                    <li>"Summarize meetings from last week"</li>
                    <li>"What was discussed in December?"</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => {
                // Check if this is the currently streaming message
                const isCurrentlyStreaming =
                  isStreaming && message.id === streamingMessageId;

                return (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        🤖
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-xl px-5 py-3 backdrop-blur-sm ${
                        message.role === "user"
                          ? "bg-blue-500/20 text-white border border-blue-500/30"
                          : "bg-black/30 text-blue-100 border border-blue-500/20"
                      }`}
                    >
                      {isCurrentlyStreaming ? (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {streamingMessage}
                          <span className="inline-block w-2 h-4 bg-blue-400 ml-1 animate-pulse" />
                        </p>
                      ) : (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </p>
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        👤
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="relative z-10 border-t border-blue-500/20 bg-black/30 backdrop-blur-sm px-8 py-4">
        <form onSubmit={handleSubmit} className="mx-auto max-w-5xl">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your uploaded content..."
              className="flex-1 rounded-xl border border-blue-500/30 bg-black/30 backdrop-blur-sm px-4 py-3 text-sm text-white placeholder:text-blue-300/50 focus:border-blue-400/50 focus:outline-none focus:ring-1 focus:ring-blue-400/30"
              disabled={loading || isStreaming}
            />
            <button
              type="submit"
              disabled={loading || isStreaming || !input.trim()}
              className="rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/50 transition hover:shadow-blue-500/70 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
