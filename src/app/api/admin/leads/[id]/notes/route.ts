import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getAuthUser, unauthorized, forbidden } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'

const noteCreateSchema = z.object({
  content: z.string().min(1, 'Poznámka nemôže byť prázdna').max(5000, 'Poznámka je príliš dlhá (max 5000 znakov)'),
})

// POST /api/admin/leads/[id]/notes – Add note to lead
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'leads:edit')) return forbidden()

    const { id } = await params

    // Check if lead exists
    const lead = await db.lead.findUnique({ where: { id } })
    if (!lead) {
      return NextResponse.json(
        { error: 'Lead nebol nájdený' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const parsed = noteCreateSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors
      return NextResponse.json(
        { error: 'Chyba validácie', fields: errors },
        { status: 400 }
      )
    }

    const { content } = parsed.data

    // Create note
    const note = await db.note.create({
      data: {
        content,
        leadId: id,
        authorId: user.id,
      },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    })

    // Create activity log
    await db.activity.create({
      data: {
        type: 'note_added',
        description: `Pridaná poznámka k leadu "${lead.name}"`,
        leadId: id,
        userId: user.id,
      },
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error('[NOTES POST] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri pridávaní poznámky' },
      { status: 500 }
    )
  }
}
