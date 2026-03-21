"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime, statusLabels } from "@/lib/utils";
import { ShoppingBag, ChevronDown } from "lucide-react";
import { toast } from "@/components/ui/toaster";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { name: string };
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  total: number;
  partnerAmount: number;
  status: string;
  createdAt: string;
}

const statusVariant: Record<string, any> = {
  PENDING: "pending",
  PAID: "default",
  PROCESSING: "secondary",
  DELIVERED: "approved",
  CANCELLED: "rejected",
};

const nextStatus: Record<string, string> = {
  PENDING: "PROCESSING",
  PAID: "PROCESSING",
  PROCESSING: "DELIVERED",
};

const nextStatusLabel: Record<string, string> = {
  PENDING: "Iniciar Preparo",
  PAID: "Iniciar Preparo",
  PROCESSING: "Marcar Entregue",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(
    (o) => statusFilter === "ALL" || o.status === statusFilter
  );

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status } : o))
        );
        toast({ title: "Status atualizado!", variant: "success" });
      }
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar role="PARTNER" />
      <div className="flex-1 lg:ml-64">
        <Header title="Pedidos" />
        <main className="p-6 pb-24 lg:pb-6 space-y-6">
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {["ALL", "PENDING", "PAID", "PROCESSING", "DELIVERED", "CANCELLED"].map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    statusFilter === s
                      ? "bg-[#3B3BFF] text-white"
                      : "bg-white border border-[#E8E8E8] text-[#666666] hover:border-[#3B3BFF]/50 hover:text-[#3B3BFF]"
                  }`}
                >
                  {s === "ALL"
                    ? `Todos (${orders.length})`
                    : `${statusLabels[s]} (${orders.filter((o) => o.status === s).length})`}
                </button>
              )
            )}
          </div>

          {/* Orders */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white border border-[#E8E8E8] rounded-xl h-24 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-[#CCCCCC]" />
              <p className="text-[#666666]">Nenhum pedido encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-[#E8E8E8] rounded-xl overflow-hidden"
                >
                  <div
                    className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer hover:bg-[#F5F5F5] transition-colors"
                    onClick={() =>
                      setExpandedId(expandedId === order.id ? null : order.id)
                    }
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-mono text-[#666666]">
                          #{order.id.slice(-8).toUpperCase()}
                        </span>
                        <Badge variant={statusVariant[order.status]}>
                          {statusLabels[order.status]}
                        </Badge>
                      </div>
                      <p className="font-semibold text-[#1A1A1A] text-sm">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-[#666666]">
                        {order.customerEmail}
                        {order.customerPhone && ` • ${order.customerPhone}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-[#1A1A1A]">
                          {formatCurrency(order.total)}
                        </p>
                        <p className="text-xs text-[#666666]">
                          {order.items.length} item(s)
                        </p>
                      </div>

                      {nextStatus[order.status] && (
                        <Button
                          size="sm"
                          className="bg-[#E85A00] hover:bg-[#CC4D00] text-white font-bold rounded-lg"
                          loading={updatingId === order.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(order.id, nextStatus[order.status]);
                          }}
                        >
                          {nextStatusLabel[order.status]}
                        </Button>
                      )}

                      <ChevronDown
                        className={`h-4 w-4 text-[#666666] transition-transform ${
                          expandedId === order.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedId === order.id && (
                    <div className="border-t border-[#E8E8E8] p-4 bg-[#F5F5F5]">
                      <div className="space-y-2 mb-3">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-[#1A1A1A]">
                              {item.quantity}x {item.product.name}
                            </span>
                            <span className="text-[#666666]">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between border-t border-[#E8E8E8] pt-3">
                        <span className="text-sm text-[#666666]">
                          {formatDateTime(order.createdAt)}
                        </span>
                        <div className="text-right text-sm">
                          <p className="text-[#666666]">
                            Sua receita:{" "}
                            <span className="text-green-600 font-semibold">
                              {formatCurrency(order.partnerAmount)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      <MobileNav role="PARTNER" />
    </div>
  );
}
