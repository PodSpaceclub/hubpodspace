import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;

  try {
    const products = await prisma.product.findMany({
      where: { partnerId: user.partnerId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("[products] GET error:", error);
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const user = session.user as any;
  if (!user.partnerId) {
    return NextResponse.json({ error: "Conta de parceiro não encontrada. Faça login novamente." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { name, description, price, image, stock, active } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nome do produto é obrigatório" }, { status: 400 });
    }

    const parsedPrice = parseFloat(price);
    if (!parsedPrice || parsedPrice <= 0) {
      return NextResponse.json({ error: "Preço deve ser maior que zero" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        partnerId: user.partnerId,
        name: name.trim(),
        description: description || null,
        price: parsedPrice,
        image: image || null,
        stock: stock ? parseInt(stock) : null,
        active: active ?? true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("[products] POST error:", error);
    return NextResponse.json(
      { error: "Erro ao criar produto. Tente novamente." },
      { status: 500 }
    );
  }
}
