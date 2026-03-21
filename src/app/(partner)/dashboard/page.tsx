import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { SalesChart } from "@/components/partner/SalesChart";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Clock,
  TrendingUp,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { formatCurrency, formatDateTime, statusColors, statusLabels } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

async function getPartnerStats(partnerId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalRevenue, ordersThisMonth, productsCount, pendingOrders, recentOrders] =
    await Promise.all([
      prisma.order.aggregate({
        where: {
          partnerId,
          status: { in: ["PAID", "PROCESSING", "DELIVERED"] },
        },
        _sum: { partnerAmount: true },
      }),
      prisma.order.count({
        where: {
          partnerId,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.product.count({ where: { partnerId, active: true } }),
      prisma.order.count({ where: { partnerId, status: "PENDING" } }),
      prisma.order.findMany({
        where: { partnerId },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: true } } },
      }),
    ]);

  return {
    totalRevenue: totalRevenue._sum.partnerAmount || 0,
    ordersThisMonth,
    productsCount,
    pendingOrders,
    recentOrders,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as any;
  if (user.role !== "PARTNER") redirect("/admin");

  const partner = await prisma.partner.findUnique({
    where: { id: user.partnerId },
  });

  if (!partner) redirect("/login");

  const stats = await getPartnerStats(user.partnerId);

  const statCards = [
    {
      label: "Receita Total",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
      trend: "+12%",
    },
    {
      label: "Pedidos este mês",
      value: stats.ordersThisMonth,
      icon: ShoppingBag,
      color: "text-[#3B3BFF]",
      bg: "bg-[#3B3BFF]/10",
      trend: "+8%",
    },
    {
      label: "Produtos Ativos",
      value: stats.productsCount,
      icon: Package,
      color: "text-[#E85A00]",
      bg: "bg-[#E85A00]/10",
      trend: null,
    },
    {
      label: "Pedidos Pendentes",
      value: stats.pendingOrders,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      trend: null,
    },
  ];

  const statusBadgeVariant: Record<string, any> = {
    PENDING: "pending",
    PAID: "default",
    PROCESSING: "secondary",
    DELIVERED: "approved",
    CANCELLED: "rejected",
  };

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar role="PARTNER" />

      <div className="flex-1 lg:ml-64">
        <Header title="Dashboard" />

        <main className="p-6 pb-24 lg:pb-6 space-y-6">
          {/* Welcome banner */}
          <div className="relative rounded-2xl bg-[#3B3BFF] p-6 overflow-hidden">
            <div className="absolute right-0 top-0 w-40 h-full bg-white/10 rounded-l-full" />
            <div className="absolute bottom-0 right-12 w-24 h-24 bg-[#E85A00]/30 rounded-full blur-xl" />
            <div className="relative">
              <h2 className="font-display text-2xl font-700 text-white uppercase mb-1">
                Olá, {partner.name}!
              </h2>
              <p className="text-white/70 text-sm mb-4">
                Seu painel está atualizado. Continue gerenciando seus produtos e pedidos.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link
                  href="/dashboard/products"
                  className="flex items-center gap-2 bg-white text-[#3B3BFF] font-semibold text-sm px-4 py-2 rounded-lg transition-colors hover:bg-white/90"
                >
                  <Package className="h-4 w-4" />
                  Gerenciar Produtos
                </Link>
                <Link
                  href={`/store/${partner.slug}`}
                  target="_blank"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-lg transition-colors border border-white/20"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver Loja
                </Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white border border-[#E8E8E8] rounded-xl p-4 card-hover"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    {stat.trend && (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <TrendingUp className="h-3 w-3" />
                        {stat.trend}
                      </span>
                    )}
                  </div>
                  <p className="font-display text-3xl font-700 text-[#1A1A1A]">{stat.value}</p>
                  <p className="text-xs text-[#666666] mt-0.5">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Chart & Recent Orders */}
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Chart */}
            <div className="lg:col-span-3 bg-white border border-[#E8E8E8] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-xl font-700 text-[#1A1A1A] uppercase">Vendas por Mês</h3>
                  <p className="text-xs text-[#666666]">Últimos 7 meses</p>
                </div>
                <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-lg">
                  +24% este mês
                </span>
              </div>
              <SalesChart />
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-[#E8E8E8] rounded-xl p-6">
                <h3 className="font-display text-xl font-700 text-[#1A1A1A] uppercase mb-4">Ações Rápidas</h3>
                <div className="space-y-2">
                  {[
                    { href: "/dashboard/products", label: "Adicionar Produto", icon: Package },
                    { href: "/dashboard/orders", label: "Ver Pedidos", icon: ShoppingBag },
                    { href: "/dashboard/profile", label: "Editar Perfil", icon: TrendingUp },
                  ].map((action) => {
                    const Icon = action.icon;
                    return (
                      <Link
                        key={action.href}
                        href={action.href}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#F5F5F5] hover:bg-[#3B3BFF]/10 hover:text-[#3B3BFF] transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-[#666666] group-hover:text-[#3B3BFF]" />
                          <span className="text-sm text-[#1A1A1A]">{action.label}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[#666666] group-hover:text-[#3B3BFF]" />
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white border border-[#E8E8E8] rounded-xl p-4">
                <p className="text-xs text-[#666666] mb-1">Link da Loja</p>
                <p className="text-sm text-[#3B3BFF] font-mono break-all">
                  podspace.club/store/{partner.slug}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white border border-[#E8E8E8] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-700 text-[#1A1A1A] uppercase">Pedidos Recentes</h3>
              <Link
                href="/dashboard/orders"
                className="text-xs text-[#3B3BFF] hover:text-[#2525DD] flex items-center gap-1 transition-colors"
              >
                Ver todos <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {stats.recentOrders.length === 0 ? (
              <div className="text-center py-8 text-[#666666]">
                <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Nenhum pedido ainda</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Produtos</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-xs text-[#666666]">{order.customerEmail}</p>
                        </td>
                        <td className="text-sm text-[#666666]">
                          {order.items.length} item(s)
                        </td>
                        <td className="font-semibold text-[#1A1A1A]">
                          {formatCurrency(order.total)}
                        </td>
                        <td>
                          <Badge variant={statusBadgeVariant[order.status]}>
                            {statusLabels[order.status]}
                          </Badge>
                        </td>
                        <td className="text-xs text-[#666666]">
                          {formatDateTime(order.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      <MobileNav role="PARTNER" />
    </div>
  );
}
