"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Download, Trash2, QrCode, Copy } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";

interface TrackingCode {
  id: string;
  code: string;
  label: string;
  description?: string;
  orders: number;
  createdAt: string | Date;
}

interface QRCodesClientProps {
  codes: TrackingCode[];
}

export function QRCodesClient({ codes: initialCodes }: QRCodesClientProps) {
  const [codes, setCodes] = useState(initialCodes);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ label: "", description: "" });

  // Generate QR code images client-side
  useEffect(() => {
    const generateQRs = async () => {
      try {
        const QRCode = (await import("qrcode")).default;
        const images: Record<string, string> = {};
        for (const code of codes) {
          const url = `${window.location.origin}/loja?ref=${code.code}`;
          const dataUrl = await QRCode.toDataURL(url, {
            width: 200,
            margin: 2,
            color: {
              dark: "#3B3BFF",
              light: "#FFFFFF",
            },
          });
          images[code.id] = dataUrl;
        }
        setQrImages(images);
      } catch (err) {
        console.error("QR generation error:", err);
      }
    };

    if (codes.length > 0) generateQRs();
  }, [codes]);

  const generateNewQR = async (newCode: TrackingCode) => {
    try {
      const QRCode = (await import("qrcode")).default;
      const url = `${window.location.origin}/loja?ref=${newCode.code}`;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: { dark: "#3B3BFF", light: "#FFFFFF" },
      });
      setQrImages((prev) => ({ ...prev, [newCode.id]: dataUrl }));
    } catch {}
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label) return;
    setLoading(true);

    try {
      const res = await fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const newCode = await res.json();
        setCodes((prev) => [newCode, ...prev]);
        await generateNewQR(newCode);
        setForm({ label: "", description: "" });
        setShowForm(false);
        toast({ title: "QR Code criado!", variant: "success" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este QR code?")) return;
    const res = await fetch(`/api/tracking?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setCodes((prev) => prev.filter((c) => c.id !== id));
      toast({ title: "QR Code excluído", variant: "success" });
    }
  };

  const handleDownload = (id: string, label: string) => {
    const img = qrImages[id];
    if (!img) return;
    const link = document.createElement("a");
    link.download = `qrcode-${label.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.href = img;
    link.click();
    toast({ title: "QR Code baixado!", variant: "success" });
  };

  const handleCopyLink = (code: string) => {
    const url = `${window.location.origin}/loja?ref=${code}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copiado!", variant: "success" });
  };

  return (
    <div className="space-y-6">
      {/* Create form */}
      {!showForm ? (
        <Button
          className="bg-[#3B3BFF] hover:bg-[#2525DD] text-white font-bold rounded-lg"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-4 w-4" />
          Gerar Novo QR Code
        </Button>
      ) : (
        <div className="bg-white border border-[#E8E8E8] rounded-xl p-6 max-w-md">
          <h3 className="font-display text-xl font-700 text-[#1A1A1A] uppercase mb-4">Novo QR Code</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Label (ex: Estúdio A, Cliente João)"
              placeholder="Nome identificador"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              required
            />
            <Textarea
              label="Descrição (opcional)"
              placeholder="Contexto adicional..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                className="bg-[#3B3BFF] hover:bg-[#2525DD] text-white font-bold rounded-lg"
                loading={loading}
              >
                Gerar QR Code
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-[#E8E8E8] text-[#1A1A1A] hover:bg-[#F5F5F5]"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* QR Codes grid */}
      {codes.length === 0 ? (
        <div className="text-center py-16">
          <QrCode className="h-16 w-16 mx-auto mb-4 text-[#CCCCCC]" />
          <h3 className="font-display text-2xl font-700 text-[#1A1A1A] uppercase mb-2">
            Nenhum QR Code gerado
          </h3>
          <p className="text-[#666666] text-sm">
            Gere QR codes únicos para rastrear vendas por estúdio ou cliente
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {codes.map((code) => (
            <div
              key={code.id}
              className="bg-white border border-[#E8E8E8] rounded-xl p-4 text-center card-hover"
            >
              {/* QR Image */}
              <div className="flex items-center justify-center mb-4">
                {qrImages[code.id] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrImages[code.id]}
                    alt={`QR Code ${code.label}`}
                    className="w-32 h-32 rounded-xl border border-[#E8E8E8]"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-xl bg-[#F5F5F5] flex items-center justify-center animate-pulse">
                    <QrCode className="h-8 w-8 text-[#CCCCCC]" />
                  </div>
                )}
              </div>

              {/* Info */}
              <h4 className="font-semibold text-[#1A1A1A] text-sm mb-1">
                {code.label}
              </h4>
              {code.description && (
                <p className="text-xs text-[#666666] mb-2 line-clamp-2">
                  {code.description}
                </p>
              )}
              <p className="font-mono text-xs text-[#3B3BFF] mb-1">{code.code}</p>
              <p className="text-xs text-[#666666] mb-3">
                {code.orders} pedido(s) • {formatDate(code.createdAt)}
              </p>

              {/* Actions */}
              <div className="flex gap-2 justify-center">
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => handleCopyLink(code.code)}
                  title="Copiar link"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => handleDownload(code.id, code.label)}
                  disabled={!qrImages[code.id]}
                  title="Baixar PNG"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="destructive"
                  onClick={() => handleDelete(code.id)}
                  title="Excluir"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
