"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/setup/check")
      .then((r) => r.json())
      .then((data) => {
        if (data.setupDone) router.replace("/login");
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao criar administrador.");
      } else {
        router.push("/login?setup=done");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#3B3BFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <img src="/isotipo-preto.svg" alt="" className="w-8 h-10" />
          <img src="/logo-principal-preto.svg" alt="PodSpace" className="h-8" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E8E8] p-8">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-700 text-[#1A1A1A] uppercase tracking-wide mb-1">
              Configuração inicial
            </h1>
            <p className="text-sm text-[#666666]">
              Crie a conta de administrador da plataforma.
              Esta página ficará inacessível após a criação.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                E-mail do admin
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@podspaceclub.com.br"
                className="w-full px-4 py-3 rounded-xl border border-[#E8E8E8] bg-[#F9F9F9] text-[#1A1A1A] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#3B3BFF] focus:bg-white transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Mínimo 8 caracteres"
                className="w-full px-4 py-3 rounded-xl border border-[#E8E8E8] bg-[#F9F9F9] text-[#1A1A1A] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#3B3BFF] focus:bg-white transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                Confirmar senha
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="Repita a senha"
                className="w-full px-4 py-3 rounded-xl border border-[#E8E8E8] bg-[#F9F9F9] text-[#1A1A1A] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#3B3BFF] focus:bg-white transition-colors text-sm"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#3B3BFF] text-white font-semibold text-sm hover:bg-[#2929CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Criando conta..." : "Criar conta admin"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#AAAAAA] mt-6">
          PodSpace Club — Configuração única de administrador
        </p>
      </div>
    </div>
  );
}
