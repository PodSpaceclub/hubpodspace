"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "PENDING_APPROVAL") {
          setError("Sua conta está aguardando aprovação do administrador.");
        } else if (result.error === "ACCOUNT_REJECTED") {
          setError("Sua conta foi rejeitada. Entre em contato com o suporte.");
        } else {
          setError("Email ou senha inválidos.");
        }
        return;
      }

      // Get session to determine role
      const session = await getSession();
      const user = session?.user as any;
      if (user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left - Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#3B3BFF] flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Geometric decoration */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#E85A00]/30 rounded-tr-full" />
        <div className="absolute top-1/4 left-8 w-3 h-16 bg-white/20 rounded-full" />
        <div className="absolute top-1/3 left-14 w-3 h-10 bg-white/10 rounded-full" />
        <div className="absolute bottom-1/4 right-8 w-3 h-16 bg-[#E85A00]/40 rounded-full" />
        <div className="absolute bottom-1/3 right-14 w-3 h-10 bg-white/20 rounded-full" />

        {/* Content */}
        <div className="relative z-10 text-center max-w-md">
          {/* Logo mark */}
          <div className="flex justify-center mb-8">
            <Image src="/isotipo-branco.svg" alt="PodSpace" width={64} height={80} unoptimized />
          </div>

          {/* Sound wave */}
          <div className="flex justify-center mb-8">
            <div className="sound-wave">
              <span style={{ background: "rgba(255,255,255,0.6)" }} />
              <span style={{ background: "rgba(255,255,255,0.8)" }} />
              <span style={{ background: "#ffffff" }} />
              <span style={{ background: "rgba(255,255,255,0.8)" }} />
              <span style={{ background: "rgba(255,255,255,0.6)" }} />
            </div>
          </div>

          <div className="flex justify-center mb-2">
            <Image src="/logo-principal-branco.svg" alt="PodSpace" width={240} height={48} className="h-12 w-auto" unoptimized />
          </div>
          <p className="text-white/80 text-lg font-medium mb-3">
            Hub de Parceiros
          </p>
          <p className="text-white/60 leading-relaxed text-sm">
            O marketplace premium que conecta parceiros incríveis ao universo dos podcasts.
            Venda seus produtos e serviços para uma audiência engajada.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Parceiros", value: "50+" },
              { label: "Vendas/mês", value: "500+" },
              { label: "Satisfação", value: "98%" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-3 border border-white/10">
                <p className="font-display text-2xl font-700 text-white">{stat.value}</p>
                <p className="text-xs text-white/60 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-2 text-left">
            {[
              "Loja própria personalizada",
              "Painel de controle completo",
              "Relatórios de vendas em tempo real",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-white/80 flex-shrink-0" />
                <span className="text-sm text-white/70">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-sm">
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <Image src="/isotipo-preto.svg" alt="" width={28} height={36} className="flex-shrink-0" unoptimized />
            <Image src="/logo-principal-preto.svg" alt="PodSpace" width={210} height={28} className="h-7 w-auto" unoptimized />
          </div>

          <div className="mb-8">
            <h2 className="font-display text-3xl font-700 text-[#1A1A1A] uppercase">Bem-vindo de volta</h2>
            <p className="text-[#666666] mt-1 text-sm">Entre na sua conta de parceiro</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              icon={<Mail className="h-4 w-4" />}
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              autoComplete="email"
            />

            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4" />}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              className="w-full bg-[#3B3BFF] hover:bg-[#2525DD] text-white font-bold h-11 rounded-lg transition-colors"
              loading={loading}
              size="lg"
            >
              Entrar
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#666666]">
              Não tem conta?{" "}
              <Link
                href="/register"
                className="text-[#E85A00] hover:text-[#CC4D00] font-semibold transition-colors"
              >
                Cadastre seu negócio
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/loja"
              className="text-xs text-[#666666] hover:text-[#3B3BFF] transition-colors"
            >
              Ver marketplace público →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
