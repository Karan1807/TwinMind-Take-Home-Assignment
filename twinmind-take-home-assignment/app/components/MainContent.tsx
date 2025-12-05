"use client";

import { Brain, Zap, Database, Sparkles } from "lucide-react";

type TabType = "chat" | "memories" | "upload";

interface MainContentProps {
  activeTab: TabType;
}

const MainContent = ({ activeTab }: MainContentProps) => {
  return (
    <main className="ml-64 pt-20 min-h-screen relative">
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>
      <div className="relative z-10 p-8">
        {/* Welcome Section */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
            <h2 className="text-3xl font-bold tracking-wider">
              {activeTab === "chat" && "Mnemonic"}
              {activeTab === "memories" && "Memory Database"}
              {activeTab === "upload" && "Memory Upload Portal"}
            </h2>
          </div>
          <p className="text-blue-200/70 max-w-2xl">
            {activeTab === "chat" &&
              "Connect with your AI memory assistant. Ask questions about your past experiences and memories."}
            {activeTab === "memories" &&
              "Browse and explore your stored memories. Your neural network contains all your experiences."}
            {activeTab === "upload" &&
              "Upload new memories to expand your neural network. Add text or documents."}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: Database,
              label: "Total Memories",
              value: "1,284",
              color: "primary",
            },
            {
              icon: Zap,
              label: "Recent Uploads",
              value: "47",
              color: "secondary",
            },
            {
              icon: Brain,
              label: "Questions Answered",
              value: "892",
              color: "accent",
            },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="relative rounded-xl border border-blue-500/30 bg-black/30 backdrop-blur-sm p-6 animate-scale-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="absolute top-3 right-3 w-1 h-1 bg-blue-400 rounded-full"></div>
              <div className="flex items-center gap-4">
                <div
                  className={`
                  w-12 h-12 rounded-lg flex items-center justify-center
                  ${
                    stat.color === "primary"
                      ? "bg-blue-500/20 text-blue-400"
                      : ""
                  }
                  ${
                    stat.color === "secondary"
                      ? "bg-purple-500/20 text-purple-400"
                      : ""
                  }
                  ${
                    stat.color === "accent"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : ""
                  }
                `}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-blue-300/70 mb-1">{stat.label}</p>
                  <p
                    className={`text-2xl font-bold ${
                      stat.color === "accent"
                        ? "text-yellow-400"
                        : stat.color === "secondary"
                        ? "text-purple-400"
                        : "text-blue-400"
                    }`}
                  >
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="glass-card min-h-[400px] p-8 relative overflow-hidden">
          {/* Decorative corner elements */}
          <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-blue-500/30 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 border-blue-500/30 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-20 h-20 border-l-2 border-b-2 border-blue-500/30 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-blue-500/30 rounded-br-xl" />

          {/* Pulsing dots in corners */}
          <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <div
            className="absolute top-4 right-4 w-2 h-2 rounded-full bg-purple-500 animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />
          <div
            className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-purple-500 animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-blue-500 animate-pulse"
            style={{ animationDelay: "1.5s" }}
          />

          <div className="flex flex-col items-center justify-center h-[350px] text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-600/30 flex items-center justify-center animate-pulse-glow">
                <Brain className="w-12 h-12 text-blue-400" />
              </div>
              <div
                className="absolute -inset-4 rounded-full border border-blue-500/20 animate-ping"
                style={{ animationDuration: "3s" }}
              />
            </div>

            <h3 className="text-xl mb-4 text-glow">
              {activeTab === "chat" && "Ready to Connect"}
              {activeTab === "memories" && "Memory Archive"}
              {activeTab === "upload" && "Upload Portal Ready"}
            </h3>

            <p className="text-blue-200/70 max-w-md mb-8">
              {activeTab === "chat" &&
                "Your neural assistant is standing by. Begin a conversation to access your memories."}
              {activeTab === "memories" &&
                "Your memories are organized and indexed. Search or browse your memory banks."}
              {activeTab === "upload" &&
                "Drag and drop files here or click to upload new memories to your neural network."}
            </p>
            <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-950/60 via-blue-900/50 to-purple-950/60 text-white/90 border border-blue-500/20 px-8 py-3 text-sm font-semibold transition-all hover:bg-gradient-to-r hover:from-blue-500 hover:via-blue-600 hover:to-purple-600 hover:text-white hover:border-blue-400/80 hover:shadow-lg hover:shadow-blue-500/50">
              {activeTab === "chat" && "Start Conversation"}
              {activeTab === "memories" && "Browse Memories"}
              {activeTab === "upload" && "Select Files"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MainContent;
