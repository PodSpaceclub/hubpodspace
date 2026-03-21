import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;
  const products = await prisma.product.findMany({
    where: { partnerId: user.partnerId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;
  if (!user.partnerId) {
    return NextResponse.json({ error: "No partner" }, { status: 400 });
  }

  const body = await req.json();
  const { name, description, price, image, stock, active } = body;

  if (!name || !price) {
    return NextResponse.json({ error: "Name and price required" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      partnerId: user.partnerId,
      name,
      description,
      price: parseFloat(price),
      image,
      stock: stock ? parseInt(stock) : null,
      active: active ?? true,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
