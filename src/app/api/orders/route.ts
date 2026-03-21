import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { calculateCommission, createPaymentIntent } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as { role: string; partnerId?: string };
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};

  if (user.role === "PARTNER") {
    where.partnerId = user.partnerId;
  }

  if (status) {
    where.status = status;
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: { include: { product: true } },
      partner: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { partnerId, customerName, customerEmail, customerPhone, items, sourceCode, notes } = body;

    if (!partnerId || !customerName || !customerEmail || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Calculate total from database prices (never trust client prices)
    let total = 0;
    const itemsWithPrices = [];
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 });
      }
      total += product.price * item.quantity;
      itemsWithPrices.push({ ...item, price: product.price });
    }

    const { commission, partnerAmount } = calculateCommission(total);

    // Create real Stripe PaymentIntent
    const paymentIntent = await createPaymentIntent(total, {
      partnerId,
      customerEmail,
    });

    // Update tracking code if provided
    if (sourceCode) {
      await prisma.trackingCode.updateMany({
        where: { code: sourceCode },
        data: { orders: { increment: 1 } },
      });
    }

    const order = await prisma.order.create({
      data: {
        partnerId,
        customerName,
        customerEmail,
        customerPhone,
        total,
        commission,
        partnerAmount,
        status: "PENDING",
        stripeId: paymentIntent.id,
        sourceCode,
        notes,
        items: {
          create: itemsWithPrices.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        partner: true,
      },
    });

    return NextResponse.json(
      { ...order, clientSecret: paymentIntent.client_secret },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order error:", error);
    return NextResponse.json({ error: "Erro ao criar pedido" }, { status: 500 });
  }
}
