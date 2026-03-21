import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export const COMMISSION_RATE = 0.1; // 10% platform fee

export async function createPaymentIntent(
  amount: number,
  metadata?: Record<string, string>
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // centavos
    currency: "brl",
    payment_method_types: ["card"],
    metadata: metadata ?? {},
  });
}

export function calculateCommission(total: number): {
  commission: number;
  partnerAmount: number;
} {
  const commission = total * COMMISSION_RATE;
  const partnerAmount = total - commission;
  return { commission, partnerAmount };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}
