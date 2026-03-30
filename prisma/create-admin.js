const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: 'podspaceclub@gmail.com' }
  })

  if (existing) {
    console.log('✓ Admin já existe — nada a fazer')
    return
  }

  const hashedPassword = await bcrypt.hash('PodSpace@2026', 12)

  await prisma.user.create({
    data: {
      email: 'podspaceclub@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
    }
  })

  console.log('✓ Admin criado: podspaceclub@gmail.com')
}

main()
  .catch(e => { console.error('Erro ao criar admin:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
