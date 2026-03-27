import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    // Block if admin already exists
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount > 0) {
      return NextResponse.json(
        { error: "Setup já foi concluído." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "A senha deve ter no mínimo 8 caracteres." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
