import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

const settingsArraySchema = z.object({
  settings: z
    .array(
      z.object({
        key: z.string().min(1, 'Kľúč je povinný'),
        value: z.string(),
      }),
    )
    .min(1, 'Zoznam nastavení nesmie byť prázdny'),
})

export async function GET() {
  try {
    const authResult = await requireAuth('settings:view')()
    if (!authResult || 'status' in authResult) return authResult

    const settings = await db.setting.findMany({
      select: { key: true, value: true, type: true },
      orderBy: { key: 'asc' },
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('[Settings API] GET Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri načítavaní nastavení' },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth('settings:users')()
    if (!authResult || 'status' in authResult) return authResult

    const body = await request.json()
    const parsed = settingsArraySchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors
      return NextResponse.json(
        { error: 'Neplatné údaje', details: errors },
        { status: 400 },
      )
    }

    const { settings: settingsToUpdate } = parsed.data

    await Promise.all(
      settingsToUpdate.map((setting) =>
        db.setting.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: { key: setting.key, value: setting.value },
        }),
      ),
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Settings API] PUT Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri ukladaní nastavení' },
      { status: 500 },
    )
  }
}
