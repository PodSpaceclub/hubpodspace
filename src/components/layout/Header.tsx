"use client";

import { Bell, Search, Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export function Header({ title = "Dashboard", onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const [hasNotifications] = useState(true);

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-lg border-b border-[#E8E8E8] px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-[#F5F5F5] transition-colors"
          >
            <Menu className="h-5 w-5 text-[#666666]" />
          </button>
          <h1 className="font-display text-2xl font-700 text-[#1A1A1A] uppercase tracking-wide">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-[#F5F5F5] rounded-lg px-3 py-2 text-sm text-[#666666] border border-[#E8E8E8] w-48">
            <Search className="h-4 w-4" />
            <span>Buscar...</span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-[#F5F5F5] transition-colors">
            <Bell className="h-5 w-5 text-[#666666]" />
            {hasNotifications && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#3B3BFF]" />
            )}
          </button>

          {/* User Avatar */}
          <div className="w-8 h-8 rounded-full bg-[#3B3BFF] flex items-center justify-center text-sm font-bold text-white">
            {session?.user?.email?.[0]?.toUpperCase() || "U"}
          </div>
        </div>
      </div>
    </header>
  );
}
