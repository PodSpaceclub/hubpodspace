import { prisma } from "@/lib/db";
import { StoreCard } from "@/components/consumer/StoreCard";
import { Search, Headphones, Radio, Zap, Mic2 } from "lucide-react";
import Link from "next/link";

async function getPartners() {
  return prisma.partner.findMany({
    where: { status: "APPROVED" },
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

const categories = [
  { label: "Todos", icon: "🎙️", value: "" },
  { label: "Alimentação", icon: "🍕", value: "Alimentação" },
  { label: "Bebidas", icon: "☕", value: "Bebidas" },
  { label: "Tecnologia", icon: "💻", value: "Tecnologia" },
  { label: "Serviços", icon: "⚙️", value: "Serviços" },
  { label: "Saúde", icon: "💚", value: "Saúde & Bem-estar" },
];

export default async function MarketplacePage() {
  const partners = await getPartners();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-lg border-b border-[#E8E8E8]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/loja" className="flex items-center gap-2 flex-shrink-0">
            <img src="/isotipo-preto.svg" alt="" className="w-6 h-8 flex-shrink-0" />
            <img src="/logo-principal-preto.svg" alt="PodSpace" className="h-6 hidden sm:block" />
          </Link>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666666]" />
              <input
                type="text"
                placeholder="Buscar lojas e produtos..."
                className="w-full bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#666666] focus:outline-none focus:border-[#3B3BFF] transition-colors"
              />
            </div>
          </div>

          <Link
            href="/login"
            className="flex-shrink-0 text-sm text-[#E85A00] hover:text-[#CC4D00] transition-colors font-semibold"
          >
            Seja Parceiro
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#3B3BFF] py-16 lg:py-24">
        {/* Geometric brand squares */}
        <div className="absolute top-8 left-[12%] w-12 h-12 bg-[#E85A00]" />
        <div className="absolute top-24 left-[6%] w-8 h-8 bg-[#55FF33]" />
        <div className="absolute bottom-10 left-[18%] w-10 h-10 bg-[#FF33CC]" />
        <div className="absolute top-6 right-[18%] w-14 h-14 bg-[#55FF33]" />
        <div className="absolute top-20 right-[8%] w-10 h-10 bg-[#E85A00]" />
        <div className="absolute bottom-8 right-[22%] w-8 h-8 bg-[#FF33CC]" />
        {/* Soft blur overlay */}
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />

        <div className="relative max-w-6xl mx-auto px-4 text-center">
          {/* Isotipo */}
          <div className="flex justify-center mb-6">
            <img src="/isotipo-branco.svg" alt="PodSpace" className="w-12 h-16" />
          </div>

          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-white mb-6">
            <Zap className="h-3.5 w-3.5" />
            O marketplace do universo podcast
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-800 text-white uppercase mb-4 leading-tight">
            Hub de Parceiros
          </h1>

          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10">
            Descubra produtos e serviços exclusivos de parceiros selecionados,
            pensados especialmente para o universo dos podcasts.
          </p>

          <div className="flex items-center justify-center gap-8 text-center">
            {[
              { icon: Headphones, label: "Podcasters atendidos", value: "2.000+" },
              { icon: Radio, label: "Parceiros verificados", value: `${partners.length}+` },
              { icon: Mic2, label: "Estúdios parceiros", value: "15+" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-1">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-display text-3xl font-700 text-white">{stat.value}</p>
                  <p className="text-xs text-white/60">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Category filters */}
      <section className="max-w-6xl mx-auto px-4 mb-8 mt-8">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.value}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E8E8E8] hover:border-[#3B3BFF] hover:bg-[#3B3BFF]/05 text-sm font-medium text-[#1A1A1A] whitespace-nowrap transition-all flex-shrink-0"
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Partners Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        {partners.length === 0 ? (
          <div className="text-center py-16">
            <Mic2 className="h-16 w-16 mx-auto mb-4 text-[#CCCCCC]" />
            <h3 className="font-display text-2xl font-700 text-[#1A1A1A] uppercase mb-2">
              Em breve!
            </h3>
            <p className="text-[#666666]">
              Parceiros incríveis chegando em breve.
            </p>
            <Link href="/register" className="mt-4 inline-flex text-sm text-[#E85A00] hover:underline font-medium">
              Seja o primeiro parceiro →
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-700 text-[#1A1A1A] uppercase">
                Lojas Disponíveis
              </h2>
              <span className="text-sm text-[#666666]">
                {partners.length} loja(s)
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {partners.map((partner) => (
                <StoreCard
                  key={partner.id}
                  id={partner.id}
                  slug={partner.slug}
                  name={partner.name}
                  description={partner.description || undefined}
                  logo={partner.logo || undefined}
                  category={partner.category || undefined}
                  productsCount={partner._count.products}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E8E8E8] py-8 bg-[#F5F5F5]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/isotipo-preto.svg" alt="" className="w-4 h-5 opacity-40" />
            <span className="font-display text-sm font-600 text-[#666666] uppercase">
              PodSpace Club © {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex gap-6 text-sm text-[#666666]">
            <Link href="/register" className="hover:text-[#3B3BFF] transition-colors">
              Seja Parceiro
            </Link>
            <Link href="/login" className="hover:text-[#3B3BFF] transition-colors">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
