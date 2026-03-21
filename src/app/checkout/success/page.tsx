"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, MessageCircle, Home, Package, Mic2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { generateWhatsAppLink } from "@/lib/whatsapp";

interface OrderData {
  id?: string;
  customerName?: string;
  total?: number;
  items?: Array<{
    quantity: number;
    price: number;
    product: { name: string };
  }>;
  partner?: { name: string; whatsapp: string };
}

export default function CheckoutSuccessPage() {
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("lastOrder");
    if (data) {
      setOrder(JSON.parse(data));
    }
  }, []);

  const whatsappLink =
    order?.partner?.whatsapp
      ? generateWhatsAppLink(
          order.partner.whatsapp,
          `Olá! Acabei de fazer um pedido na PodSpace Club (${order.id?.slice(-8).toUpperCase()}) no valor de ${formatCurrency(order.total || 0)}. Gostaria de confirmar!`
        )
      : null;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Success animation */}
        <div className="text-center mb-8">
          <div className="relative inline-flex">
            <div className="w-24 h-24 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center animate-fade-in">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-ping" />
          </div>

          <h1 className="font-display text-4xl font-700 text-[#1A1A1A] uppercase mt-6 mb-2">
            Pedido Confirmado!
          </h1>
          <p className="text-[#666666]">
            Obrigado, {order?.customerName || "cliente"}! Seu pedido foi processado com sucesso.
          </p>
        </div>

        {/* Order details card */}
        <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 mb-6 shadow-card">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#E8E8E8]">
            <div className="w-10 h-10 rounded-xl bg-[#3B3BFF] flex items-center justify-center">
              <Mic2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-display text-lg font-700 text-[#1A1A1A] uppercase">PodSpace Club</p>
              <p className="text-xs text-[#666666]">
                Pedido #{order?.id?.slice(-8).toUpperCase() || "—"}
              </p>
            </div>
          </div>

          {order?.items && order.items.length > 0 && (
            <div className="space-y-2 mb-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-[#1A1A1A]">
                    {item.quantity}x {item.product?.name}
                  </span>
                  <span className="text-[#666666]">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {order?.total && (
            <div className="flex justify-between font-bold text-lg border-t border-[#E8E8E8] pt-3">
              <span className="text-[#1A1A1A]">Total Pago</span>
              <span className="text-[#3B3BFF]">{formatCurrency(order.total)}</span>
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-6">
          {[
            {
              icon: CheckCircle,
              text: "Pagamento processado",
              done: true,
            },
            {
              icon: Package,
              text: "Parceiro notificado",
              done: true,
            },
            {
              icon: MessageCircle,
              text: "Confirmação via WhatsApp",
              done: false,
            },
          ].map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step.done
                      ? "bg-green-50 text-green-500 border border-green-200"
                      : "bg-[#F5F5F5] text-[#666666] border border-[#E8E8E8]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span
                  className={step.done ? "text-[#1A1A1A]" : "text-[#666666]"}
                >
                  {step.text}
                </span>
                {step.done && (
                  <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {whatsappLink && (
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold h-11 rounded-lg gap-2" size="lg">
                <MessageCircle className="h-5 w-5" />
                Confirmar pelo WhatsApp
              </Button>
            </a>
          )}

          <Link href="/loja">
            <Button variant="outline" className="w-full gap-2 border-[#E8E8E8] text-[#1A1A1A] hover:bg-[#F5F5F5]">
              <Home className="h-4 w-4" />
              Voltar às Lojas
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
