import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, unauthorized, forbidden } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'

// GET /api/admin/leads/export – Export all leads as CSV
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'leads:export')) return forbidden()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined
    const customerType = searchParams.get('customerType') || undefined
    const search = searchParams.get('search') || undefined

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (customerType) where.customerType = customerType
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { company: { contains: search } },
      ]
    }

    const leads = await db.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    // Build CSV with Slovak headers and semicolon delimiter (Excel-friendly)
    const headers = [
      'Meno', 'Email', 'Telefon', 'Firma', 'Typ zakaznika',
      'Typ projektu', 'Stav', 'Priorita', 'Skore', 'Zdroj', 'Sprava',
      'Datum vytvorenia', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'UTM Content',
    ]
    const rows = leads.map((l) => [
      l.name,
      l.email,
      l.phone || '',
      l.company || '',
      l.customerType,
      l.projectType || '',
      l.status,
      l.priority,
      l.score ?? '',
      l.source,
      `"${(l.message || '').replace(/"/g, '""')}"`,
      l.createdAt.toISOString().split('T')[0],
      l.utmSource || '',
      l.utmMedium || '',
      l.utmCampaign || '',
      l.utmContent || '',
    ])

    const csv =
      '\uFEFF' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="linzmeier-leady-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('[LEADS EXPORT] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri exporte leadov' },
      { status: 500 }
    )
  }
}
