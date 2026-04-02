'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Kanban,
  Package,
  FileText,
  Building2,
  FolderOpen,
  Bot,
  Settings,
  LogOut,
  ChevronLeft,
  BarChart3,
  ClipboardList,
  Zap,
  ShoppingCart,
  Shield,
  Lock,
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getVisibleMenuItems, isSuperAdmin } from '@/lib/rbac'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { UserRole } from '@/types'
import { useModuleStore } from '@/stores/module-store'

/* ------------------------------------------------------------------ */
/*  Menu item definitions                                              */
/* ------------------------------------------------------------------ */

interface MenuItemDef {
  id: string
  label: string
  href: string
  icon: React.ElementType
  section: string
  /** If set, this menu item is gated by a module slug */
  moduleSlug?: string
}

const ALL_MENU_ITEMS: MenuItemDef[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    section: 'Hlavné',
  },
  {
    id: 'crm-leads',
    label: 'CRM – Leady',
    href: '/admin/crm/leads',
    icon: Users,
    section: 'CRM',
    moduleSlug: 'crm-basic',
  },
  {
    id: 'crm-pipeline',
    label: 'CRM – Pipeline',
    href: '/admin/crm/pipeline',
    icon: Kanban,
    section: 'CRM',
    moduleSlug: 'crm-pro',
  },
  {
    id: 'products',
    label: 'Produkty',
    href: '/admin/cms/products',
    icon: Package,
    section: 'CMS',
    moduleSlug: 'cms-basic',
  },
  {
    id: 'blog',
    label: 'Blog',
    href: '/admin/cms/blog',
    icon: FileText,
    section: 'CMS',
    moduleSlug: 'cms-basic',
  },
  {
    id: 'references',
    label: 'Referencie',
    href: '/admin/cms/references',
    icon: Building2,
    section: 'CMS',
    moduleSlug: 'references-manager',
  },
  {
    id: 'documents',
    label: 'Dokumenty',
    href: '/admin/cms/documents',
    icon: FolderOpen,
    section: 'CMS',
    moduleSlug: 'cms-basic',
  },
  {
    id: 'ai-chatbot',
    label: 'AI Nástroje',
    href: '/admin/ai',
    icon: Bot,
    section: 'AI',
    moduleSlug: 'ai-assistant',
  },
  {
    id: 'analytics',
    label: 'Analytika',
    href: '/admin/analytics',
    icon: BarChart3,
    section: 'Analytika',
    moduleSlug: 'analytics-pro',
  },
  {
    id: 'marketplace',
    label: 'Rozšírenia',
    href: '/admin/marketplace',
    icon: ShoppingCart,
    section: 'Marketplace',
  },
  {
    id: 'settings',
    label: 'Nastavenia',
    href: '/admin/settings',
    icon: Settings,
    section: 'Systém',
  },
  {
    id: 'audit-log',
    label: 'Audit Log',
    href: '/admin/settings/audit-log',
    icon: ClipboardList,
    section: 'Systém',
    moduleSlug: 'audit-trail',
  },
  {
    id: 'automations',
    label: 'Automatizácie',
    href: '/admin/settings/automations',
    icon: Zap,
    section: 'Systém',
    moduleSlug: 'crm-pro',
  },
]

/* Superadmin-only menu items */
const SUPERADMIN_MENU_ITEMS: MenuItemDef[] = [
  {
    id: 'superadmin-clients',
    label: 'Správa klientov',
    href: '/admin/superadmin/clients',
    icon: Shield,
    section: 'Superadmin',
  },
]

/* Map RBAC section keys to menu item IDs */
const SECTION_ITEM_MAP: Record<string, string[]> = {
  dashboard: ['dashboard'],
  crm: ['crm-leads', 'crm-pipeline'],
  cms: ['products', 'blog', 'references', 'documents'],
  ai: ['ai-chatbot'],
  analytics: ['analytics'],
  marketplace: ['marketplace'],
  settings: ['settings', 'audit-log', 'automations'],
  documents: ['documents'],
  superadmin: ['superadmin-clients'],
}

const ROLE_LABELS: Record<UserRole, string> = {
  SUPERADMIN: 'Superadmin',
  ADMIN: 'Administrátor',
  SALES: 'Obchodník',
  MARKETING: 'Marketing',
  TECHNICIAN: 'Technik',
  PARTNER: 'Partner',
}

/* ------------------------------------------------------------------ */
/*  Navigation content (shared between desktop & mobile)               */
/* ------------------------------------------------------------------ */

function NavContent({
  pathname,
  visibleIds,
  role,
}: {
  pathname: string
  visibleIds: string[]
  role: UserRole
}) {
  const router = useRouter()
  const { lockedMenuItems, hasModuleAccess, isSuperAdmin: isSA } = useModuleStore()
  const locked = lockedMenuItems

  // Combine regular + superadmin items
  const allItems = [...ALL_MENU_ITEMS, ...(isSA ? SUPERADMIN_MENU_ITEMS : [])]
  const filteredItems = allItems.filter((item) =>
    visibleIds.includes(item.id)
  )

  /* Group items by section */
  const grouped: { section: string; items: MenuItemDef[] }[] = []
  for (const item of filteredItems) {
    const existing = grouped.find((g) => g.section === item.section)
    if (existing) {
      existing.items.push(item)
    } else {
      grouped.push({ section: item.section, items: [item] })
    }
  }

  function handleClick(item: MenuItemDef, e: React.MouseEvent) {
    // If item is locked (gated by a module) and user is NOT superadmin,
    // redirect to marketplace instead
    if (
      item.moduleSlug &&
      locked.has(item.id) &&
      !isSA
    ) {
      e.preventDefault()
      router.push('/admin/marketplace')
    }
  }

  return (
    <ScrollArea className="flex-1 px-3 py-2">
      <nav className="flex flex-col gap-1">
        {grouped.map((group) => (
          <div key={group.section} className="mb-3">
            <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">
              {group.section}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/admin/dashboard' &&
                    pathname.startsWith(item.href))
                const Icon = item.icon
                const isLocked =
                  item.moduleSlug && locked.has(item.id) && !isSA

                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={(e) => handleClick(item, e)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                        isActive && !isLocked
                          ? 'bg-white/15 text-white shadow-sm'
                          : isLocked
                          ? 'text-white/40 hover:bg-white/5 hover:text-white/60'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {/* Locked badge */}
                      {isLocked && (
                        <Badge className="bg-warm/20 text-warm border-warm/30 text-[9px] px-1.5 py-0 font-bold">
                          <Lock className="size-2.5 mr-0.5" />
                          PREMIUM
                        </Badge>
                      )}
                      {/* Active indicator */}
                      {isActive && !isLocked && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-warm" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </ScrollArea>
  )
}

/* ------------------------------------------------------------------ */
/*  User footer at sidebar bottom                                      */
/* ------------------------------------------------------------------ */

function UserFooter() {
  const { data: session } = useSession()
  const name = session?.user?.name ?? ''
  const email = session?.user?.email ?? ''
  const role = session?.user?.role ?? 'PARTNER'
  const avatarUrl = (session?.user as Record<string, string | undefined>)?.image
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="border-t border-white/10 p-3">
      <div className="flex items-center gap-3">
        <Avatar className="size-9 border-2 border-warm/50">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
          <AvatarFallback className="bg-warm/20 text-warm-dark text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{name}</p>
          <p className="text-xs text-white/50 truncate">{ROLE_LABELS[role as UserRole]}</p>
        </div>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-white/50 hover:text-white hover:bg-white/10"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                <LogOut className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Odhlásiť sa
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Sidebar (desktop)                                             */
/* ------------------------------------------------------------------ */

export function AdminSidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const role = (session?.user?.role ?? 'PARTNER') as UserRole
  const visibleSections = getVisibleMenuItems(role)

  /* Initialize module store on mount */
  const { isInitialized, initialize } = useModuleStore()

  // Initialize store when sidebar mounts (happens once after login)
  if (typeof window !== 'undefined' && !isInitialized) {
    initialize()
  }

  /* Flatten visible section IDs to menu item IDs */
  const visibleIds = visibleSections.flatMap(
    (section) => SECTION_ITEM_MAP[section] ?? []
  )

  /* ---- Mobile sidebar (Sheet) ---- */
  const MobileSidebar = (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden fixed top-3 left-3 z-50 size-9 text-white hover:bg-white/10"
        >
          <ChevronLeft className="size-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[272px] p-0 bg-brand-dark border-r border-white/10 [&>button]:hidden"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Navigácia</SheetTitle>
        </SheetHeader>
        <div className="flex h-full flex-col">
          {/* Logo area */}
          <div className="flex items-center gap-2 px-5 pt-5 pb-3">
            <Image
              src="/logo.png"
              alt="LINZMEIER Admin"
              width={120}
              height={36}
              className="h-8 w-auto brightness-0 invert"
            />
            <Badge className="bg-warm/20 text-warm-dark border-warm/30 text-[10px] px-1.5 py-0">
              ADMIN
            </Badge>
          </div>
          <Separator className="bg-white/10 mx-3" />
          <NavContent pathname={pathname} visibleIds={visibleIds} role={role} />
          <UserFooter />
        </div>
      </SheetContent>
    </Sheet>
  )

  /* ---- Desktop sidebar ---- */
  const DesktopSidebar = (
    <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 z-30 w-[260px] bg-brand-dark border-r border-white/10">
      {/* Logo area */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-4">
        <Image
          src="/logo.png"
          alt="LINZMEIER Admin"
          width={120}
          height={36}
          className="h-8 w-auto brightness-0 invert"
        />
        <Badge className="bg-warm/20 text-warm-dark border-warm/30 text-[10px] px-1.5 py-0">
          ADMIN
        </Badge>
      </div>
      <Separator className="bg-white/10 mx-3" />
      <NavContent pathname={pathname} visibleIds={visibleIds} role={role} />
      <UserFooter />
    </aside>
  )

  return (
    <>
      {MobileSidebar}
      {DesktopSidebar}
    </>
  )
}
