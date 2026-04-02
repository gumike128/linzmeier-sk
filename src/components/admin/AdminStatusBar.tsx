'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Eye, Wrench, ExternalLink } from 'lucide-react'

/**
 * Status bar shown at the top of the admin panel.
 * Always visible — shows either green "LIVE" or yellow "MAINTENANCE".
 * Includes links to preview the public site.
 */
export function AdminStatusBar() {
  const { data: session, status } = useSession()
  const [maintenance, setMaintenance] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false

    async function check() {
      try {
        const res = await fetch('/api/public/maintenance')
        const data = await res.json()
        if (!cancelled) setMaintenance(!!data?.maintenance)
      } catch {
        // keep current value
      }
    }

    check()
    const interval = setInterval(check, 10_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  const isLoggedIn = status === 'authenticated'

  if (maintenance === null) {
    return (
      <div className="h-8 bg-muted flex items-center justify-center">
        <div className="size-2 rounded-full bg-muted-foreground/30 animate-pulse" />
      </div>
    )
  }

  return (
    <div
      className={`h-8 flex items-center justify-center gap-3 text-xs font-semibold shrink-0 transition-colors duration-300 ${
        maintenance
          ? 'bg-warm text-brand-dark'
          : 'bg-emerald-500 text-white'
      }`}
    >
      <span className="flex items-center gap-1.5">
        {maintenance ? (
          <>
            <Wrench className="size-3.5" />
            MAINTENANCE MÓD
          </>
        ) : (
          <>
            <Eye className="size-3.5" />
            LIVE MÓD
          </>
        )}
      </span>

      {/* View site as logged-in admin (bypasses maintenance) */}
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-full bg-black/10 px-2.5 py-0.5 hover:bg-black/20 transition-colors"
      >
        <ExternalLink className="size-3" />
        Zobraziť stránky
      </a>

      {/* View site as visitor (respects maintenance) */}
      {maintenance && isLoggedIn && (
        <a
          href="/?preview=1"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-full bg-black/10 px-2.5 py-0.5 hover:bg-black/20 transition-colors"
        >
          <Eye className="size-3" />
          Ako návštevník
        </a>
      )}
    </div>
  )
}
