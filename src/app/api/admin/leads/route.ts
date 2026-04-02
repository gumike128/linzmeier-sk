import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getAuthUser, unauthorized, forbidden } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'
import { sendEmail, getLeadConfirmationTemplate, getNewLeadNotificationTemplate } from '@/lib/email'
import { runAutomations } from '@/lib/automations'

const leadCreateSchema = z.object({
  customerType: z.enum(['architekt', 'firma', 'investor', 'other']),
  name: z.string().min(2, 'Meno musí mať aspoň 2 znaky').max(100),
  email: z.string().email('Neplatná e-mailová adresa'),
  phone: z.string().max(30).optional().or(z.literal('')),
  company: z.string().max(200).optional().or(z.literal('')),
  projectType: z.enum(['novostavba', 'rekonstrukcia', 'priemysel', 'other']).optional().or(z.literal('')),
  message: z.string().min(10, 'Správa musí mať aspoň 10 znakov').max(5000),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional().default('normal'),
  source: z.string().max(50).optional().default('manual'),
  assignedToId: z.string().optional().or(z.literal('')),
})

// GET /api/admin/leads – List leads with filtering, pagination, search
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'leads:view')) return forbidden()

    const { searchParams } = request.nextUrl
    const status = searchParams.get('status')
    const customerType = searchParams.get('customerType')
    const search = searchParams.get('search')
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20))
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Validate sort fields
    const allowedSortFields = ['createdAt', 'updatedAt', 'name', 'email', 'status', 'priority', 'customerType']
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt'
    const safeSortOrder = sortOrder === 'asc' ? 'asc' : 'desc'

    const where: Record<string, unknown> = {}

    if (status) where.status = status.toUpperCase()
    if (customerType) where.customerType = customerType
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { company: { contains: search } },
      ]
    }

    const [leads, total] = await Promise.all([
      db.lead.findMany({
        where,
        include: {
          assignedTo: {
            select: { id: true, name: true },
          },
        },
        orderBy: { [safeSortBy]: safeSortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.lead.count({ where }),
    ])

    return NextResponse.json({
      leads,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('[LEADS GET] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri načítaní leadov' },
      { status: 500 }
    )
  }
}

// POST /api/admin/leads – Create a new lead
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'leads:create')) return forbidden()

    const body = await request.json()
    const parsed = leadCreateSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors
      return NextResponse.json(
        { error: 'Chyba validácie', fields: errors },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Create lead
    const lead = await db.lead.create({
      data: {
        customerType: data.customerType,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        projectType: data.projectType || null,
        message: data.message,
        priority: data.priority,
        source: data.source,
        assignedToId: data.assignedToId || null,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true },
        },
      },
    })

    // Create activity log
    await db.activity.create({
      data: {
        type: 'lead_created',
        description: `Nový lead vytvorený: ${lead.name} (${lead.email})`,
        leadId: lead.id,
        userId: user.id,
      },
    })

    // Send confirmation email (non-blocking)
    sendEmail({
      to: lead.email,
      subject: 'Ďakujeme za vašu žiadosť – LINZMEIER Slovakia',
      html: getLeadConfirmationTemplate(lead.name),
    }).catch(() => {
      // Email sending failure should not affect lead creation
      console.warn('[LEADS POST] Failed to send confirmation email')
    })

    // Send internal notification email (non-blocking)
    sendEmail({
      to: 'info@linzmeier.sk',
      subject: `🔔 Nový lead: ${lead.name}`,
      html: getNewLeadNotificationTemplate(lead.name, lead.email),
    }).catch(() => {
      console.warn('[LEADS POST] Failed to send notification email')
    })

    // Run automations for lead_created event (non-blocking)
    runAutomations('lead_created', {
      leadId: lead.id,
      leadData: {
        customerType: lead.customerType,
        name: lead.name,
        email: lead.email,
      },
    }).catch((err) => {
      console.warn('[LEADS POST] Automations failed:', err)
    })

    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    console.error('[LEADS POST] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri vytváraní leadu' },
      { status: 500 }
    )
  }
}
