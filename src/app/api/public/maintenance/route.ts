import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Public endpoint – no auth required.
 * Returns whether maintenance mode is active.
 * Reads directly from DB every time for maximum reliability.
 */
export async function GET() {
  try {
    const setting = await db.setting.findUnique({
      where: { key: 'maintenance_mode' },
      select: { value: true },
    })
    return NextResponse.json({ maintenance: setting?.value === 'true' })
  } catch {
    return NextResponse.json({ maintenance: false })
  }
}
