"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Lock,
  Building2,
  Phone,
  Mic2,
  ArrowRight,
  CheckCircle,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type FormData = {
  companyName: string;
  email: string;
  password: string;
  confirmPassword: string;
  whatsapp: string;
  phone: string;
  description: string;
  category: string;
};

const categories = [
  "Alimentação",
  "Bebidas",
  "Tecnologia",
  "Serviços",
  "Moda",
  "Saúde & Bem-estar",
  "Educação",
  "Entretenimento",
  "Outros",
];

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [apiError, setApiError] = useState("");
  const [form, setForm] = useState<FormData>({
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
    whatsapp: "",
    phone: "",
    description: "",
    category: "",
  });

  const validate = () => {
    const newErrors: Partial<FormData> = {};
    if (!form.companyName) newErrors.companyName = "Nome é obrigatório";
    if (!form.email) newErrors.email = "Email é obrigatório";
    if (!form.password || form.password.length < 6)
      newErrors.password = "Senha deve ter no mínimo 6 caracteres";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "As senhas não coincidem";
    if (!form.whatsapp) newErrors.whatsapp = "WhatsApp é obrigatório";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError("");

    try {
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.companyName,
          whatsapp: form.whatsapp,
          phone: form.phone,
          description: form.description,
          category: form.category,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error || "Erro ao cadastrar");
        return;
      }

      setSuccess(true);
    } catch {
      setApiError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="font-display text-3xl font-700 text-[#1A1A1A] uppercase mb-3">
            Solicitação enviada!
          </h2>
          <p className="text-[#666666] mb-6 text-sm">
            Seu cadastro foi recebido com sucesso.{" "}
            <strong className="text-[#1A1A1A]">
              Aguarde a aprovação do administrador.
            </strong>{" "}
            Você receberá um aviso assim que sua conta for ativada.
          </p>
          <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl p-4 mb-6 text-sm text-left space-y-2">
            <p className="text-[#666666]">
              ✅ Cadastro realizado para{" "}
              <span className="text-[#1A1A1A] font-medium">{form.email}</span>
            </p>
            <p className="text-[#666666]">
              ⏳ Análise em até <span className="text-[#1A1A1A]">24-48 horas úteis</span>
            </p>
            <p className="text-[#666666]">
              📱 Contato via <span className="text-[#1A1A1A]">{form.whatsapp}</span>
            </p>
          </div>
          <Link href="/login">
            <Button className="w-full bg-[#3B3BFF] hover:bg-[#2525DD] text-white font-bold h-11 rounded-lg">
              Voltar ao Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left - Brand Panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-[#3B3BFF] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#E85A00]/30 rounded-tr-full" />

        <div className="relative z-10 text-center max-w-sm">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Mic2 className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="font-display text-4xl font-800 text-white uppercase tracking-wide mb-2">
            Seja um Parceiro
          </h1>
          <p className="text-white/70 leading-relaxed mb-8 text-sm">
            Alcance milhares de ouvintes apaixonados por podcast. Venda seus produtos no maior hub do ecossistema.
          </p>

          <div className="space-y-3 text-left">
            {[
              "Loja própria personalizada",
              "Painel de controle completo",
              "Pagamentos automáticos",
              "Relatórios de vendas",
              "Suporte dedicado",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm text-white/80">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto bg-white">
        <div className="w-full max-w-sm py-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-[#3B3BFF] flex items-center justify-center">
              <Mic2 className="h-5 w-5 text-white" />
            </div>
            <p className="font-display text-xl font-700 text-[#1A1A1A] uppercase">PodSpace</p>
          </div>

          <div className="mb-6">
            <h2 className="font-display text-3xl font-700 text-[#1A1A1A] uppercase">Cadastre seu negócio</h2>
            <p className="text-[#666666] mt-1 text-sm">Comece a vender no PodSpace Club</p>
          </div>

          {apiError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome da Empresa / Marca *"
              placeholder="Ex: Café do Podcaster"
              icon={<Building2 className="h-4 w-4" />}
              value={form.companyName}
              onChange={(e) =>
                setForm((f) => ({ ...f, companyName: e.target.value }))
              }
              error={errors.companyName}
              required
            />

            <Input
              label="Email *"
              type="email"
              placeholder="contato@suaempresa.com"
              icon={<Mail className="h-4 w-4" />}
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              error={errors.email}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Senha *"
                type="password"
                placeholder="••••••"
                icon={<Lock className="h-4 w-4" />}
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                error={errors.password}
                required
              />
              <Input
                label="Confirmar Senha *"
                type="password"
                placeholder="••••••"
                icon={<Lock className="h-4 w-4" />}
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm((f) => ({ ...f, confirmPassword: e.target.value }))
                }
                error={errors.confirmPassword}
                required
              />
            </div>

            <Input
              label="WhatsApp *"
              type="tel"
              placeholder="+55 11 99999-9999"
              icon={<Phone className="h-4 w-4" />}
              value={form.whatsapp}
              onChange={(e) =>
                setForm((f) => ({ ...f, whatsapp: e.target.value }))
              }
              error={errors.whatsapp}
              required
            />

            <Input
              label="Telefone (opcional)"
              type="tel"
              placeholder="+55 11 3333-3333"
              icon={<Phone className="h-4 w-4" />}
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                Categoria
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                className="flex h-10 w-full rounded-lg border border-[#E8E8E8] bg-white px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#3B3BFF] focus:ring-2 focus:ring-[#3B3BFF]/10"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <Textarea
              label="Descrição do negócio"
              placeholder="Conte um pouco sobre sua empresa, produtos e diferenciais..."
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={3}
            />

            <Button
              type="submit"
              className="w-full bg-[#3B3BFF] hover:bg-[#2525DD] text-white font-bold h-11 rounded-lg transition-colors"
              loading={loading}
              size="lg"
            >
              Enviar Cadastro
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#666666]">
              Já tem conta?{" "}
              <Link
                href="/login"
                className="text-[#E85A00] hover:text-[#CC4D00] font-semibold transition-colors"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
