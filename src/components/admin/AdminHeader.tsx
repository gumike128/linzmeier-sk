'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, User, Settings, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { NotificationBell } from '@/components/admin/NotificationBell'

/* ------------------------------------------------------------------ */
/*  Breadcrumb mapping                                                 */
/* ------------------------------------------------------------------ */

interface BreadcrumbSegment {
  label: string
  href?: string
}

const PAGE_TITLES: Record<string, BreadcrumbSegment[]> = {
  '/admin/dashboard': [{ label: 'Dashboard' }],
  '/admin/crm/leads': [
    { label: 'CRM', href: '/admin/crm/leads' },
    { label: 'Leady' },
  ],
  '/admin/crm/pipeline': [
    { label: 'CRM', href: '/admin/crm/leads' },
    { label: 'Pipeline' },
  ],
  '/admin/cms/products': [
    { label: 'CMS', href: '/admin/cms/products' },
    { label: 'Produkty' },
  ],
  '/admin/cms/blog': [
    { label: 'CMS', href: '/admin/cms/products' },
    { label: 'Blog' },
  ],
  '/admin/cms/references': [
    { label: 'CMS', href: '/admin/cms/products' },
    { label: 'Referencie' },
  ],
  '/admin/cms/documents': [
    { label: 'CMS', href: '/admin/cms/products' },
    { label: 'Dokumenty' },
  ],
  '/admin/ai': [
    { label: 'AI', href: '/admin/ai' },
    { label: 'Nástroje' },
  ],
  '/admin/analytics': [{ label: 'Analytika' }],
  '/admin/settings': [{ label: 'Nastavenia' }],
  '/admin/settings/audit-log': [
    { label: 'Nastavenia', href: '/admin/settings' },
    { label: 'Audit Log' },
  ],
  '/admin/settings/automations': [
    { label: 'Nastavenia', href: '/admin/settings' },
    { label: 'Automatizácie' },
  ],
}

function getBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  /* Try exact match first */
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]

  /* Try prefix match (e.g. /admin/crm/leads/123 → CRM leads) */
  const sorted = Object.keys(PAGE_TITLES).sort(
    (a, b) => b.length - a.length
  )
  for (const key of sorted) {
    if (pathname.startsWith(key + '/')) {
      return PAGE_TITLES[key]
    }
  }

  return [{ label: 'Admin' }]
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AdminHeader() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumbs(pathname)

  const name = session?.user?.name ?? ''
  const email = session?.user?.email ?? ''
  const avatarUrl = (session?.user as Record<string, string | undefined>)?.image
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const pageTitle =
    breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : ''

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-white px-4 md:px-6">
      {/* Mobile hamburger (placeholder for Sheet toggle in sidebar) */}
      <div className="md:hidden w-9" aria-hidden="true" />

      {/* Page title on mobile */}
      <h1 className="md:hidden text-base font-semibold text-foreground truncate">
        {pageTitle}
      </h1>

      {/* Breadcrumb on desktop */}
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          {breadcrumbs.map((seg, i) => {
            const isLast = i === breadcrumbs.length - 1
            return (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{seg.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={seg.href ?? '/admin/dashboard'}>
                        {seg.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Notification bell – live reminders */}
      <NotificationBell />

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 h-9 px-2 hover:bg-muted rounded-lg"
          >
            <Avatar className="size-7">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
              <AvatarFallback className="bg-brand/10 text-brand text-[11px] font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden lg:block text-sm font-medium text-foreground max-w-[160px] truncate">
              {name}
            </span>
            <ChevronRight className="hidden lg:block size-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">{name}</p>
              <p className="text-xs text-muted-foreground">{email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/admin/settings" className="flex items-center gap-2">
                <Settings className="size-4" />
                <span>Nastavenia</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/admin/dashboard" className="flex items-center gap-2">
                <User className="size-4" />
                <span>Profil</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="size-4" />
            <span>Odhlásiť sa</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
