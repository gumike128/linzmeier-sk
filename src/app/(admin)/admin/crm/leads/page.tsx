'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Users, Inbox, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ScoreBadge } from '@/components/admin/ScoreBadge'
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '@/lib/rbac'
import type { LeadStatus, LeadPriority } from '@/types'

const CUSTOMER_TYPE_LABELS: Record<string, string> = {
  architekt: 'Architekt',
  firma: 'Firma',
  investor: 'Investor',
  other: 'Iné',
}

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Nízka',
  normal: 'Normálna',
  high: 'Vysoká',
  urgent: 'Urgentná',
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'Všetky' },
  { value: 'NEW', label: 'Nové' },
  { value: 'CONTACTED', label: 'Kontaktovaný' },
  { value: 'QUALIFIED', label: 'Kvalifikovaný' },
  { value: 'PROPOSAL', label: 'Ponuka' },
  { value: 'NEGOTIATION', label: 'Rokovanie' },
  { value: 'WON', label: 'Získaný' },
  { value: 'LOST', label: 'Stratený' },
]

function LeadsTableSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
        <div className="flex-1 min-w-[200px]">
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
      <Card className="border-border/40">
        <CardContent className="p-0">
          <div className="space-y-0">
            <div className="flex items-center gap-4 p-4 border-b">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
              ))}
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border-b last:border-0">
                {Array.from({ length: 7 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 flex-1" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LeadsListPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  const currentStatus = searchParams.get('status') || ''
  const currentSearch = searchParams.get('search') || ''
  const currentPage = Number(searchParams.get('page')) || 1

  const [searchInput, setSearchInput] = useState(currentSearch)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    customerType: '' as string,
    projectType: '' as string,
    message: '',
  })
  const [creating, setCreating] = useState(false)

  const buildQuery = useCallback((overrides?: { status?: string; search?: string; page?: number }) => {
    const params = new URLSearchParams()
    const s = overrides?.status !== undefined ? overrides.status : currentStatus
    const q = overrides?.search !== undefined ? overrides.search : currentSearch
    const p = overrides?.page !== undefined ? overrides.page : currentPage
    if (s) params.set('status', s)
    if (q) params.set('search', q)
    if (p > 1) params.set('page', String(p))
    return params.toString()
  }, [currentStatus, currentSearch, currentPage])

  const { data, isLoading } = useQuery({
    queryKey: ['leads', currentStatus, currentSearch, currentPage],
    queryFn: () => {
      const params = buildQuery()
      return fetch(`/api/admin/leads${params ? `?${params}` : ''}`).then(r => r.json())
    },
  })

  const updateParams = useCallback((updates: { status?: string; search?: string; page?: number }) => {
    const params = new URLSearchParams()
    const s = updates.status !== undefined ? updates.status : currentStatus
    const q = updates.search !== undefined ? updates.search : currentSearch
    const p = updates.page !== undefined ? updates.page : 1
    if (s) params.set('status', s)
    if (q) params.set('search', q)
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    router.push(qs ? `/admin/crm/leads?${qs}` : '/admin/crm/leads')
  }, [currentStatus, currentSearch, router])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams({ search: searchInput, page: 1 })
  }

  const handleCreateLead = async () => {
    if (!createForm.name || !createForm.email || !createForm.message || !createForm.customerType) return
    setCreating(true)
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          phone: createForm.phone || undefined,
          company: createForm.company || undefined,
          projectType: createForm.projectType || undefined,
        }),
      })
      if (res.ok) {
        setDialogOpen(false)
        setCreateForm({ name: '', email: '', phone: '', company: '', customerType: '', projectType: '', message: '' })
        queryClient.invalidateQueries({ queryKey: ['leads'] })
      }
    } catch {
      // Error handled silently for now
    } finally {
      setCreating(false)
    }
  }

  if (isLoading) return <LeadsTableSkeleton />

  const leads = data?.leads || []
  const total = data?.total || 0
  const totalPages = data?.totalPages || 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leady</h1>
          <p className="text-muted-foreground mt-1">
            {total} {total === 1 ? 'lead' : total < 5 ? 'leadov' : 'leadov'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a
              href={`/api/admin/leads/export?status=${currentStatus}&search=${currentSearch}`}
              download
            >
              <Download className="size-4 mr-2" />
              Export CSV
            </a>
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-warm hover:bg-warm-dark text-white">
                <Plus className="size-4 mr-2" />
                Nový lead
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nový lead</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Meno *</Label>
                  <Input
                    placeholder="Meno a priezvisko"
                    value={createForm.name}
                    onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={createForm.email}
                    onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefón</Label>
                  <Input
                    placeholder="+421 ..."
                    value={createForm.phone}
                    onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Firma</Label>
                  <Input
                    placeholder="Názov firmy"
                    value={createForm.company}
                    onChange={e => setCreateForm(f => ({ ...f, company: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Typ zákazníka *</Label>
                  <Select value={createForm.customerType} onValueChange={v => setCreateForm(f => ({ ...f, customerType: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte typ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="architekt">Architekt</SelectItem>
                      <SelectItem value="firma">Firma</SelectItem>
                      <SelectItem value="investor">Investor</SelectItem>
                      <SelectItem value="other">Iné</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Typ projektu</Label>
                  <Select value={createForm.projectType} onValueChange={v => setCreateForm(f => ({ ...f, projectType: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte typ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="novostavba">Novostavba</SelectItem>
                      <SelectItem value="rekonstrukcia">Rekonštrukcia</SelectItem>
                      <SelectItem value="priemysel">Priemysel</SelectItem>
                      <SelectItem value="other">Iné</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Správa *</Label>
                <Textarea
                  placeholder="Popis projektu alebo požiadavky..."
                  rows={4}
                  value={createForm.message}
                  onChange={e => setCreateForm(f => ({ ...f, message: e.target.value }))}
                />
              </div>
              <Button
                className="w-full bg-warm hover:bg-warm-dark text-white"
                disabled={creating || !createForm.name || !createForm.email || !createForm.message || !createForm.customerType}
                onClick={handleCreateLead}
              >
                {creating ? 'Vytváram...' : 'Vytvoriť lead'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => updateParams({ status: filter.value, page: 1 })}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                currentStatus === filter.value
                  ? 'bg-brand-dark text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px] max-w-sm ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Hľadať podľa mena, emailu..."
              className="pl-9"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
          </div>
        </form>
      </div>

      {/* Table */}
      <Card className="border-border/40">
        <CardContent className="p-0">
          {leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <div className="rounded-full bg-muted p-4 mb-4">
                {currentSearch ? (
                  <Search className="size-6" />
                ) : (
                  <Inbox className="size-6" />
                )}
              </div>
              <p className="text-lg font-medium">Žiadne leady</p>
              <p className="text-sm mt-1">
                {currentSearch
                  ? `Neboli nájdené žiadne výsledky pre "${currentSearch}"`
                  : 'Zatiaľ nemáte žiadne leady v tejto kategórii'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Meno</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead className="hidden lg:table-cell">Typ</TableHead>
                      <TableHead>Stav</TableHead>
                      <TableHead className="hidden lg:table-cell">Priorita</TableHead>
                      <TableHead className="hidden xl:table-cell">Priradený</TableHead>
                      <TableHead className="hidden lg:table-cell">Skóre</TableHead>
                      <TableHead className="hidden sm:table-cell">Dátum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead: Record<string, unknown>) => {
                      const l = lead as {
                        id: string; name: string; email: string; customerType: string;
                        status: string; priority: string; createdAt: string;
                        score: number | null; scoreDetails: string | null;
                        assignedTo?: { id: string; name: string } | null;
                      }
                      return (
                        <TableRow
                          key={l.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => router.push(`/admin/crm/leads/${l.id}`)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex size-8 items-center justify-center rounded-full bg-brand-dark/10 text-brand-dark text-xs font-bold shrink-0">
                                {l.name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{l.name}</p>
                                <p className="text-xs text-muted-foreground md:hidden">{l.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{l.email}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge variant="outline" className="font-normal">
                              {CUSTOMER_TYPE_LABELS[l.customerType] || l.customerType}
                            </Badge>
                          </TableCell>
                          <TableCell><StatusBadge status={l.status} /></TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge className={PRIORITY_COLORS[l.priority] || PRIORITY_COLORS.normal}>
                              {PRIORITY_LABELS[l.priority] || l.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell text-muted-foreground text-sm">
                            {l.assignedTo?.name || (
                              <span className="text-muted-foreground/50">—</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <ScoreBadge score={l.score} scoreDetails={l.scoreDetails} />
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                            {new Date(l.createdAt).toLocaleDateString('sk-SK', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    Strana {currentPage} z {totalPages} ({total} leadov)
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => updateParams({ page: currentPage - 1 })}
                    >
                      Predošlá
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => updateParams({ page: currentPage + 1 })}
                    >
                      Ďalšia
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
