export const dynamic = 'force-dynamic'

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime, statusLabels } from "@/lib/utils";
import { DollarSign, Percent, ShoppingBag, TrendingUp } from "lucide-react";

async function getSalesData() {
  const orders = await prisma.order.findMany({
    include: {
      partner: { select: { name: true } },
      items: { include: { product: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalSales = orders
    .filter((o) => ["PAID", "PROCESSING", "DELIVERED"].includes(o.status))
    .reduce((sum, o) => sum + o.total, 0);
  const totalCommission = orders
    .filter((o) => ["PAID", "PROCESSING", "DELIVERED"].includes(o.status))
    .reduce((sum, o) => sum + o.commission, 0);

  return { orders, totalSales, totalCommission };
}

const statusVariant: Record<string, any> = {
  PENDING: "pending",
  PAID: "default",
  PROCESSING: "secondary",
  DELIVERED: "approved",
  CANCELLED: "rejected",
};

export default async function AdminSalesPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") redirect("/login");

  const { orders, totalSales, totalCommission } = await getSalesData();

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar role="ADMIN" />
      <div className="flex-1 lg:ml-64">
        <Header title="Vendas" />

        <main className="p-6 pb-24 lg:pb-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total em Vendas",
                value: formatCurrency(totalSales),
                icon: DollarSign,
                color: "text-green-600",
                bg: "bg-green-50",
              },
              {
                label: "Comissão Total",
                value: formatCurrency(totalCommission),
                icon: Percent,
                color: "text-[#E85A00]",
                bg: "bg-[#E85A00]/10",
              },
              {
                label: "Total de Pedidos",
                value: orders.length,
                icon: ShoppingBag,
                color: "text-[#3B3BFF]",
                bg: "bg-[#3B3BFF]/10",
              },
              {
                label: "Taxa de Comissão",
                value: "10%",
                icon: TrendingUp,
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white border border-[#E8E8E8] rounded-xl p-4"
                >
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <p className="font-display text-3xl font-700 text-[#1A1A1A]">{stat.value}</p>
                  <p className="text-xs text-[#666666] mt-0.5">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Table */}
          <div className="bg-white border border-[#E8E8E8] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#E8E8E8]">
              <h3 className="font-display text-xl font-700 text-[#1A1A1A] uppercase">Todas as Vendas</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Parceiro</th>
                    <th>Itens</th>
                    <th>Total</th>
                    <th>Comissão</th>
                    <th>Repasse</th>
                    <th>Status</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center text-[#666666] py-8">
                        Nenhuma venda ainda
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id}>
                        <td className="font-mono text-xs text-[#666666]">
                          #{order.id.slice(-8).toUpperCase()}
                        </td>
                        <td>
                          <p className="font-medium text-sm">{order.customerName}</p>
                          <p className="text-xs text-[#666666]">{order.customerEmail}</p>
                        </td>
                        <td className="text-sm">{order.partner.name}</td>
                        <td className="text-sm text-center">{order.items.length}</td>
                        <td className="font-semibold text-[#1A1A1A]">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="text-[#E85A00] font-medium">
                          {formatCurrency(order.commission)}
                        </td>
                        <td className="text-green-600 font-medium">
                          {formatCurrency(order.partnerAmount)}
                        </td>
                        <td>
                          <Badge variant={statusVariant[order.status]}>
                            {statusLabels[order.status]}
                          </Badge>
                        </td>
                        <td className="text-xs text-[#666666]">
                          {formatDateTime(order.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      <MobileNav role="ADMIN" />
    </div>
  );
}
