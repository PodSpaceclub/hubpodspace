import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { SalesOverview } from "@/components/admin/SalesOverview";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  DollarSign,
  Percent,
  Clock,
  TrendingUp,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";
import { formatCurrency, formatDateTime, statusLabels } from "@/lib/utils";
import Link from "next/link";

async function getAdminStats() {
  const [
    totalPartners,
    pendingApprovals,
    salesAgg,
    commissionAgg,
    recentOrders,
    recentPartners,
    totalOrders,
  ] = await Promise.all([
    prisma.partner.count({ where: { status: "APPROVED" } }),
    prisma.partner.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "PROCESSING", "DELIVERED"] } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "PROCESSING", "DELIVERED"] } },
      _sum: { commission: true },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { partner: { select: { name: true } } },
    }),
    prisma.partner.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true } } },
    }),
    prisma.order.count(),
  ]);

  return {
    totalPartners,
    pendingApprovals,
    totalSales: salesAgg._sum.total || 0,
    commissionEarned: commissionAgg._sum.commission || 0,
    recentOrders,
    recentPartners,
    totalOrders,
  };
}

const statusVariant: Record<string, any> = {
  PENDING: "pending",
  PAID: "default",
  PROCESSING: "secondary",
  DELIVERED: "approved",
  CANCELLED: "rejected",
};

const partnerStatusVariant: Record<string, any> = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if ((session.user as any).role !== "ADMIN") redirect("/dashboard");

  const stats = await getAdminStats();

  const statCards = [
    {
      label: "Parceiros Ativos",
      value: stats.totalPartners,
      icon: Users,
      color: "text-[#3B3BFF]",
      bg: "bg-[#3B3BFF]/10",
      href: "/admin/partners",
    },
    {
      label: "Total em Vendas",
      value: formatCurrency(stats.totalSales),
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
      href: "/admin/sales",
    },
    {
      label: "Comissão Gerada",
      value: formatCurrency(stats.commissionEarned),
      icon: Percent,
      color: "text-[#E85A00]",
      bg: "bg-[#E85A00]/10",
      href: "/admin/sales",
    },
    {
      label: "Aguardando Aprovação",
      value: stats.pendingApprovals,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      href: "/admin/partners",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar role="ADMIN" />
      <div className="flex-1 lg:ml-64">
        <Header title="Admin Dashboard" />

        <main className="p-6 pb-24 lg:pb-6 space-y-6">
          {/* Welcome */}
          <div className="relative rounded-2xl bg-[#3B3BFF] p-6 overflow-hidden">
            <div className="absolute right-0 top-0 w-40 h-full bg-white/10 rounded-l-full" />
            <div className="absolute bottom-0 right-12 w-24 h-24 bg-[#E85A00]/30 rounded-full blur-xl" />
            <div className="relative">
              <h2 className="font-display text-2xl font-700 text-white uppercase mb-1">
                Painel Administrativo
              </h2>
              <p className="text-white/70 text-sm">
                Gerencie parceiros, vendas e rastreamento do PodSpace Club.
              </p>
              {stats.pendingApprovals > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm px-3 py-1.5 rounded-lg">
                  <Clock className="h-4 w-4" />
                  {stats.pendingApprovals} parceiro(s) aguardando aprovação
                  <Link href="/admin/partners" className="underline text-xs text-white/80">
                    Ver agora
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link key={stat.label} href={stat.href}>
                  <div className="bg-white border border-[#E8E8E8] rounded-xl p-4 card-hover cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <ChevronRight className="h-4 w-4 text-[#CCCCCC]" />
                    </div>
                    <p className="font-display text-3xl font-700 text-[#1A1A1A]">{stat.value}</p>
                    <p className="text-xs text-[#666666] mt-0.5">{stat.label}</p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Chart */}
          <div className="bg-white border border-[#E8E8E8] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-xl font-700 text-[#1A1A1A] uppercase">Vendas & Comissões</h3>
                <p className="text-xs text-[#666666]">Visão geral dos últimos 6 meses</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-lg">
                <TrendingUp className="h-3 w-3" />
                +27% este mês
              </div>
            </div>
            <SalesOverview />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white border border-[#E8E8E8] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl font-700 text-[#1A1A1A] uppercase">Pedidos Recentes</h3>
                <Link href="/admin/sales" className="text-xs text-[#3B3BFF] hover:text-[#2525DD] flex items-center gap-1 transition-colors">
                  Ver todos <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              {stats.recentOrders.length === 0 ? (
                <div className="text-center py-6 text-[#666666]">
                  <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Nenhum pedido ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-[#F5F5F5] rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A]">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-[#666666]">
                          {order.partner.name} • {formatDateTime(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#1A1A1A]">
                          {formatCurrency(order.total)}
                        </p>
                        <Badge variant={statusVariant[order.status]} className="mt-0.5">
                          {statusLabels[order.status]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Partners */}
            <div className="bg-white border border-[#E8E8E8] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl font-700 text-[#1A1A1A] uppercase">Parceiros Recentes</h3>
                <Link href="/admin/partners" className="text-xs text-[#3B3BFF] hover:text-[#2525DD] flex items-center gap-1 transition-colors">
                  Ver todos <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {stats.recentPartners.map((partner) => (
                  <div key={partner.id} className="flex items-center gap-3 p-3 bg-[#F5F5F5] rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-[#3B3BFF] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {partner.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A] truncate">
                        {partner.name}
                      </p>
                      <p className="text-xs text-[#666666] truncate">
                        {partner.user?.email}
                      </p>
                    </div>
                    <Badge variant={partnerStatusVariant[partner.status]}>
                      {partner.status === "PENDING" ? "Pendente" : partner.status === "APPROVED" ? "Aprovado" : "Rejeitado"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
      <MobileNav role="ADMIN" />
    </div>
  );
}
