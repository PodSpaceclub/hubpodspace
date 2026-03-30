export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { StorePageClient } from "./StorePageClient";

interface Props {
  params: { slug: string };
}

export default async function StorePage({ params }: Props) {
  const partner = await prisma.partner.findUnique({
    where: { slug: params.slug, status: "APPROVED" },
    include: {
      products: {
        where: { active: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!partner) notFound();

  return <StorePageClient partner={partner as any} />;
}

export async function generateMetadata({ params }: Props) {
  const partner = await prisma.partner.findUnique({
    where: { slug: params.slug },
  });
  return {
    title: partner ? `${partner.name} - PodSpace Club` : "Loja - PodSpace Club",
    description: partner?.description,
  };
}
