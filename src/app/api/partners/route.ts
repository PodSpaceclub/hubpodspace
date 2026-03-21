import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { slugify } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const partners = await prisma.partner.findMany({
    include: {
      user: { select: { email: true, createdAt: true } },
      _count: { select: { products: true, orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(partners);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, whatsapp, phone, description, category } = body;

    if (!email || !password || !name || !whatsapp) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    // Check if email exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const slug = slugify(name);

    // Check slug uniqueness
    let finalSlug = slug;
    let counter = 1;
    while (await prisma.partner.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter++}`;
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "PARTNER",
        partner: {
          create: {
            name,
            slug: finalSlug,
            whatsapp,
            phone,
            description,
            category,
            status: "PENDING",
          },
        },
      },
      include: { partner: true },
    });

    return NextResponse.json(
      { message: "Cadastro realizado com sucesso! Aguarde aprovação.", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
