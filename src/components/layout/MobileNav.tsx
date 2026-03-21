"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, User, Users, TrendingUp, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  role?: "PARTNER" | "ADMIN";
}

const partnerLinks = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Produtos", icon: Package },
  { href: "/dashboard/orders", label: "Pedidos", icon: ShoppingBag },
  { href: "/dashboard/profile", label: "Perfil", icon: User },
];

const adminLinks = [
  { href: "/admin", label: "Home", icon: LayoutDashboard },
  { href: "/admin/partners", label: "Parceiros", icon: Users },
  { href: "/admin/sales", label: "Vendas", icon: TrendingUp },
  { href: "/admin/qrcodes", label: "QR Codes", icon: QrCode },
];

export function MobileNav({ role = "PARTNER" }: MobileNavProps) {
  const pathname = usePathname();
  const links = role === "ADMIN" ? adminLinks : partnerLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white/95 backdrop-blur-lg border-t border-[#E8E8E8]">
      <div className="flex">
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
                "flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                isActive ? "text-[#3B3BFF]" : "text-[#666666]"
              )}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
