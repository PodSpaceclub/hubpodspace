"use client";

import { useState } from "react";
import { Check, X, Search, Eye, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { QRCodeModal } from "@/components/admin/QRCodeModal";

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

interface PartnerTableProps {
  partners: Partner[];
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
}

export function PartnerTable({
  partners: initialPartners,
  onApprove,
  onReject,
}: PartnerTableProps) {
  const [partners, setPartners] = useState(initialPartners);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [qrPartner, setQrPartner] = useState<{ name: string; slug: string } | null>(null);

  const filtered = partners.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.user?.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    try {
      await onApprove?.(id);
      setPartners((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "APPROVED" as const } : p))
      );
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setLoadingId(id);
    try {
      await onReject?.(id);
      setPartners((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "REJECTED" as const } : p))
      );
    } finally {
      setLoadingId(null);
    }
  };

  const statusBadgeVariant = {
    PENDING: "pending" as const,
    APPROVED: "approved" as const,
    REJECTED: "rejected" as const,
  };

  const statusLabel = {
    PENDING: "Pendente",
    APPROVED: "Aprovado",
    REJECTED: "Rejeitado",
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          icon={<Search className="h-4 w-4" />}
          placeholder="Buscar parceiro ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-2">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === s
                  ? "bg-[#3B3BFF] text-white"
                  : "bg-white border border-[#E8E8E8] text-[#666666] hover:border-[#3B3BFF]/50 hover:text-[#3B3BFF]"
              }`}
            >
              {s === "ALL" ? "Todos" : statusLabel[s as keyof typeof statusLabel]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#E8E8E8] overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Parceiro</th>
                <th>Email</th>
                <th>WhatsApp</th>
                <th>Status</th>
                <th>Cadastro</th>
                <th>Produtos</th>
                <th>QR Code</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-[#666666] py-8">
                    Nenhum parceiro encontrado
                  </td>
                </tr>
              ) : (
                filtered.map((partner) => (
                  <tr key={partner.id}>
                    <td>
                      <div>
                        <p className="font-medium">{partner.name}</p>
                        <p className="text-xs text-[#666666]">
                          /{partner.slug}
                        </p>
                      </div>
                    </td>
                    <td className="text-[#666666] text-sm">
                      {partner.user?.email || "—"}
                    </td>
                    <td className="text-sm">{partner.whatsapp}</td>
                    <td>
                      <Badge variant={statusBadgeVariant[partner.status]}>
                        {statusLabel[partner.status]}
                      </Badge>
                    </td>
                    <td className="text-sm text-[#666666]">
                      {formatDate(partner.createdAt)}
                    </td>
                    <td className="text-sm text-center">
                      {partner._count?.products || 0}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => setQrPartner({ name: partner.name, slug: partner.slug })}
                        className="p-2 rounded-lg border border-[#E8E8E8] hover:border-[#3B3BFF] hover:text-[#3B3BFF] text-[#666666] transition-colors"
                        title="Gerar QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        {partner.status === "PENDING" && (
                          <>
                            <Button
                              size="icon-sm"
                              variant="success"
                              onClick={() => handleApprove(partner.id)}
                              loading={loadingId === partner.id}
                              title="Aprovar"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon-sm"
                              variant="destructive"
                              onClick={() => handleReject(partner.id)}
                              loading={loadingId === partner.id}
                              title="Rejeitar"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="icon-sm"
                          variant="outline"
                          asChild
                          title="Ver loja"
                        >
                          <a href={`/store/${partner.slug}`} target="_blank">
                            <Eye className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <QRCodeModal
        isOpen={!!qrPartner}
        onClose={() => setQrPartner(null)}
        partner={qrPartner}
      />
    </div>
  );
}
