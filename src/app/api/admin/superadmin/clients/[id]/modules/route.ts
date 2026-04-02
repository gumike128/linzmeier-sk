import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

const toggleModuleSchema = z.object({
  moduleId: z.string().min(1, 'ID modulu je povinné'),
  status: z.enum(['active', 'trial', 'inactive'], {
    errorMap: () => ({ message: 'Neplatný stav. Povolené: active, trial, inactive' }),
  }),
  expiresAt: z.string().optional(),
  note: z.string().max(500, 'Poznámka nesmie presiahnuť 500 znakov').optional(),
})

// GET /api/admin/superadmin/clients/[id]/modules – Get module activations for a client
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await requireAuth('superadmin:modules')()
    if (!authResult || 'status' in authResult) return authResult

    const { id } = await params

    // Verify client exists
    const client = await db.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    })

    if (!client || client.role === 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Klient nebol nájdený' },
        { status: 404 },
      )
    }

    // Get all modules with client's activation status
    const modules = await db.module.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        clientModules: {
          where: { clientId: id },
        },
      },
    })

    const modulesWithActivation = modules.map((mod) => ({
      id: mod.id,
      slug: mod.slug,
      name: mod.name,
      description: mod.description,
      category: mod.category,
      icon: mod.icon,
      price: mod.price,
      priceLabel: mod.priceLabel,
      isFree: mod.isFree,
      trialDays: mod.trialDays,
      _clientModule: mod.clientModules[0] ?? null,
    }))

    return NextResponse.json({
      client: { id: client.id, name: client.name, email: client.email, role: client.role },
      modules: modulesWithActivation,
    })
  } catch (error) {
    console.error('[SUPERADMIN CLIENT MODULES GET] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri načítaní modulov klienta' },
      { status: 500 },
    )
  }
}

// PUT /api/admin/superadmin/clients/[id]/modules – Toggle module activation for a client
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await requireAuth('superadmin:modules')()
    if (!authResult || 'status' in authResult) return authResult

    const superadmin = authResult
    const { id: clientId } = await params

    // Verify client exists
    const client = await db.user.findUnique({
      where: { id: clientId },
      select: { id: true, name: true },
    })

    if (!client || client.role === 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Klient nebol nájdený' },
        { status: 404 },
      )
    }

    const body = await request.json()
    const parsed = toggleModuleSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors
      return NextResponse.json(
        { error: 'Chyba validácie', fields: errors },
        { status: 400 },
      )
    }

    const { moduleId, status, expiresAt, note } = parsed.data

    // Verify module exists
    const moduleRecord = await db.module.findUnique({
      where: { id: moduleId },
      select: { id: true, name: true },
    })

    if (!moduleRecord) {
      return NextResponse.json(
        { error: 'Modul nebol nájdený' },
        { status: 404 },
      )
    }

    // Upsert ClientModule record
    const clientModule = await db.clientModule.upsert({
      where: {
        clientId_moduleId: { clientId, moduleId },
      },
      update: {
        status,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        note: note ?? null,
        activatedBy: superadmin.id,
      },
      create: {
        clientId,
        moduleId,
        status,
        activatedAt: new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        note: note ?? null,
        activatedBy: superadmin.id,
      },
      include: {
        module: {
          select: { id: true, name: true, slug: true },
        },
      },
    })

    // Create audit log entry
    await db.auditLog.create({
      data: {
        userId: superadmin.id,
        action: 'module_activation_changed',
        entityType: 'client_module',
        entityId: clientModule.id,
        details: JSON.stringify({
          clientId,
          clientName: client.name,
          moduleId,
          moduleName: moduleRecord.name,
          status,
          expiresAt: expiresAt ?? null,
          note: note ?? null,
        }),
      },
    })

    return NextResponse.json(clientModule)
  } catch (error) {
    console.error('[SUPERADMIN CLIENT MODULES PUT] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri zmene aktivity modulu' },
      { status: 500 },
    )
  }
}
