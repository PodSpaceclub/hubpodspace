import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    return NextResponse.json({ setupDone: adminCount > 0 });
  } catch {
    return NextResponse.json({ setupDone: false });
  }
}
