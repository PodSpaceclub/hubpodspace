import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  // If webhook secret is not configured yet (pre-deploy), skip verification
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || webhookSecret === "whsec_mock_key") {
    console.warn("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured — skipping signature verification");
    return NextResponse.json({ received: true });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Stripe Webhook] Signature verification failed:", message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as { id: string };
        await prisma.order.updateMany({
          where: { stripeId: paymentIntent.id },
          data: { status: "PAID" },
        });
        console.log(`[Stripe Webhook] Order paid — PaymentIntent: ${paymentIntent.id}`);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as { id: string };
        await prisma.order.updateMany({
          where: { stripeId: paymentIntent.id },
          data: { status: "CANCELLED" },
        });
        console.log(`[Stripe Webhook] Payment failed — PaymentIntent: ${paymentIntent.id}`);
        break;
      }

      default:
        // Ignore other events
        break;
    }
  } catch (err) {
    console.error("[Stripe Webhook] Error processing event:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
