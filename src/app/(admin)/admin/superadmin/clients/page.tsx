'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { sk } from 'date-fns/locale/sk'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Shield,
  Settings,
  Loader2,
  ChevronRight,
  Lock,
  Unlock,
  Users,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { Module } from '@/types'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ClientData {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  lastLoginAt: string | null
  activeModuleCount: number
  totalModules: number
}

interface ClientModuleData {
  id: string
  moduleId: string
  status: string
  activatedAt: string
  expiresAt: string | null
  note: string | null
  module: Module | null
}

interface FullModule {
  id: string
  slug: string
  name: string
  description: string
  category: string
  icon: string
  price: number
  priceLabel: string
  isFree: boolean
  features: string[]
  _clientModule: ClientModuleData | null
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrátor',
  SALES: 'Obchodník',
  MARKETING: 'Marketing',
  TECHNICIAN: 'Technik',
  PARTNER: 'Partner',
}

function ModuleIcon({ iconName, className }: { iconName: string; className?: string }) {
  const IconComponent = (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[iconName]
  if (!IconComponent) return <Zap className={className} />
  return <IconComponent className={className} />
}

/* ------------------------------------------------------------------ */
/*  Module management dialog                                           */
/* ------------------------------------------------------------------ */

function ModuleManageDialog({
  client,
  open,
  onClose,
}: {
  client: ClientData | null
  open: boolean
  onClose: () => void
}) {
  const queryClient = useQueryClient()

  const { data: clientModules, isLoading } = useQuery({
    queryKey: ['client-modules', client?.id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/superadmin/clients/${client?.id}/modules`)
      if (!res.ok) throw new Error('Chyba pri načítaní modulov')
      return res.json() as Promise<{ modules: FullModule[] }>
    },
    enabled: !!client?.id && open,
  })

  const toggleMutation = useMutation({
    mutationFn: async ({
      moduleId,
      status,
      note,
      expiresAt,
    }: {
      moduleId: string
      status: string
      note?: string
      expiresAt?: string
    }) => {
      const res = await fetch(`/api/admin/superadmin/clients/${client?.id}/modules`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, status, note, expiresAt }),
      })
      if (!res.ok) throw new Error('Chyba pri zmene modulu')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-modules', client?.id] })
      queryClient.invalidateQueries({ queryKey: ['superadmin-clients'] })
      toast.success('Modul bol aktualizovaný')
    },
    onError: () => {
      toast.error('Nastala chyba pri aktualizácii modulu')
    },
  })

  if (!client) return null

  const modules = clientModules?.modules ?? []
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({})
  const [localExpiry, setLocalExpiry] = useState<Record<string, string>>({})

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-full bg-brand/10">
              <Users className="size-5 text-brand" />
            </div>
            <div>
              <DialogTitle>{client.name}</DialogTitle>
              <DialogDescription>{client.email}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="text-sm text-muted-foreground">
          Správa modulov — aktivujte alebo deaktivujte jednotlivé moduly pre tohto klienta.
        </div>

        {/* Module list */}
        <div className="space-y-3 mt-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))
          ) : (
            modules.map((mod) => {
              const isActive = mod._clientModule?.status === 'active' || mod._clientModule?.status === 'trial'
              const isFree = mod.isFree

              return (
                <div
                  key={mod.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    isActive ? 'border-emerald-200 bg-emerald-50/50' : 'border-border bg-muted/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`flex items-center justify-center size-10 rounded-lg shrink-0 ${
                        isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <ModuleIcon iconName={mod.icon} className="size-5" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{mod.name}</p>
                        {isFree && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-sky-50 text-sky-700 border-sky-200">
                            ZADARMO
                          </Badge>
                        )}
                        {!isFree && (
                          <span className="text-xs text-muted-foreground">{mod.priceLabel}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{mod.description}</p>

                      {/* Expiry & note fields (shown when active or being configured) */}
                      {!isFree && (
                        <div className="mt-2 flex flex-col sm:flex-row gap-2">
                          <input
                            type="date"
                            value={localExpiry[mod.id] ?? mod._clientModule?.expiresAt?.split('T')[0] ?? ''}
                            onChange={(e) => setLocalNotes((p) => ({ ...p }))}
                            onChange={(e) => setLocalExpiry((p) => ({ ...p, [mod.id]: e.target.value }))}
                            className="text-xs border rounded-md px-2 py-1 bg-white w-40"
                            placeholder="Dátum expirácie"
                          />
                          <input
                            type="text"
                            value={localNotes[mod.id] ?? mod._clientModule?.note ?? ''}
                            onChange={(e) => setLocalNotes((p) => ({ ...p, [mod.id]: e.target.value }))}
                            className="text-xs border rounded-md px-2 py-1 bg-white flex-1"
                            placeholder="Poznámka k aktivácii..."
                          />
                        </div>
                      )}
                    </div>

                    {/* Toggle */}
                    {toggleMutation.isPending ? (
                      <Loader2 className="size-5 text-muted-foreground animate-spin shrink-0" />
                    ) : (
                      <Switch
                        checked={isActive || isFree}
                        disabled={isFree}
                        onCheckedChange={(checked) => {
                          toggleMutation.mutate({
                            moduleId: mod.id,
                            status: checked ? 'active' : 'inactive',
                            note: localNotes[mod.id] || undefined,
                            expiresAt: localExpiry[mod.id] || undefined,
                          })
                        }}
                      />
                    )}
                  </div>

                  {/* Status badge */}
                  {mod._clientModule && (
                    <div className="mt-2 flex items-center gap-2">
                      {isActive ? (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-700 border-emerald-200">
                          <Unlock className="size-2.5 mr-0.5" />
                          {mod._clientModule.status === 'trial' ? 'Skúšobná doba' : 'Aktívny'}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground">
                          <Lock className="size-2.5 mr-0.5" />
                          Neaktívny
                        </Badge>
                      )}
                      {mod._clientModule.expiresAt && (
                        <span className="text-[10px] text-muted-foreground">
                          Expirácia: {format(new Date(mod._clientModule.expiresAt), 'dd.MM.yyyy', { locale: sk })}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        <DialogFooter>
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

export default function SuperadminClientsPage() {
  const { data: session } = useSession()
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['superadmin-clients'],
    queryFn: async () => {
      const res = await fetch('/api/admin/superadmin/clients')
      if (!res.ok) throw new Error('Chyba pri načítaní klientov')
      return res.json() as Promise<{ clients: ClientData[] }>
    },
  })

  const clients = data?.clients ?? []

  // Non-superadmin guard
  if (session?.user?.role !== 'SUPERADMIN') {
    return (
      <div className="text-center py-16">
        <Shield className="size-12 mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-semibold text-foreground">Prístup zamietnutý</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Táto sekcia je dostupná iba pre superadmina.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="size-5 text-brand" />
          <h1 className="text-2xl font-bold text-foreground">Správa klientov</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Správa modulov a licencií pre všetkých klientov ({clients.length} klientov)
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Celkovo klientov', value: clients.length, color: 'text-foreground' },
          { label: 'Aktívnych', value: clients.filter((c) => c.isActive).length, color: 'text-emerald-600' },
          {
            label: 'S modulmi',
            value: clients.filter((c) => c.activeModuleCount > 0).length,
            color: 'text-brand',
          },
          {
            label: 'Bez modulov',
            value: clients.filter((c) => c.activeModuleCount === 0).length,
            color: 'text-amber-600',
          },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-lg bg-white border">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Client table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 text-destructive text-sm">
          Nastala chyba pri načítaní klientov
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-16">
          <Users className="size-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">Žiadni klienti na zobrazenie</p>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meno</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Rola</TableHead>
                <TableHead className="hidden lg:table-cell">Stav</TableHead>
                <TableHead>Moduly</TableHead>
                <TableHead className="hidden lg:table-cell">Posledné prihlásenie</TableHead>
                <TableHead className="text-right">Akcie</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => {
                const pct = client.totalModules > 0 ? (client.activeModuleCount / client.totalModules) * 100 : 0
                return (
                  <TableRow key={client.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-foreground">{client.name}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">{client.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{client.email}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {ROLE_LABELS[client.role] || client.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`size-2 rounded-full ${
                            client.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                          }`}
                        />
                        <span className="text-xs text-muted-foreground">
                          {client.isActive ? 'Aktívny' : 'Neaktívny'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct === 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-brand' : 'bg-muted'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {client.activeModuleCount}/{client.totalModules}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                      {client.lastLoginAt
                        ? format(new Date(client.lastLoginAt), 'dd.MM.yyyy HH:mm', { locale: sk })
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => setSelectedClient(client)}
                      >
                        <Settings className="size-3.5 mr-1" />
                        Moduly
                        <ChevronRight className="size-3.5 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Module management dialog */}
      <ModuleManageDialog
        client={selectedClient}
        open={!!selectedClient}
        onClose={() => setSelectedClient(null)}
      />
    </div>
  )
}
