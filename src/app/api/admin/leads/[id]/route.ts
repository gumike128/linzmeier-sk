import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getAuthUser, unauthorized, forbidden } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'
import { LeadStatus, LeadPriority } from '@/types'
import { runAutomations } from '@/lib/automations'

const leadUpdateSchema = z.object({
  status: z.nativeEnum(
    { NEW: 'NEW', CONTACTED: 'CONTACTED', QUALIFIED: 'QUALIFIED', PROPOSAL: 'PROPOSAL', NEGOTIATION: 'NEGOTIATION', WON: 'WON', LOST: 'LOST' } as unknown as { [K in LeadStatus]: LeadStatus }
  ).optional(),
  priority: z.nativeEnum(
    { low: 'low', normal: 'normal', high: 'high', urgent: 'urgent' } as unknown as { [K in LeadPriority]: LeadPriority }
  ).optional(),
  assignedToId: z.string().nullable().optional(),
  customerType: z.enum(['architekt', 'firma', 'investor', 'other']).optional(),
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(30).nullable().optional(),
  company: z.string().max(200).nullable().optional(),
  projectType: z.enum(['novostavba', 'rekonstrukcia', 'priemysel', 'other']).nullable().optional(),
  message: z.string().min(10).max(5000).optional(),
  reminderAt: z.string().nullable().optional(),
})

// GET /api/admin/leads/[id] – Get single lead with notes and activities
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'leads:view')) return forbidden()

    const { id } = await params

    const lead = await db.lead.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        notes: {
          include: {
            author: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        activities: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead nebol nájdený' },
        { status: 404 }
      )
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error('[LEAD GET] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri načítaní leadu' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/leads/[id] – Update lead
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'leads:edit')) return forbidden()

    const { id } = await params

    // Check if lead exists
    const existingLead = await db.lead.findUnique({ where: { id } })
    if (!existingLead) {
      return NextResponse.json(
        { error: 'Lead nebol nájdený' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const parsed = leadUpdateSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors
      return NextResponse.json(
        { error: 'Chyba validácie', fields: errors },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Update lead
    const updatedLead = await db.lead.update({
      where: { id },
      data: {
        ...(data.status !== undefined && { status: data.status }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.assignedToId !== undefined && { assignedToId: data.assignedToId }),
        ...(data.customerType !== undefined && { customerType: data.customerType }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.company !== undefined && { company: data.company }),
        ...(data.projectType !== undefined && { projectType: data.projectType }),
        ...(data.message !== undefined && { message: data.message }),
        ...(data.reminderAt !== undefined && { reminderAt: data.reminderAt ? new Date(data.reminderAt) : null }),
      },
      include: {
        assignedTo: {
          select: { id: true, name: true },
        },
      },
    })

    // Log activity if reminder changed
    if (data.reminderAt !== undefined && data.reminderAt !== (existingLead.reminderAt?.toISOString() ?? null)) {
      if (data.reminderAt) {
        const reminderDate = new Date(data.reminderAt)
        await db.activity.create({
          data: {
            type: 'reminder_set',
            description: `Pripomienka nastavená na ${reminderDate.toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
            leadId: id,
            userId: user.id,
          },
        })
      } else {
        await db.activity.create({
          data: {
            type: 'reminder_cleared',
            description: 'Pripomienka zrušená',
            leadId: id,
            userId: user.id,
          },
        })
      }
    }

    // Log activity if status changed
    if (data.status && data.status !== existingLead.status) {
      await db.activity.create({
        data: {
          type: 'status_changed',
          description: `Stav leadu zmenený z "${existingLead.status}" na "${data.status}"`,
          leadId: id,
          userId: user.id,
        },
      })

      // Run automations for status_change event (non-blocking)
      runAutomations('status_change', {
        leadId: id,
        fromStatus: existingLead.status,
        toStatus: data.status,
      }).catch((err) => {
        console.warn('[LEAD PUT] Automations failed:', err)
      })
    }

    // Log activity if assignment changed
    if (data.assignedToId !== undefined && data.assignedToId !== existingLead.assignedToId) {
      const assignedUser = data.assignedToId
        ? await db.user.findUnique({ where: { id: data.assignedToId }, select: { name: true } })
        : null
      const assignedName = assignedUser?.name || 'Nepriradený'
      await db.activity.create({
        data: {
          type: 'lead_assigned',
          description: `Lead priradený používateľovi: ${assignedName}`,
          leadId: id,
          userId: user.id,
        },
      })
    }

    return NextResponse.json(updatedLead)
  } catch (error) {
    console.error('[LEAD PUT] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri aktualizácii leadu' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/leads/[id] – Archive lead (set status to LOST + activity)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'leads:delete')) return forbidden()

    const { id } = await params

    // Check if lead exists
    const existingLead = await db.lead.findUnique({ where: { id } })
    if (!existingLead) {
      return NextResponse.json(
        { error: 'Lead nebol nájdený' },
        { status: 404 }
      )
    }

    // Archive lead by setting status to LOST
    const archivedLead = await db.lead.update({
      where: { id },
      data: { status: 'LOST' },
    })

    // Create activity log
    await db.activity.create({
      data: {
        type: 'lead_archived',
        description: `Lead "${existingLead.name}" bol archivovaný (stávajúci stav: ${existingLead.status})`,
        leadId: id,
        userId: user.id,
      },
    })

    return NextResponse.json({ success: true, lead: archivedLead })
  } catch (error) {
    console.error('[LEAD DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri archivácii leadu' },
      { status: 500 }
    )
  }
}
