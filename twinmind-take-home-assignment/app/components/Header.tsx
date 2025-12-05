"use client";

import { MessageCircle, Database, Upload } from "lucide-react";

type TabType = "chat" | "memories" | "upload";

interface HeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-64 right-0 border-b border-blue-500/20 bg-black/30 backdrop-blur-sm px-8 py-4 z-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-xs uppercase tracking-wider text-blue-300/80">
            NEURAL INTERFACE ACTIVE
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onTabChange("chat")}
            className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all relative overflow-hidden ${
              activeTab === "chat"
                ? "bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 border border-blue-400/80"
                : "bg-gradient-to-r from-blue-950/60 via-blue-900/50 to-purple-950/60 text-white/90 border border-blue-500/20 hover:border-blue-400/40"
            }`}
          >
            <MessageCircle
              className={`w-4 h-4 ${
                activeTab === "chat" ? "text-white" : "text-blue-300/70"
              }`}
            />
            CHAT
          </button>
          <button
            onClick={() => onTabChange("memories")}
            className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all relative overflow-hidden ${
              activeTab === "memories"
                ? "bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 border border-blue-400/80"
                : "bg-gradient-to-r from-blue-950/60 via-blue-900/50 to-purple-950/60 text-white/90 border border-blue-500/20 hover:border-blue-400/40"
            }`}
          >
            <Database
              className={`w-4 h-4 ${
                activeTab === "memories" ? "text-white" : "text-blue-300/70"
              }`}
            />
            MEMORIES
          </button>
          <button
            onClick={() => onTabChange("upload")}
            className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all relative overflow-hidden ${
              activeTab === "upload"
                ? "bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 border border-blue-400/80"
                : "bg-gradient-to-r from-blue-950/60 via-blue-900/50 to-purple-950/60 text-white/90 border border-blue-500/20 hover:border-blue-400/40"
            }`}
          >
            <Upload
              className={`w-4 h-4 ${
                activeTab === "upload" ? "text-white" : "text-blue-300/70"
              }`}
            />
            UPLOAD MEMORIES
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
