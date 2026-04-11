"use client";

import { Menu } from "lucide-react";

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export function Header({ title = "Dashboard", onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-lg border-b border-[#E8E8E8] px-6 py-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-[#F5F5F5] transition-colors"
        >
          <Menu className="h-5 w-5 text-[#666666]" />
        </button>
        <h1 className="font-display text-xl sm:text-2xl font-700 text-[#1A1A1A] uppercase tracking-wide truncate max-w-[160px] sm:max-w-xs md:max-w-none">{title}</h1>
      </div>
    </header>
  );
}
