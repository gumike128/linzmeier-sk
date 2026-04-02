import { UserRole, Permission } from '@/types'

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPERADMIN: [
    // All ADMIN permissions
    'leads:view','leads:create','leads:edit','leads:delete','leads:assign','leads:export',
    'pipeline:view',
    'products:view','products:edit','products:publish',
    'blog:view','blog:edit','blog:publish',
    'references:view','references:edit','references:publish',
    'documents:view','documents:edit','documents:upload',
    'ai:chatbot','ai:suggest','ai:generate','ai:score',
    'dashboard:view','analytics:view',
    'settings:view','settings:users','settings:roles','settings:audit','settings:automations',
    // Module permissions
    'modules:view','modules:manage',
    // Superadmin permissions
    'superadmin:access','superadmin:clients','superadmin:modules',
  ],
  ADMIN: [
    'leads:view','leads:create','leads:edit','leads:delete','leads:assign','leads:export',
    'pipeline:view',
    'products:view','products:edit','products:publish',
    'blog:view','blog:edit','blog:publish',
    'references:view','references:edit','references:publish',
    'documents:view','documents:edit','documents:upload',
    'ai:chatbot','ai:suggest','ai:generate','ai:score',
    'dashboard:view','analytics:view',
    'settings:view','settings:users','settings:roles','settings:audit','settings:automations',
    'modules:view',
  ],
  SALES: [
    'leads:view','leads:create','leads:edit','leads:assign',
    'pipeline:view',
    'products:view',
    'documents:view',
    'ai:suggest','ai:score',
    'dashboard:view','analytics:view',
  ],
  MARKETING: [
    'leads:view','leads:export',
    'products:view','products:edit','products:publish',
    'blog:view','blog:edit','blog:publish',
    'references:view','references:edit','references:publish',
    'documents:view','documents:edit','documents:upload',
    'ai:generate',
    'dashboard:view','analytics:view',
  ],
  TECHNICIAN: [
    'leads:view',
    'products:view',
    'documents:view','documents:edit','documents:upload',
    'dashboard:view',
  ],
  PARTNER: [
    'products:view',
    'documents:view',
  ],
}

const ROLE_MENU: Record<UserRole, string[]> = {
  SUPERADMIN: ['dashboard','crm','cms','ai','analytics','marketplace','settings','superadmin'],
  ADMIN: ['dashboard','crm','cms','ai','analytics','marketplace','settings'],
  SALES: ['dashboard','crm','analytics'],
  MARKETING: ['dashboard','cms','ai','analytics'],
  TECHNICIAN: ['dashboard','documents'],
  PARTNER: ['documents'],
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function isSuperAdmin(role: UserRole): boolean {
  return role === 'SUPERADMIN'
}

export function getVisibleMenuItems(role: UserRole): string[] {
  return ROLE_MENU[role] ?? []
}

export const LEAD_STATUS_FLOW: Record<string, string[]> = {
  NEW: ['CONTACTED', 'LOST'],
  CONTACTED: ['QUALIFIED', 'LOST'],
  QUALIFIED: ['PROPOSAL', 'LOST'],
  PROPOSAL: ['NEGOTIATION', 'LOST'],
  NEGOTIATION: ['WON', 'LOST'],
  WON: [],
  LOST: [],
}

export const LEAD_STATUS_LABELS: Record<string, string> = {
  NEW: 'Nový',
  CONTACTED: 'Kontaktovaný',
  QUALIFIED: 'Kvalifikovaný',
  PROPOSAL: 'Ponuka',
  NEGOTIATION: 'Rokovanie',
  WON: 'Získaný',
  LOST: 'Stratený',
}

export const LEAD_STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  QUALIFIED: 'bg-purple-100 text-purple-800',
  PROPOSAL: 'bg-indigo-100 text-indigo-800',
  NEGOTIATION: 'bg-orange-100 text-orange-800',
  WON: 'bg-green-100 text-green-800',
  LOST: 'bg-red-100 text-red-800',
}
