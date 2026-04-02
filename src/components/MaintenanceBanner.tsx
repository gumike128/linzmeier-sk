'use client'

import { useSession } from 'next-auth/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Wrench, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function MaintenanceBannerInner() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [maintenance, setMaintenance] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const isLoggedIn = status === 'authenticated'
  const isAdmin = pathname.startsWith('/admin') || pathname.startsWith('/login')
  const isPreview = searchParams.has('preview')
  const isMaintenancePage = pathname === '/maintenance'

  useEffect(() => {
    // Also show on /maintenance?preview pages for logged-in users
    if (!isLoggedIn || isAdmin) return
    let cancelled = false

    async function check() {
      try {
        const res = await fetch('/api/public/maintenance')
        const data = await res.json()
        if (!cancelled) setMaintenance(!!data?.maintenance)
      } catch {
        // ignore
      }
    }

    check()
    const interval = setInterval(check, 15_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [isLoggedIn, isAdmin])

  // Show banner when:
  // - user is logged in
  // - NOT on admin/login pages
  // - NOT on /maintenance page (even with ?preview — admin sees exactly what visitor sees)
  // - NOT in preview mode (?preview = admin wants unmodified visitor view)
  // - maintenance mode is ON
  // - AND not dismissed
  if (!isLoggedIn || isAdmin || !maintenance || dismissed) return null
  if (isMaintenancePage || isPreview) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-warm text-brand-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3 py-2 text-sm font-medium">
          <Wrench className="size-4 shrink-0" />
          <span>
            Stránky sú v&nbsp;<strong>maintenance móde</strong>&nbsp;— verejný
            obsah je pre návštevníkov skrytý.
          </span>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-dark/10 px-3 py-1 text-xs font-semibold hover:bg-brand-dark/20 transition-colors"
          >
            <ArrowLeft className="size-3" />
            Návrat do administrácie
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="ml-2 p-0.5 rounded hover:bg-brand-dark/10 transition-colors"
            aria-label="Zavrieť"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function MaintenanceBanner() {
  return (
    <Suspense fallback={null}>
      <MaintenanceBannerInner />
    </Suspense>
  )
}
