import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'
import { hashPassword } from '@/lib/auth'
import { UserRole } from '@/types'

const createUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Meno musí mať aspoň 2 znaky')
    .max(100, 'Meno nesmie presiahnuť 100 znakov'),
  email: z.string().email('Neplatná e-mailová adresa'),
  password: z
    .string()
    .min(6, 'Heslo musí mať aspoň 6 znakov')
    .max(100, 'Heslo nesmie presiahnuť 100 znakov'),
  role: z.nativeEnum({ ADMIN: 'ADMIN', SALES: 'SALES', MARKETING: 'MARKETING', TECHNICIAN: 'TECHNICIAN', PARTNER: 'PARTNER' }, {
    errorMap: () => ({ message: 'Neplatná rola' }),
  }),
})

export async function GET() {
  try {
    const authResult = await requireAuth('settings:users')()
    if (!authResult || 'status' in authResult) return authResult

    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('[Users API] GET Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri načítavaní používateľov' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth('settings:users')()
    if (!authResult || 'status' in authResult) return authResult

    const body = await request.json()
    const parsed = createUserSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors
      return NextResponse.json(
        { error: 'Neplatné údaje', details: errors },
        { status: 400 },
      )
    }

    const { name, email, password, role } = parsed.data

    /* Check for duplicate email */
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'Používateľ s touto e-mailovou adresou už existuje' },
        { status: 409 },
      )
    }

    const passwordHash = hashPassword(password)

    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role as UserRole,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('[Users API] POST Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri vytváraní používateľa' },
      { status: 500 },
    )
  }
}
