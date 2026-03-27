"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  User,
  Users,
  BarChart3,
  LogOut,
  Settings,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role?: "PARTNER" | "ADMIN";
}

const partnerLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/products",
    label: "Produtos",
    icon: Package,
  },
  {
    href: "/dashboard/orders",
    label: "Pedidos",
    icon: ShoppingBag,
  },
  {
    href: "/dashboard/profile",
    label: "Meu Perfil",
    icon: User,
  },
];

const adminLinks = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/partners",
    label: "Parceiros",
    icon: Users,
  },
  {
    href: "/admin/sales",
    label: "Vendas",
    icon: TrendingUp,
  },
];

export function Sidebar({ role = "PARTNER" }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const links = role === "ADMIN" ? adminLinks : partnerLinks;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-[#E8E8E8] flex flex-col z-30">
      {/* Logo */}
      <div className="p-6 border-b border-[#E8E8E8]">
        <Link href={role === "ADMIN" ? "/admin" : "/dashboard"} className="flex items-center gap-3">
          <Image src="/isotipo-preto.svg" alt="" width={32} height={40} className="flex-shrink-0" unoptimized />
          <Image src="/logo-principal-preto.svg" alt="PodSpace" width={210} height={28} className="h-7 w-auto" unoptimized />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            link.href === "/dashboard" || link.href === "/admin"
              ? pathname === link.href
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-[#3B3BFF]/10 text-[#3B3BFF] border-l-[3px] border-[#3B3BFF] pl-[9px]"
                  : "text-[#666666] hover:text-[#3B3BFF] hover:bg-[#3B3BFF]/05"
              )}
            >
              <Icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-[#3B3BFF]" : "text-[#666666]")} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* User info & logout */}
      <div className="p-4 border-t border-[#E8E8E8] space-y-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-[#3B3BFF] flex items-center justify-center text-xs font-bold text-white">
            {session?.user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#1A1A1A] truncate">
              {session?.user?.email}
            </p>
            <p className="text-xs text-[#666666]">{role}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#666666] hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
