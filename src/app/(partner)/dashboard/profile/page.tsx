"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toaster";
import { Save, Store, ExternalLink } from "lucide-react";
import Image from "next/image";

interface PartnerData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  whatsapp: string;
  phone?: string;
  category?: string;
  status: string;
}

const sampleLogos = [
  "https://picsum.photos/seed/logo1/100/100",
  "https://picsum.photos/seed/logo2/100/100",
  "https://picsum.photos/seed/logo3/100/100",
  "https://picsum.photos/seed/logo4/100/100",
];

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [loading, setLoading] = useState(false);
  const [partner, setPartner] = useState<PartnerData | null>(null);

  useEffect(() => {
    if (user?.partnerId) {
      fetch(`/api/partners/${user.partnerId}`)
        .then((r) => r.json())
        .then((data) => setPartner(data));
    }
  }, [user?.partnerId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/partners/${partner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partner),
      });

      if (res.ok) {
        toast({ title: "Perfil atualizado com sucesso!", variant: "success" });
      } else {
        toast({ title: "Erro ao salvar", variant: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!partner) {
    return (
      <div className="flex min-h-screen bg-[#F5F5F5]">
        <Sidebar role="PARTNER" />
        <div className="flex-1 lg:ml-64 flex items-center justify-center">
          <div className="spinner w-8 h-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar role="PARTNER" />
      <div className="flex-1 lg:ml-64">
        <Header title="Meu Perfil" />

        <main className="p-6 pb-24 lg:pb-6 space-y-6 max-w-2xl">
          {/* Store preview */}
          <div className="bg-white border border-[#E8E8E8] rounded-xl overflow-hidden">
            <div className="relative h-24 bg-gradient-to-r from-[#3B3BFF]/20 to-[#E85A00]/20">
              <div className="absolute bottom-0 left-6 translate-y-1/2">
                <div className="w-16 h-16 rounded-xl border-4 border-white overflow-hidden shadow-card bg-[#F5F5F5]">
                  {partner.logo ? (
                    <Image src={partner.logo} alt={partner.name} width={64} height={64} className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#3B3BFF] flex items-center justify-center text-white text-xl font-bold">
                      {partner.name[0]}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="pt-12 px-6 pb-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-[#1A1A1A]">{partner.name}</p>
                <p className="text-xs text-[#666666]">/{partner.slug}</p>
              </div>
              <a
                href={`/store/${partner.slug}`}
                target="_blank"
                className="flex items-center gap-1.5 text-xs text-[#3B3BFF] hover:text-[#2525DD] transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Ver loja
              </a>
            </div>
          </div>

          {/* Edit form */}
          <div className="bg-white border border-[#E8E8E8] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Store className="h-5 w-5 text-[#3B3BFF]" />
              <h2 className="font-display text-xl font-700 text-[#1A1A1A] uppercase">Informações da Loja</h2>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Logo selection */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  Logo da Loja
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  {sampleLogos.map((logo, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPartner((p) => p ? { ...p, logo } : p)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                        partner.logo === logo
                          ? "border-[#3B3BFF]"
                          : "border-[#E8E8E8] hover:border-[#3B3BFF]/50"
                      }`}
                    >
                      <Image src={logo} alt="" width={56} height={56} className="object-cover" />
                    </button>
                  ))}
                  <Input
                    placeholder="URL do logo"
                    value={partner.logo || ""}
                    onChange={(e) =>
                      setPartner((p) => p ? { ...p, logo: e.target.value } : p)
                    }
                    className="flex-1 min-w-[160px]"
                  />
                </div>
              </div>

              <Input
                label="Nome da Loja *"
                value={partner.name}
                onChange={(e) =>
                  setPartner((p) => p ? { ...p, name: e.target.value } : p)
                }
                required
              />

              <Textarea
                label="Descrição"
                value={partner.description || ""}
                onChange={(e) =>
                  setPartner((p) => p ? { ...p, description: e.target.value } : p)
                }
                placeholder="Descreva sua loja..."
                rows={3}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="WhatsApp *"
                  value={partner.whatsapp}
                  onChange={(e) =>
                    setPartner((p) => p ? { ...p, whatsapp: e.target.value } : p)
                  }
                  placeholder="+55 11 99999-9999"
                  required
                />
                <Input
                  label="Telefone"
                  value={partner.phone || ""}
                  onChange={(e) =>
                    setPartner((p) => p ? { ...p, phone: e.target.value } : p)
                  }
                  placeholder="+55 11 3333-3333"
                />
              </div>

              <Input
                label="URL do Banner (opcional)"
                value={partner.banner || ""}
                onChange={(e) =>
                  setPartner((p) => p ? { ...p, banner: e.target.value } : p)
                }
                placeholder="https://..."
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  className="bg-[#3B3BFF] hover:bg-[#2525DD] text-white font-bold rounded-lg"
                  loading={loading}
                >
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </div>

          {/* Account info */}
          <div className="bg-white border border-[#E8E8E8] rounded-xl p-6">
            <h3 className="font-display text-xl font-700 text-[#1A1A1A] uppercase mb-4">Informações da Conta</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#666666]">Email</span>
                <span className="text-[#1A1A1A]">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Status</span>
                <span className={partner.status === "APPROVED" ? "text-green-600" : "text-amber-600"}>
                  {partner.status === "APPROVED" ? "Aprovado" : "Pendente"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666666]">Slug da loja</span>
                <span className="text-[#3B3BFF] font-mono">/{partner.slug}</span>
              </div>
            </div>
          </div>
        </main>
      </div>
      <MobileNav role="PARTNER" />
    </div>
  );
}
