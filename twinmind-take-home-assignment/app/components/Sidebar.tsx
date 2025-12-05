"use client";

import { MessageCircle, Database, Upload, ChevronLeft } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  activeView?: "chat" | "memories" | "upload" | null;
  onViewChange?: (view: "chat" | "memories" | "upload") => void;
  onUploadClick?: () => void;
  isUploadOpen?: boolean;
}

const Sidebar = ({
  activeView = "chat",
  onViewChange,
  onUploadClick,
  isUploadOpen = false,
}: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const handleNavClick = (view: "chat" | "memories" | "upload") => {
    if (view === "upload" && onUploadClick) {
      onUploadClick();
    } else if (onViewChange) {
      onViewChange(view);
    }
  };

  const effectiveActiveView = isUploadOpen ? "upload" : activeView;

  if (collapsed) {
    return (
      <aside className="fixed left-0 top-0 h-screen w-16 border-r border-blue-500/20 bg-black/30 backdrop-blur-sm p-4 z-20 flex flex-col items-center">
        <button
          onClick={() => setCollapsed(false)}
          className="mt-auto mb-4 p-2 rounded-lg border border-blue-500/30 bg-black/30 backdrop-blur-sm text-white hover:bg-blue-500/10 transition"
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-blue-500/20 bg-black/30 backdrop-blur-sm p-6 z-20 flex flex-col">
      <div className="mb-8">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-2">
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
        {/* Divider with handle */}
        <div className="relative mt-4 mb-2">
          <div className="h-px bg-blue-500/30"></div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500/50"></div>
        </div>
      </div>

      <div className="flex-1">
        <p className="text-xs uppercase tracking-wider text-blue-300/60 mb-3">
          NAVIGATION
        </p>
        <div className="space-y-2">
          <button
            onClick={() => handleNavClick("chat")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative bg-transparent text-white ${
              effectiveActiveView === "chat"
                ? "bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 shadow-lg shadow-blue-500/30"
                : "hover:bg-gradient-to-r hover:from-blue-500/80 hover:via-blue-600/80 hover:to-purple-600/80"
            }`}
          >
            <MessageCircle
              className="w-5 h-5 text-white"
              strokeWidth={2}
              fill="none"
            />
            <span className="font-semibold text-white flex-1 text-left">
              Chat
            </span>
            {effectiveActiveView === "chat" && (
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            )}
          </button>

          <button
            onClick={() => handleNavClick("memories")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative bg-transparent text-white ${
              effectiveActiveView === "memories"
                ? "bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 shadow-lg shadow-blue-500/30"
                : "hover:bg-gradient-to-r hover:from-blue-500/80 hover:via-blue-600/80 hover:to-purple-600/80"
            }`}
          >
            <Database
              className="w-5 h-5 text-white"
              strokeWidth={2}
              fill="none"
            />
            <span className="font-semibold text-white flex-1 text-left">
              Memories
            </span>
            {effectiveActiveView === "memories" && (
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            )}
          </button>

          <button
            onClick={() => handleNavClick("upload")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative bg-transparent text-white ${
              effectiveActiveView === "upload"
                ? "bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 shadow-lg shadow-blue-500/30"
                : "hover:bg-gradient-to-r hover:from-blue-500/80 hover:via-blue-600/80 hover:to-purple-600/80"
            }`}
          >
            <Upload
              className="w-5 h-5 text-white"
              strokeWidth={2}
              fill="none"
            />
            <span className="font-semibold text-white flex-1 text-left">
              Upload
            </span>
            {effectiveActiveView === "upload" && (
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            )}
          </button>
        </div>
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(true)}
        className="mt-auto flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-500/30 bg-black/30 backdrop-blur-sm text-white hover:bg-blue-500/10 transition"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Collapse</span>
      </button>
    </aside>
  );
};

export default Sidebar;
