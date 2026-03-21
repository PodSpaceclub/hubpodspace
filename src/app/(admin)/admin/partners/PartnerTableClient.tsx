"use client";

import { PartnerTable } from "@/components/admin/PartnerTable";
import { toast } from "@/components/ui/toaster";

interface Partner {
  id: string;
  name: string;
  slug: string;
  whatsapp: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string | Date;
  category?: string;
  user?: { email: string };
  _count?: { products: number; orders: number };
}

export function PartnerTableClient({ partners }: { partners: Partner[] }) {
  const handleApprove = async (id: string) => {
    const res = await fetch(`/api/partners/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "APPROVED" }),
    });
    if (res.ok) {
      toast({ title: "Parceiro aprovado!", variant: "success" });
    } else {
      toast({ title: "Erro ao aprovar", variant: "error" });
    }
  };

  const handleReject = async (id: string) => {
    const res = await fetch(`/api/partners/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "REJECTED" }),
    });
    if (res.ok) {
      toast({ title: "Parceiro rejeitado", variant: "warning" });
    } else {
      toast({ title: "Erro ao rejeitar", variant: "error" });
    }
  };

  return (
    <PartnerTable
      partners={partners}
      onApprove={handleApprove}
      onReject={handleReject}
    />
  );
}
