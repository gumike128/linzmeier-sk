'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Lock,
  Check,
  Sparkles,
  Search,
  Play,
  Send,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { useModuleStore } from '@/stores/module-store'
import { Module } from '@/types'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Category definitions                                               */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
  { key: 'all', label: 'Všetky' },
  { key: 'crm', label: 'CRM' },
  { key: 'cms', label: 'CMS' },
  { key: 'ai', label: 'AI' },
  { key: 'analytics', label: 'Analytika' },
  { key: 'integration', label: 'Integrácie' },
  { key: 'security', label: 'Bezpečnosť' },
] as const

/* ------------------------------------------------------------------ */
/*  Dynamic icon renderer                                              */
/* ------------------------------------------------------------------ */

function ModuleIcon({ iconName, className }: { iconName: string; className?: string }) {
  const IconComponent = (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[iconName]
  if (!IconComponent) return <Zap className={className} />
  return <IconComponent className={className} />
}

/* ------------------------------------------------------------------ */
/*  Module status helpers                                              */
/* ------------------------------------------------------------------ */

function getModuleStatus(mod: Module): 'active' | 'free' | 'locked' {
  const cm = mod._clientModule
  if (mod.isFree || cm?.status === 'active' || cm?.status === 'trial') {
    return mod.isFree ? 'free' : 'active'
  }
  return 'locked'
}

function getStatusConfig(status: 'active' | 'free' | 'locked') {
  switch (status) {
    case 'active':
      return {
        badge: 'Aktívny',
        badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        iconBg: 'bg-emerald-50 text-emerald-600',
      }
    case 'free':
      return {
        badge: 'ZADARMO',
        badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
        iconBg: 'bg-sky-50 text-sky-600',
      }
    case 'locked':
      return {
        badge: 'PREMIUM',
        badgeClass: 'bg-warm text-warm-dark border-warm/50',
        iconBg: 'bg-muted text-muted-foreground',
      }
  }
}

/* ------------------------------------------------------------------ */
/*  Module card                                                        */
/* ------------------------------------------------------------------ */

function ModuleCard({
  mod,
  onClick,
}: {
  mod: Module
  onClick: () => void
}) {
  const status = getModuleStatus(mod)
  const config = getStatusConfig(status)
  const isLocked = status === 'locked'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: mod.sortOrder * 0.04 }}
    >
      <Card
        className={`group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer ${
          isLocked ? 'border-dashed border-muted-foreground/30' : ''
        }`}
        onClick={onClick}
      >
        {/* Top accent bar */}
        <div
          className={`h-1 ${
            status === 'active'
              ? 'bg-emerald-500'
              : status === 'free'
              ? 'bg-sky-500'
              : 'bg-gradient-to-r from-warm to-warm-dark'
          }`}
        />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div
              className={`flex items-center justify-center size-11 rounded-xl ${config.iconBg} ${
                isLocked ? 'grayscale opacity-60' : ''
              }`}
            >
              <ModuleIcon iconName={mod.icon} className="size-5" />
            </div>
            <Badge variant="outline" className={config.badgeClass}>
              {status === 'locked' && <Lock className="size-3 mr-1" />}
              {config.badge}
            </Badge>
          </div>
          <CardTitle className="text-base mt-3 leading-tight">{mod.name}</CardTitle>
          <CardDescription className="text-sm line-clamp-2">
            {mod.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-3">
          {/* Features preview */}
          {mod.features && mod.features.length > 0 && (
            <ul className="text-xs text-muted-foreground space-y-1">
              {mod.features.slice(0, 3).map((f, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <Check className="size-3 shrink-0 text-emerald-500" />
                  <span>{f}</span>
                </li>
              ))}
              {mod.features.length > 3 && (
                <li className="text-muted-foreground/60 pl-4.5">
                  +{mod.features.length - 3} ďalších
                </li>
              )}
            </ul>
          )}

          {/* Trial badge */}
          {isLocked && mod.trialDays > 0 && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-warm-dark">
              <Sparkles className="size-3.5" />
              <span className="font-medium">{mod.trialDays} dní zadarmo</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-3 border-t border-border/50">
          {isLocked ? (
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  onClick()
                }}
              >
                <Send className="size-3 mr-1" />
                Mám záujem
              </Button>
              {mod.trialDays > 0 && (
                <Button
                  size="sm"
                  className="flex-1 text-xs bg-warm hover:bg-warm-dark text-warm-dark"
                  onClick={(e) => {
                    e.stopPropagation()
                    onClick()
                  }}
                >
                  <Play className="size-3 mr-1" />
                  Demo
                </Button>
              )}
              {mod.priceLabel && (
                <span className="text-xs text-muted-foreground self-center ml-auto">
                  {mod.priceLabel}
                </span>
              )}
            </div>
          ) : (
            <Button variant="ghost" size="sm" className="w-full text-xs">
              <ShieldCheck className="size-3 mr-1" />
              Spravovať
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Module detail dialog                                               */
/* ------------------------------------------------------------------ */

function ModuleDetailDialog({
  mod,
  open,
  onClose,
}: {
  mod: Module | null
  open: boolean
  onClose: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  if (!mod) return null

  const status = getModuleStatus(mod)
  const isLocked = status === 'locked'

  async function handleInterest() {
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/modules/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId: mod.id }),
      })
      if (res.ok) {
        toast.success('Žiadosť bola odoslaná', {
          description: 'Ozveme sa vám do 24 hodín s ponukou.',
        })
        onClose()
      } else {
        toast.error('Chyba pri odosielaní žiadosti')
      }
    } catch {
      toast.error('Nastala chyba')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`flex items-center justify-center size-12 rounded-xl ${
                isLocked ? 'bg-warm/10 text-warm-dark' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <ModuleIcon iconName={mod.icon} className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-lg">{mod.name}</DialogTitle>
              <DialogDescription className="text-sm">{mod.category}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {mod.longDescription || mod.description}
        </p>

        {/* Features list */}
        {mod.features && mod.features.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Funkcie</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {mod.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="size-3.5 shrink-0 text-emerald-500" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Status & pricing */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          {!isLocked ? (
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Modul je aktívny</span>
            </div>
          ) : (
            <>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{mod.priceLabel || 'Kontaktujte nás'}</p>
                {mod.trialDays > 0 && (
                  <p className="text-xs text-warm-dark">{mod.trialDays} dní skúšobná doba zadarmo</p>
                )}
              </div>
              <Badge variant="outline" className="bg-warm text-warm-dark border-warm/50">
                <Lock className="size-3 mr-1" />
                PREMIUM
              </Badge>
            </>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-3">
          {isLocked && (
            <>
              {mod.trialDays > 0 && (
                <Button
                  variant="outline"
                  onClick={handleInterest}
                  disabled={submitting}
                >
                  <Play className="size-4 mr-1.5" />
                  Vyskúšať demo
                </Button>
              )}
              <Button
                className="bg-warm hover:bg-warm-dark text-warm-dark"
                onClick={handleInterest}
                disabled={submitting}
              >
                {submitting ? (
                  <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="size-4 mr-1.5" />
                )}
                Mám záujem
              </Button>
            </>
          )}
          <Button variant="ghost" onClick={onClose}>
            Zavrieť
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function MarketplacePage() {
  const { modules, isLoading, isInitialized, initialize } = useModuleStore()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)

  useEffect(() => {
    if (!isInitialized) initialize()
  }, [isInitialized, initialize])

  const filteredModules = useMemo(() => {
    let result = modules
    if (category !== 'all') {
      result = result.filter((m) => m.category === category)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
      )
    }
    return result
  }, [modules, category, search])

  const activeCount = modules.filter(
    (m) => m.isFree || m._clientModule?.status === 'active' || m._clientModule?.status === 'trial'
  ).length

  if (isLoading || !isInitialized) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-20" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Rozšírenia</h1>
        <p className="text-sm text-muted-foreground mt-1">
          <span className="font-semibold text-foreground">{activeCount}</span> z{' '}
          <span className="font-semibold text-foreground">{modules.length}</span> modulov aktívnych
          — spravujte rozšírenia pre vašu aplikáciu
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Hľadať modul..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.key}
              variant={category === cat.key ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-8"
              onClick={() => setCategory(cat.key)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Module grid */}
      {filteredModules.length === 0 ? (
        <div className="text-center py-16">
          <Search className="size-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">Žiadne moduly nezodpovedajú vášmu vyhľadávaniu</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModules.map((mod) => (
            <ModuleCard
              key={mod.id}
              mod={mod}
              onClick={() => setSelectedModule(mod)}
            />
          ))}
        </div>
      )}

      {/* Detail dialog */}
      <ModuleDetailDialog
        mod={selectedModule}
        open={!!selectedModule}
        onClose={() => setSelectedModule(null)}
      />
    </div>
  )
}
