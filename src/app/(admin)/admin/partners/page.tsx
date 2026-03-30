export const dynamic = 'force-dynamic'

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { PartnerTableClient } from "./PartnerTableClient";

async function getPartners() {
  return prisma.partner.findMany({
    include: {
      user: { select: { email: true } },
      _count: { select: { products: true, orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminPartnersPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") redirect("/login");

  const partners = await getPartners();

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar role="ADMIN" />
      <div className="flex-1 lg:ml-64">
        <Header title="Parceiros" />
        <main className="p-6 pb-24 lg:pb-6 space-y-6">
          <div>
            <h2 className="font-display text-2xl font-700 text-[#1A1A1A] uppercase">
              Gerenciar Parceiros
            </h2>
            <p className="text-sm text-[#666666]">
              {partners.length} parceiro(s) cadastrado(s) •{" "}
              {partners.filter((p) => p.status === "PENDING").length} pendente(s)
            </p>
          </div>
          <PartnerTableClient partners={partners as any} />
        </main>
      </div>
      <MobileNav role="ADMIN" />
    </div>
  );
}
