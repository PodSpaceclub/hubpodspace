import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    const userCount = await prisma.user.count()
    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      users: userCount,
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
