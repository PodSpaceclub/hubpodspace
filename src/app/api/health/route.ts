import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await prisma.$queryRaw`SELECT 1`
    const userCount = await prisma.user.count()
    const partnerCount = await prisma.partner.count()
    const productCount = await prisma.product.count()

    // If session exists, show partner debug info
    const session = await getServerSession(authOptions)
    const sessionUser = session?.user as any

    let partnerDebug = null
    if (sessionUser?.partnerId) {
      const partner = await prisma.partner.findUnique({
        where: { id: sessionUser.partnerId },
        select: { id: true, name: true, status: true },
      }).catch(() => null)
      partnerDebug = {
        sessionPartnerId: sessionUser.partnerId,
        partnerFoundInDB: !!partner,
        partnerStatus: partner?.status ?? null,
      }
    }

    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      users: userCount,
      partners: partnerCount,
      products: productCount,
      session: sessionUser ? {
        email: sessionUser.email,
        role: sessionUser.role,
        hasPartnerId: !!sessionUser.partnerId,
        partnerDebug,
      } : null,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[health] DB error:', error)
    return NextResponse.json(
      {
        status: 'error',
        db: 'failed',
        error: String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
