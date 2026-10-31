"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFB] w-full max-w-full overflow-x-hidden">
      {/* Dark modern Sidebar */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-[260px] flex flex-col min-h-screen w-full max-w-full overflow-x-hidden transition-all">
        {/* Sticky Topbar */}
        <Topbar onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        {/* Content Container - padding adapté mobile (px-3 py-4) et desktop (px-8 py-8) */}
        <main className="flex-1 px-3.5 py-4 sm:p-6 md:p-8 space-y-5 md:space-y-8 max-w-7xl mx-auto w-full box-border overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
