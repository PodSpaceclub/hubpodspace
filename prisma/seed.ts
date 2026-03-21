import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean up
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.user.deleteMany();
  await prisma.trackingCode.deleteMany();
  await prisma.settings.deleteMany();

  // Admin settings
  await prisma.settings.create({
    data: { key: "commission", value: "0.10" },
  });

  // Admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.create({
    data: {
      email: "admin@podspace.club",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin created: admin@podspace.club / admin123");

  // Partner 1 - Café do Podcaster
  const partner1Password = await bcrypt.hash("partner123", 12);
  const partner1User = await prisma.user.create({
    data: {
      email: "cafe@podspace.club",
      password: partner1Password,
      role: "PARTNER",
    },
  });

  const partner1 = await prisma.partner.create({
    data: {
      userId: partner1User.id,
      name: "Café do Podcaster",
      slug: "cafe-do-podcaster",
      description:
        "Os melhores cafés especiais para manter você desperto durante longas gravações. Grãos selecionados, torra artesanal.",
      logo: "https://picsum.photos/seed/cafe-logo/100/100",
      banner: "https://picsum.photos/seed/cafe-banner/800/300",
      whatsapp: "+5511999990001",
      phone: "+5511333330001",
      category: "Alimentação",
      status: "APPROVED",
    },
  });

  await prisma.product.createMany({
    data: [
      {
        partnerId: partner1.id,
        name: "Kit Café do Podcaster",
        description: "250g de café especial + caneca exclusiva PodSpace. Blend especialmente desenvolvido para podcasters.",
        price: 79.9,
        image: "https://picsum.photos/seed/coffee1/400/300",
        stock: 50,
        active: true,
      },
      {
        partnerId: partner1.id,
        name: "Café Filtrado Premium 500g",
        description: "Grão arábica 100%, torra média. Notas de caramelo e frutas vermelhas.",
        price: 45.0,
        image: "https://picsum.photos/seed/coffee2/400/300",
        stock: 100,
        active: true,
      },
      {
        partnerId: partner1.id,
        name: "Assinatura Mensal - Café",
        description: "Receba 500g de café especial todo mês. Cancele quando quiser.",
        price: 89.9,
        image: "https://picsum.photos/seed/coffee3/400/300",
        active: true,
      },
      {
        partnerId: partner1.id,
        name: "Chemex + Filtros",
        description: "Chemex 6 xícaras + 100 filtros originais. O método favorito dos podcasters.",
        price: 189.0,
        image: "https://picsum.photos/seed/chemex/400/300",
        stock: 15,
        active: true,
      },
    ],
  });
  console.log("✅ Partner 1 created: Café do Podcaster");

  // Partner 2 - Tech Podcast Store
  const partner2Password = await bcrypt.hash("partner123", 12);
  const partner2User = await prisma.user.create({
    data: {
      email: "tech@podspace.club",
      password: partner2Password,
      role: "PARTNER",
    },
  });

  const partner2 = await prisma.partner.create({
    data: {
      userId: partner2User.id,
      name: "Tech Podcast Store",
      slug: "tech-podcast-store",
      description:
        "Equipamentos e acessórios para elevar a qualidade do seu podcast. Microfones, interfaces e cabos premium.",
      logo: "https://picsum.photos/seed/tech-logo/100/100",
      banner: "https://picsum.photos/seed/tech-banner/800/300",
      whatsapp: "+5511999990002",
      category: "Tecnologia",
      status: "APPROVED",
    },
  });

  await prisma.product.createMany({
    data: [
      {
        partnerId: partner2.id,
        name: "Microfone USB PodPro X1",
        description: "Microfone condensador USB profissional. Padrão cardioide, frequência 20Hz-20kHz.",
        price: 349.9,
        image: "https://picsum.photos/seed/mic1/400/300",
        stock: 20,
        active: true,
      },
      {
        partnerId: partner2.id,
        name: "Pop Filter Premium",
        description: "Filtro de dupla camada para eliminar sons plosivos. Braço flexível 360°.",
        price: 49.9,
        image: "https://picsum.photos/seed/popfilter/400/300",
        stock: 80,
        active: true,
      },
      {
        partnerId: partner2.id,
        name: "Suporte de Mesa Articulado",
        description: "Suporte de mesa profissional com ajuste de altura e ângulo. Capacidade 2kg.",
        price: 129.0,
        image: "https://picsum.photos/seed/stand/400/300",
        stock: 30,
        active: true,
      },
      {
        partnerId: partner2.id,
        name: "Interface de Áudio 2x2",
        description: "Interface USB com 2 entradas e 2 saídas. 24bit/192kHz. Phantom power.",
        price: 599.0,
        image: "https://picsum.photos/seed/interface/400/300",
        stock: 10,
        active: true,
      },
    ],
  });
  console.log("✅ Partner 2 created: Tech Podcast Store");

  // Partner 3 - Studio Snacks
  const partner3Password = await bcrypt.hash("partner123", 12);
  const partner3User = await prisma.user.create({
    data: {
      email: "snacks@podspace.club",
      password: partner3Password,
      role: "PARTNER",
    },
  });

  const partner3 = await prisma.partner.create({
    data: {
      userId: partner3User.id,
      name: "Studio Snacks",
      slug: "studio-snacks",
      description:
        "Snacks saudáveis e deliciosos para manter a energia durante as gravações. Entrega no estúdio.",
      logo: "https://picsum.photos/seed/snack-logo/100/100",
      whatsapp: "+5511999990003",
      category: "Alimentação",
      status: "APPROVED",
    },
  });

  const snackProducts = await prisma.product.createMany({
    data: [
      {
        partnerId: partner3.id,
        name: "Mix de Castanhas Premium",
        description: "Mix com castanha do pará, amêndoas, nozes e macadâmia. 200g.",
        price: 34.9,
        image: "https://picsum.photos/seed/nuts/400/300",
        stock: 200,
        active: true,
      },
      {
        partnerId: partner3.id,
        name: "Kit Energético do Estúdio",
        description: "Barras proteicas, mix de frutas secas e chocolate 70%. 5 itens.",
        price: 59.9,
        image: "https://picsum.photos/seed/snackkit/400/300",
        stock: 50,
        active: true,
      },
      {
        partnerId: partner3.id,
        name: "Água Sabor Fruta - 6 unidades",
        description: "Água mineral com sabor natural de frutas. Sem açúcar. Sabores variados.",
        price: 24.9,
        image: "https://picsum.photos/seed/water/400/300",
        stock: 150,
        active: true,
      },
    ],
  });
  console.log("✅ Partner 3 created: Studio Snacks");

  // Pending partner
  const partner4Password = await bcrypt.hash("partner123", 12);
  const partner4User = await prisma.user.create({
    data: {
      email: "novo@podspace.club",
      password: partner4Password,
      role: "PARTNER",
    },
  });

  await prisma.partner.create({
    data: {
      userId: partner4User.id,
      name: "PodMerch Store",
      slug: "podmerch-store",
      description: "Camisetas, bonés e merchandise exclusivo para podcasters.",
      whatsapp: "+5511999990004",
      category: "Moda",
      status: "PENDING",
    },
  });
  console.log("✅ Partner 4 (pending) created: PodMerch Store");

  // Get created products for orders
  const partner1Products = await prisma.product.findMany({
    where: { partnerId: partner1.id },
  });
  const partner2Products = await prisma.product.findMany({
    where: { partnerId: partner2.id },
  });

  // Sample orders
  const COMMISSION_RATE = 0.1;

  const createOrder = async (
    partnerId: string,
    customerName: string,
    customerEmail: string,
    orderItems: Array<{ productId: string; quantity: number; price: number }>,
    status: string,
    createdAt?: Date
  ) => {
    const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const commission = total * COMMISSION_RATE;
    const partnerAmount = total - commission;

    return prisma.order.create({
      data: {
        partnerId,
        customerName,
        customerEmail,
        total,
        commission,
        partnerAmount,
        status: status as any,
        items: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        createdAt: createdAt || new Date(),
      },
    });
  };

  await createOrder(
    partner1.id,
    "João Silva",
    "joao@email.com",
    [
      { productId: partner1Products[0].id, quantity: 1, price: partner1Products[0].price },
      { productId: partner1Products[1].id, quantity: 2, price: partner1Products[1].price },
    ],
    "DELIVERED",
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );

  await createOrder(
    partner2.id,
    "Maria Santos",
    "maria@email.com",
    [
      { productId: partner2Products[0].id, quantity: 1, price: partner2Products[0].price },
    ],
    "PROCESSING",
    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  );

  await createOrder(
    partner1.id,
    "Pedro Costa",
    "pedro@email.com",
    [
      { productId: partner1Products[2].id, quantity: 1, price: partner1Products[2].price },
    ],
    "PAID",
    new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  );

  await createOrder(
    partner2.id,
    "Ana Ferreira",
    "ana@email.com",
    [
      { productId: partner2Products[1].id, quantity: 2, price: partner2Products[1].price },
      { productId: partner2Products[2].id, quantity: 1, price: partner2Products[2].price },
    ],
    "PENDING",
    new Date()
  );

  await createOrder(
    partner1.id,
    "Carlos Lima",
    "carlos@email.com",
    [
      { productId: partner1Products[3].id, quantity: 1, price: partner1Products[3].price },
    ],
    "DELIVERED",
    new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  );

  console.log("✅ 5 sample orders created");

  // Tracking codes
  await prisma.trackingCode.createMany({
    data: [
      {
        code: "PS-STUDIO-A",
        label: "Estúdio A - PodSpace Rio",
        description: "QR Code para os clientes do Estúdio A",
        orders: 12,
      },
      {
        code: "PS-STUDIO-B",
        label: "Estúdio B - PodSpace SP",
        description: "QR Code para os clientes do Estúdio B",
        orders: 8,
      },
    ],
  });
  console.log("✅ 2 tracking codes created");

  console.log("\n🎉 Seed complete!");
  console.log("\n📋 Credentials:");
  console.log("Admin:    admin@podspace.club / admin123");
  console.log("Partner1: cafe@podspace.club / partner123");
  console.log("Partner2: tech@podspace.club / partner123");
  console.log("Partner3: snacks@podspace.club / partner123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
