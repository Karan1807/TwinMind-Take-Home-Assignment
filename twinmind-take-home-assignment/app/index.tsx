"use client";

import { useState } from "react";
import NeuralBackground from "@/app/components/NeuralBackground";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import MainContent from "@/app/components/MainContent";

type TabType = "chat" | "memories" | "upload";

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>("chat");

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated neural network background */}
      <NeuralBackground />

      {/* Gradient overlay for depth */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none z-[1]" />

      {/* Main layout */}
      <div className="relative z-10">
        <Sidebar />
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
        <MainContent activeTab={activeTab} />
      </div>
    </div>
  );
};

export default Index;
