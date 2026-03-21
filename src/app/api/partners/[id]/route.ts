import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;
  const body = await req.json();

  // Admin can update status
  if (user.role === "ADMIN") {
    const partner = await prisma.partner.update({
      where: { id: params.id },
      data: { status: body.status },
    });
    return NextResponse.json(partner);
  }

  // Partner can update their own profile
  if (user.role === "PARTNER" && user.partnerId === params.id) {
    const { name, description, logo, banner, whatsapp, phone, category } = body;
    const partner = await prisma.partner.update({
      where: { id: params.id },
      data: { name, description, logo, banner, whatsapp, phone, category },
    });
    return NextResponse.json(partner);
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const partner = await prisma.partner.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { email: true } },
      products: { where: { active: true } },
      _count: { select: { products: true, orders: true } },
    },
  });

  if (!partner) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(partner);
}
