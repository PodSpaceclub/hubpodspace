import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  // Allow unauthenticated clients to mark an order as PAID after Stripe confirms.
  // This is called from the checkout page after stripe.confirmPayment() succeeds.
  if (body.status === "PAID") {
    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Only allow transitioning from PENDING → PAID
    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "Order already processed" },
        { status: 409 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: { status: "PAID" },
    });
    return NextResponse.json(updated);
  }

  // All other status changes require authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (user.role === "PARTNER" && order.partnerId !== user.partnerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.order.update({
    where: { id: params.id },
    data: { status: body.status },
  });

  return NextResponse.json(updated);
}
