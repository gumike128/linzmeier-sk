import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getAuthUser, unauthorized, forbidden } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'

const automationUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(500).nullable().optional(),
  trigger: z.enum(['lead_created', 'status_change']).optional(),
  conditions: z
    .object({
      fromStatus: z.string().optional(),
      toStatus: z.string().optional(),
      customerType: z.string().optional(),
    })
    .optional(),
  actions: z
    .array(
      z.object({
        type: z.enum(['email', 'assign', 'notify']),
        template: z.string().optional(),
        strategy: z.string().optional(),
        assignTo: z.string().optional(),
      }),
    )
    .min(1)
    .optional(),
  isActive: z.boolean().optional(),
})

// PUT /api/admin/automations/[id] – Update automation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'settings:users')) return forbidden()

    const { id } = await params

    const existing = await db.automation.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Automatizácia nebola nájdená' },
        { status: 404 },
      )
    }

    const body = await request.json()
    const parsed = automationUpdateSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors
      return NextResponse.json(
        { error: 'Chyba validácie', fields: errors },
        { status: 400 },
      )
    }

    const data = parsed.data

    // Check for duplicate name if name is being changed
    if (data.name && data.name !== existing.name) {
      const duplicate = await db.automation.findUnique({
        where: { name: data.name },
      })
      if (duplicate) {
        return NextResponse.json(
          { error: 'Automatizácia s týmto názvom už existuje' },
          { status: 409 },
        )
      }
    }

    const updatedAutomation = await db.automation.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.trigger !== undefined && { trigger: data.trigger }),
        ...(data.conditions !== undefined && {
          conditions: JSON.stringify(data.conditions),
        }),
        ...(data.actions !== undefined && {
          actions: JSON.stringify(data.actions),
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })

    return NextResponse.json(updatedAutomation)
  } catch (error) {
    console.error('[AUTOMATIONS PUT] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri aktualizácii automatizácie' },
      { status: 500 },
    )
  }
}

// DELETE /api/admin/automations/[id] – Delete automation
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'settings:users')) return forbidden()

    const { id } = await params

    const existing = await db.automation.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Automatizácia nebola nájdená' },
        { status: 404 },
      )
    }

    await db.automation.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[AUTOMATIONS DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri odstraňovaní automatizácie' },
      { status: 500 },
    )
  }
}
