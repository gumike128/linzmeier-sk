import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getAuthUser, unauthorized } from '@/lib/api-auth'

const checkAccessSchema = z.object({
  slugs: z
    .array(z.string().min(1))
    .min(1, 'Zoznam slugov nesmie byť prázdny')
    .max(50, 'Maximálne 50 slugov naraz'),
})

// POST /api/admin/modules/check – Check if current user has access to specific module slugs
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()

    const body = await request.json()
    const parsed = checkAccessSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors
      return NextResponse.json(
        { error: 'Chyba validácie', fields: errors },
        { status: 400 },
      )
    }

    const { slugs } = parsed.data

    // Fetch all ClientModule records for this user matching the requested slugs
    const clientModules = await db.clientModule.findMany({
      where: {
        clientId: user.id,
        status: { in: ['active', 'trial'] },
        module: {
          slug: { in: slugs },
        },
      },
      include: {
        module: {
          select: { slug: true },
        },
      },
    })

    // Also fetch free modules that are visible (always accessible)
    const freeModules = await db.module.findMany({
      where: {
        slug: { in: slugs },
        isFree: true,
        isVisible: true,
      },
      select: { slug: true },
    })

    // Build access map: slug -> boolean
    const access: Record<string, boolean> = {}

    for (const slug of slugs) {
      // Check if user has an active/trial ClientModule for this slug
      const hasClientModule = clientModules.some(
        (cm) => cm.module?.slug === slug,
      )
      // Check if module is free (always accessible)
      const isFreeModule = freeModules.some((m) => m.slug === slug)

      access[slug] = hasClientModule || isFreeModule
    }

    return NextResponse.json({ access })
  } catch (error) {
    console.error('[MODULES CHECK POST] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri kontrole prístupu k modulom' },
      { status: 500 },
    )
  }
}
