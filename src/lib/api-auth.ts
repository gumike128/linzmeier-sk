import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from './auth'
import { hasPermission } from './rbac'
import { UserRole, Permission } from '@/types'

export async function getAuthUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role as UserRole,
  }
}

export function unauthorized() {
  return NextResponse.json({ error: 'Neautorizovaný prístup' }, { status: 401 })
}

export function forbidden() {
  return NextResponse.json({ error: 'Nemáte oprávnenie na túto akciu' }, { status: 403 })
}

export function requireAuth(permission: Permission) {
  return async function checkAuth() {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, permission)) return forbidden()
    return user
  }
}
