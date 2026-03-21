import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    totalPartners,
    pendingApprovals,
    salesAgg,
    commissionAgg,
    recentOrders,
    recentPartners,
  ] = await Promise.all([
    prisma.partner.count({ where: { status: "APPROVED" } }),
    prisma.partner.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "PROCESSING", "DELIVERED"] } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "PROCESSING", "DELIVERED"] } },
      _sum: { commission: true },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        partner: { select: { name: true } },
      },
    }),
    prisma.partner.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true } } },
    }),
  ]);

  return NextResponse.json({
    totalPartners,
    pendingApprovals,
    totalSales: salesAgg._sum.total || 0,
    commissionEarned: commissionAgg._sum.commission || 0,
    recentOrders,
    recentPartners,
  });
}
