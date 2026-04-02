'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import Image from 'next/image'
import { Menu, ChevronDown, Phone, Building2, Home, Factory, Triangle, Square, Layers, Wind, Box, Hammer, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Navigation data ────────────────────────────────────────────────
interface NavChild {
  label: string
  href: string
  icon?: React.ReactNode
}

interface NavItem {
  label: string
  href?: string
  children?: NavChild[]
}

const navItems: NavItem[] = [
  {
    label: 'Produkty',
    children: [
      {
        label: 'Šikmá strecha',
        href: '/produkty/sikma-strecha',
        icon: <Triangle className="size-4" />,
      },
      {
        label: 'Plochá strecha',
        href: '/produkty/plocha-strecha',
        icon: <Square className="size-4" />,
      },
      {
        label: 'Izolácia stropu',
        href: '/produkty/izolacia-stropu',
        icon: <Layers className="size-4" />,
      },
      {
        label: 'Prevetrávaná fasáda',
        href: '/produkty/prevetravana-fasada',
        icon: <Wind className="size-4" />,
      },
      {
        label: 'Podlaha',
        href: '/produkty/podlaha',
        icon: <Box className="size-4" />,
      },
    ],
  },
  {
    label: 'Riešenia',
    children: [
      {
        label: 'Rodinné domy',
        href: '/riesenia/rodinne-domy',
        icon: <Home className="size-4" />,
      },
      {
        label: 'Bytové domy',
        href: '/riesenia/bytove-domy',
        icon: <Building2 className="size-4" />,
      },
      {
        label: 'Priemyselné objekty',
        href: '/riesenia/priemysel',
        icon: <Factory className="size-4" />,
      },
      {
        label: 'Rekonštrukcie',
        href: '/riesenia/rekonstrukcie',
        icon: <Hammer className="size-4" />,
      },
      {
        label: 'Ochrana proti hluku',
        href: '/riesenia/ochrana-proti-hluku',
        icon: <VolumeX className="size-4" />,
      },
    ],
  },
  {
    label: 'Referencie',
    href: '/referencie',
  },
  {
    label: 'Technická podpora',
    href: '/technicka-podpora',
  },
  {
    label: 'O spoločnosti',
    href: '/#o-spolocnosti',
  },
  {
    label: 'Partneri',
    href: '/partner',
  },
]

// ─── Header component ───────────────────────────────────────────────
export function Header() {
  const isScrolledRef = useRef(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 10
      if (next !== isScrolledRef.current) {
        isScrolledRef.current = next
        setIsScrolled(next)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        isScrolled
          ? 'bg-background/80 backdrop-blur-lg border-b border-border/50 shadow-sm'
          : 'bg-background border-b border-transparent'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* ── Logo ─────────────────────────────────────── */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo.png"
              alt="LINZMEIER Slovakia"
              width={140}
              height={42}
              priority
              className="h-10 w-auto"
            />
          </Link>

          {/* ── Desktop Navigation ──────────────────────── */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) =>
              item.children ? (
                <DesktopDropdown key={item.label} item={item} />
              ) : (
                <Link
                  key={item.label}
                  href={item.href!}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-foreground/80 hover:text-brand-dark rounded-md hover:bg-accent transition-colors"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* ── Desktop CTA + Mobile Toggle ─────────────── */}
          <div className="flex items-center gap-3">
            <Button
              asChild
              className="hidden lg:inline-flex bg-warm text-brand-dark hover:bg-warm-dark shadow-sm"
            >
              <Link href="/#kontakt" className="gap-2">
                <Phone className="size-4" />
                Kontaktujte nás
              </Link>
            </Button>

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="size-5" />
                  <span className="sr-only">Otvoriť menu</span>
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="w-full sm:max-w-sm p-0 overflow-y-auto">
                <SheetHeader className="px-6 pt-6 pb-4">
                  <SheetTitle className="flex items-center">
                    <Image
                      src="/logo.png"
                      alt="LINZMEIER Slovakia"
                      width={140}
                      height={42}
                      className="h-10 w-auto"
                    />
                  </SheetTitle>
                </SheetHeader>

                <Separator />

                {/* Mobile nav items */}
                <nav className="flex flex-col px-3 py-2">
                  {navItems.map((item) =>
                    item.children ? (
                      <MobileCollapsible
                        key={item.label}
                        item={item}
                        onClose={() => setMobileOpen(false)}
                      />
                    ) : (
                      <Link
                        key={item.label}
                        href={item.href!}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center px-3 py-2.5 text-sm font-medium text-foreground/80 hover:text-brand-dark hover:bg-accent rounded-md transition-colors"
                      >
                        {item.label}
                      </Link>
                    )
                  )}
                </nav>

                <Separator />

                {/* Mobile CTA */}
                <div className="px-4 py-4">
                  <Button
                    asChild
                    className="w-full bg-warm text-brand-dark hover:bg-warm-dark justify-center gap-2"
                  >
                    <Link href="/#kontakt" onClick={() => setMobileOpen(false)}>
                      <Phone className="size-4" />
                      Kontaktujte nás
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

// ─── Desktop Dropdown ────────────────────────────────────────────────
function DesktopDropdown({ item }: { item: NavItem }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-brand-dark rounded-md hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
          {item.label}
          <ChevronDown className="size-3.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {item.label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {item.children!.map((child) => (
          <DropdownMenuItem key={child.label} asChild>
            <Link href={child.href} className="flex items-center gap-2.5 py-2 cursor-pointer">
              <span className="flex items-center justify-center size-8 rounded-md bg-accent text-brand">
                {child.icon}
              </span>
              <span className="text-sm font-medium">{child.label}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Mobile Collapsible Section ──────────────────────────────────────
function MobileCollapsible({
  item,
  onClose,
}: {
  item: NavItem
  onClose: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="group">
      <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium text-foreground/80 hover:text-brand-dark hover:bg-accent rounded-md transition-colors [&[data-state=open]>svg]:rotate-180">
        {item.label}
        <ChevronDown className="size-4 opacity-60 transition-transform duration-200" />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="pl-3 pr-1 pb-1">
          {item.children!.map((child) => (
            <Link
              key={child.label}
              href={child.href}
              onClick={onClose}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground/70 hover:text-brand-dark hover:bg-accent rounded-md transition-colors"
            >
              <span className="flex items-center justify-center size-7 rounded-md bg-accent/60 text-brand/70">
                {child.icon}
              </span>
              {child.label}
            </Link>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
