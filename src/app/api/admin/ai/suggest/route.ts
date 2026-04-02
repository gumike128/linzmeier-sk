import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'
import { suggestReply } from '@/lib/ai'

const suggestSchema = z.object({
  leadId: z.string().min(1, 'ID leadu je povinné'),
})

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth('ai:suggest')()
    if (!authResult || 'status' in authResult) return authResult

    const body = await request.json()
    const parsed = suggestSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors
      return NextResponse.json(
        { error: 'Neplatné údaje', details: errors },
        { status: 400 },
      )
    }

    const { leadId } = parsed.data

    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: {
        notes: {
          select: { content: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead nebol nájdený' },
        { status: 404 },
      )
    }

    const suggestion = await suggestReply({
      name: lead.name,
      customerType: lead.customerType,
      projectType: lead.projectType,
      message: lead.message,
      notes: lead.notes.map((n) => n.content),
    })

    return NextResponse.json({ suggestion })
  } catch (error) {
    console.error('[AI Suggest API] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri generovaní návrhu odpovede' },
      { status: 500 },
    )
  }
}
