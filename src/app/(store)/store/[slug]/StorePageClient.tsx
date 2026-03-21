"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  MessageCircle,
  MapPin,
  Mic2,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/consumer/ProductGrid";
import { CartProvider, CartFab, CartDrawer } from "@/components/consumer/Cart";
import { generateWhatsAppLink } from "@/lib/whatsapp";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  stock?: number;
  active: boolean;
}

interface Partner {
  id: string;
  slug: string;
  name: string;
  description?: string;
  logo?: string;
  banner?: string;
  whatsapp: string;
  category?: string;
  products: Product[];
}

export function StorePageClient({ partner }: { partner: Partner }) {
  const [cartOpen, setCartOpen] = useState(false);

  const whatsappLink = generateWhatsAppLink(
    partner.whatsapp,
    `Olá! Vim pela PodSpace Club e gostaria de mais informações sobre a loja ${partner.name}.`
  );

  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-lg border-b border-[#E8E8E8]">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
            <Link
              href="/loja"
              className="p-2 rounded-lg hover:bg-[#F5F5F5] transition-colors"
            >
              <ArrowLeft className="h-4 w-4 text-[#666666]" />
            </Link>
            <div className="flex-1">
              <p className="font-semibold text-[#1A1A1A] text-sm">{partner.name}</p>
              {partner.category && (
                <p className="text-xs text-[#666666]">{partner.category}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#3B3BFF] flex items-center justify-center">
                <Mic2 className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Store Banner */}
        <div className="relative h-40 md:h-52 overflow-hidden bg-[#3B3BFF]">
          {partner.banner ? (
            <Image
              src={partner.banner}
              alt={partner.name}
              fill
              className="object-cover opacity-60"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="sound-wave">
                <span style={{ background: "rgba(255,255,255,0.3)", height: "16px" }} />
                <span style={{ background: "rgba(255,255,255,0.5)", height: "32px" }} />
                <span style={{ background: "rgba(255,255,255,0.6)", height: "48px" }} />
                <span style={{ background: "rgba(255,255,255,0.7)", height: "64px" }} />
                <span style={{ background: "rgba(255,255,255,0.6)", height: "48px" }} />
                <span style={{ background: "rgba(255,255,255,0.5)", height: "32px" }} />
                <span style={{ background: "rgba(255,255,255,0.3)", height: "16px" }} />
              </div>
            </div>
          )}
        </div>

        <div className="max-w-3xl mx-auto px-4">
          {/* Store info */}
          <div className="relative -mt-10 mb-6 flex items-end gap-4">
            <div className="w-20 h-20 rounded-2xl border-4 border-white overflow-hidden shadow-card bg-[#F5F5F5] flex-shrink-0">
              {partner.logo ? (
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#3B3BFF] flex items-center justify-center text-white text-2xl font-bold">
                  {partner.name[0]}
                </div>
              )}
            </div>
            <div className="pb-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl font-700 text-[#1A1A1A] uppercase">{partner.name}</h1>
                {partner.category && (
                  <span className="text-xs bg-[#3B3BFF]/10 text-[#3B3BFF] px-2 py-0.5 rounded-full font-medium">
                    {partner.category}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-xs font-medium">4.8</span>
                  <span className="text-xs text-[#666666]">(52)</span>
                </div>
                <div className="flex items-center gap-1 text-[#666666]">
                  <MapPin className="h-3 w-3" />
                  <span className="text-xs">Estúdio parceiro</span>
                </div>
              </div>
            </div>
          </div>

          {partner.description && (
            <p className="text-sm text-[#666666] mb-6">{partner.description}</p>
          )}

          {/* WhatsApp button */}
          <div className="mb-6">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Button className="bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg gap-2" size="sm">
                <MessageCircle className="h-4 w-4" />
                Falar no WhatsApp
              </Button>
            </a>
          </div>

          {/* Products */}
          <div className="mb-6">
            <h2 className="font-display text-xl font-700 text-[#1A1A1A] uppercase mb-4">
              Produtos
              <span className="ml-2 text-sm font-sans font-normal text-[#666666]">
                ({partner.products.filter((p) => p.active).length})
              </span>
            </h2>
            <ProductGrid products={partner.products} partnerId={partner.id} />
          </div>
        </div>

        {/* Cart FAB */}
        <CartFab />
        {/* Cart drawer is handled by CartFab */}
      </div>
    </CartProvider>
  );
}
