import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'
import { generateContent } from '@/lib/ai'

const generateSchema = z.object({
  type: z.enum(['blog', 'product', 'seo', 'faq'], {
    errorMap: () => ({ message: 'Neplatný typ obsahu' }),
  }),
  topic: z
    .string()
    .min(1, 'Téma je povinná')
    .max(500, 'Téma nesmie presiahnuť 500 znakov'),
  tone: z.string().max(100).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth('ai:generate')()
    if (!authResult || 'status' in authResult) return authResult

    const body = await request.json()
    const parsed = generateSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors
      return NextResponse.json(
        { error: 'Neplatné údaje', details: errors },
        { status: 400 },
      )
    }

    const { type, topic, tone } = parsed.data
    const startTime = Date.now()

    const content = await generateContent(type, topic, tone)
    const durationMs = Date.now() - startTime

    await db.aIInteraction.create({
      data: {
        type: `generate_${type}`,
        input: topic,
        output: content,
        model: 'z-ai-chat',
        userId: authResult.id,
        durationMs,
        metadata: JSON.stringify({ type, tone: tone ?? 'profesionálny' }),
      },
    })

    return NextResponse.json({ content })
  } catch (error) {
    console.error('[AI Generate API] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri generovaní obsahu' },
      { status: 500 },
    )
  }
}
