"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Lock, ShoppingCart, ChevronRight } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
}

// ─── Inner Payment Form (must be inside <Elements>) ──────────────────────────

function PaymentForm({
  total,
  customerName,
  onBack,
}: {
  total: number;
  customerName: string;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMsg("");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
      redirect: "if_required",
    });

    if (error) {
      setErrorMsg(error.message ?? "Erro ao processar pagamento.");
      setLoading(false);
    } else {
      // Payment confirmed — update order status to PAID in the database
      try {
        const lastOrder = JSON.parse(sessionStorage.getItem("lastOrder") || "{}");
        if (lastOrder?.id) {
          await fetch(`/api/orders/${lastOrder.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "PAID" }),
          });
        }
      } catch {
        // Non-critical: status will still show in partner panel even if this fails
        console.error("[checkout] Failed to update order status to PAID");
      }

      sessionStorage.removeItem("cart");
      sessionStorage.removeItem("cartTotal");
      sessionStorage.removeItem("partnerId");
      router.push("/checkout/success");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl bg-[#F5F5F5] border border-[#E8E8E8] p-4">
        <p className="text-xs text-[#666666] mb-3">
          Pague com cartão de crédito ou débito
        </p>
        <PaymentElement
          options={{
            layout: "tabs",
            defaultValues: { billingDetails: { name: customerName } },
          }}
        />
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {errorMsg}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-[#666666] p-3 bg-green-50 border border-green-200 rounded-lg">
        <Lock className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
        Pagamento 100% seguro processado pelo Stripe
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="border-[#E8E8E8] text-[#1A1A1A] hover:bg-[#F5F5F5]"
          onClick={onBack}
          disabled={loading}
        >
          Voltar
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-[#E85A00] hover:bg-[#CC4D00] text-white font-bold h-11 rounded-lg"
          loading={loading}
          disabled={!stripe || !elements || loading}
          size="lg"
        >
          {loading ? "Processando..." : `Pagar ${formatCurrency(total)}`}
        </Button>
      </div>
    </form>
  );
}

// ─── Main Checkout Page ───────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [step, setStep] = useState<"info" | "payment">("info");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const cartData = sessionStorage.getItem("cart");
    const cartTotal = sessionStorage.getItem("cartTotal");
    if (cartData) setItems(JSON.parse(cartData));
    if (cartTotal) setTotal(parseFloat(cartTotal));
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!form.email.trim() || !form.email.includes("@"))
      newErrors.email = "Email inválido";
    if (!form.phone.trim()) newErrors.phone = "WhatsApp é obrigatório";
    if (!form.address.trim()) newErrors.address = "Endereço de entrega é obrigatório";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToPayment = useCallback(async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const cartData = sessionStorage.getItem("cart");
      const cartItems: CartItem[] = cartData ? JSON.parse(cartData) : [];
      const partnerId = sessionStorage.getItem("partnerId") || "";

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerId,
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          customerAddress: form.address,
          items: cartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrors({ submit: data.error || "Erro ao criar pedido" });
        return;
      }

      const order = await res.json();
      sessionStorage.setItem(
        "lastOrder",
        JSON.stringify({ ...order, customerName: form.name })
      );
      setClientSecret(order.clientSecret);
      setStep("payment");
    } catch {
      setErrors({ submit: "Erro de conexão. Tente novamente." });
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-[#CCCCCC]" />
          <p className="text-[#1A1A1A] font-medium mb-2">Carrinho vazio</p>
          <Link href="/loja">
            <Button className="bg-[#3B3BFF] hover:bg-[#2525DD] text-white font-bold rounded-lg">
              Ver Lojas
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <header className="border-b border-[#E8E8E8] bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-[#F5F5F5] transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-[#666666]" />
          </button>
          <div className="flex items-center gap-2">
            <Image src="/isotipo-preto.svg" alt="" width={20} height={28} unoptimized />
            <span className="font-display text-lg font-700 text-[#1A1A1A] uppercase">
              Checkout
            </span>
          </div>
          <div className="ml-auto flex items-center gap-1 text-xs text-[#666666]">
            <Lock className="h-3 w-3" />
            Compra segura
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left - Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Steps indicator */}
            <div className="flex items-center gap-3 text-sm">
              <div
                className={`flex items-center gap-2 ${
                  step === "info" ? "text-[#3B3BFF]" : "text-[#666666]"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === "info"
                      ? "bg-[#3B3BFF] text-white"
                      : "bg-green-500 text-white"
                  }`}
                >
                  1
                </div>
                Seus Dados
              </div>
              <ChevronRight className="h-4 w-4 text-[#CCCCCC]" />
              <div
                className={`flex items-center gap-2 ${
                  step === "payment" ? "text-[#3B3BFF]" : "text-[#666666]"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === "payment"
                      ? "bg-[#3B3BFF] text-white"
                      : "bg-[#E8E8E8] text-[#666666]"
                  }`}
                >
                  2
                </div>
                Pagamento
              </div>
            </div>

            {/* Step 1 — Customer Info */}
            {step === "info" && (
              <div className="bg-white border border-[#E8E8E8] rounded-xl p-6 space-y-4">
                <h2 className="font-display text-xl font-700 text-[#1A1A1A] uppercase">
                  Informações do Cliente
                </h2>

                {errors.submit && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
                    {errors.submit}
                  </div>
                )}

                <Input
                  label="Nome completo *"
                  placeholder="Seu nome"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  error={errors.name}
                />
                <Input
                  label="Email *"
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  error={errors.email}
                />
                <Input
                  label="WhatsApp *"
                  type="tel"
                  placeholder="+55 11 99999-9999"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  error={errors.phone}
                />
                <Textarea
                  label="Endereço de entrega *"
                  placeholder="Rua, número, bairro, cidade, CEP..."
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                  rows={3}
                  error={errors.address}
                />

                <Button
                  className="w-full bg-[#3B3BFF] hover:bg-[#2525DD] text-white font-bold h-11 rounded-lg"
                  onClick={handleContinueToPayment}
                  loading={loading}
                  size="lg"
                >
                  Continuar para Pagamento
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Step 2 — Stripe Payment */}
            {step === "payment" && clientSecret && (
              <div className="bg-white border border-[#E8E8E8] rounded-xl p-6 space-y-4">
                <h2 className="font-display text-xl font-700 text-[#1A1A1A] uppercase">
                  Pagamento
                </h2>
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary: "#3B3BFF",
                        colorBackground: "#ffffff",
                        borderRadius: "8px",
                        fontFamily: "Inter, system-ui, sans-serif",
                      },
                    },
                    locale: "pt-BR",
                  }}
                >
                  <PaymentForm
                    total={total}
                    customerName={form.name}
                    onBack={() => setStep("info")}
                  />
                </Elements>
              </div>
            )}
          </div>

          {/* Right - Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-[#E8E8E8] rounded-xl p-6 sticky top-24">
              <h3 className="font-display text-xl font-700 text-[#1A1A1A] uppercase mb-4">
                Resumo do Pedido
              </h3>

              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <span className="text-[#1A1A1A] line-clamp-1">
                        {item.quantity}x {item.product.name}
                      </span>
                    </div>
                    <span className="text-[#666666] flex-shrink-0">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#E8E8E8] pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#666666]">Subtotal</span>
                  <span className="text-[#1A1A1A]">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#666666]">Taxa de serviço</span>
                  <span className="text-green-600 font-medium">Grátis</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-[#E8E8E8] pt-2 mt-2">
                  <span className="text-[#1A1A1A]">Total</span>
                  <span className="text-[#3B3BFF]">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-[#666666]">
                <Lock className="h-3 w-3" />
                Dados protegidos com criptografia SSL
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
