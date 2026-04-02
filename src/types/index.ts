export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'SALES' | 'MARKETING' | 'TECHNICIAN' | 'PARTNER'
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST'
export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type LeadPriority = 'low' | 'normal' | 'high' | 'urgent'
export type ProductCategory = 'panels' | 'facades' | 'boards' | 'accessories'
export type DocumentCategory = 'technical_sheet' | 'bim_cad' | 'manual' | 'certificate'
export type ModuleCategory = 'core' | 'crm' | 'cms' | 'ai' | 'analytics' | 'integration' | 'security'
export type ClientModuleStatus = 'active' | 'trial' | 'inactive' | 'expired'

export type Permission =
  | 'leads:view' | 'leads:create' | 'leads:edit' | 'leads:delete' | 'leads:assign' | 'leads:export'
  | 'pipeline:view'
  | 'products:view' | 'products:edit' | 'products:publish'
  | 'blog:view' | 'blog:edit' | 'blog:publish'
  | 'references:view' | 'references:edit' | 'references:publish'
  | 'documents:view' | 'documents:edit' | 'documents:upload'
  | 'ai:chatbot' | 'ai:suggest' | 'ai:generate' | 'ai:score'
  | 'dashboard:view' | 'analytics:view'
  | 'settings:view' | 'settings:users' | 'settings:roles' | 'settings:audit' | 'settings:automations'
  | 'modules:view' | 'modules:manage'
  | 'superadmin:access' | 'superadmin:clients' | 'superadmin:modules'

// Dashboard stats
export interface DashboardStats {
  newLeadsToday: number
  totalLeads: number
  conversionRate: number
  aiInteractions: number
  leadsByStatus: Record<string, number>
  wonLeads: number
  leadsByMonth: Record<string, number>
  leadsByCustomerType: Record<string, number>
  leadsBySource: Record<string, number>
  topProducts: Record<string, number>
  weeklyLeads: Record<string, number>
  recentLeads: LeadWithUser[]
  recentActivities: ActivityWithUser[]
}

export interface LeadWithUser {
  id: string
  name: string
  email: string
  customerType: string
  status: LeadStatus
  priority: LeadPriority
  createdAt: Date
  assignedTo?: { id: string; name: string } | null
}

export interface ActivityWithUser {
  id: string
  type: string
  description: string
  createdAt: Date
  user: { name: string }
  lead?: { id: string; name: string } | null
}

// Module types
export interface Module {
  id: string
  slug: string
  name: string
  description: string
  longDescription?: string | null
  category: ModuleCategory
  icon: string
  price: number
  priceLabel: string
  sortOrder: number
  isVisible: boolean
  isFree: boolean
  trialDays: number
  linkedMenuItems?: string[] | null
  features?: string[] | null
  createdAt: Date
  updatedAt: Date
  _clientModule?: ClientModule | null
}

export interface ClientModule {
  id: string
  clientId: string
  moduleId: string
  status: ClientModuleStatus
  activatedAt: Date
  expiresAt?: Date | null
  note?: string | null
  activatedBy?: string | null
  module?: Module | null
}
