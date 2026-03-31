import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const user = session.user as any;

  try {
    const body = await req.json();

    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product || product.partnerId !== user.partnerId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description,
        price: body.price ? parseFloat(body.price) : undefined,
        image: body.image !== undefined ? (body.image || null) : undefined,
        stock: body.stock !== undefined ? body.stock : undefined,
        active: body.active !== undefined ? body.active : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[products/id] PATCH error:", error);
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const user = session.user as any;

  try {
    const product = await prisma.product.findUnique({ where: { id: params.id } });

    if (!product || product.partnerId !== user.partnerId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[products/id] DELETE error:", error);
    return NextResponse.json({ error: "Erro ao excluir produto" }, { status: 500 });
  }
}
