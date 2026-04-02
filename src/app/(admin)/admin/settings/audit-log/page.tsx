'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AuditLogEntry {
  id: string
  userId: string
  action: string
  entityType: string
  entityId: string | null
  details: string | null
  ipAddress: string | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

interface AuditLogResponse {
  logs: AuditLogEntry[]
  total: number
  page: number
  totalPages: number
}

interface UserOption {
  id: string
  name: string
  email: string
  role: string
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ENTITY_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Všetky' },
  { value: 'lead', label: 'Lead' },
  { value: 'product', label: 'Produkt' },
  { value: 'blog_post', label: 'Blog' },
  { value: 'reference', label: 'Referencia' },
  { value: 'document', label: 'Dokument' },
  { value: 'user', label: 'Užívateľ' },
  { value: 'automation', label: 'Automatizácia' },
  { value: 'setting', label: 'Nastavenie' },
]

const ENTITY_TYPE_LABELS: Record<string, string> = {
  lead: 'Lead',
  product: 'Produkt',
  blog_post: 'Blog',
  reference: 'Referencia',
  document: 'Dokument',
  user: 'Užívateľ',
  automation: 'Automatizácia',
  setting: 'Nastavenie',
}

const ENTITY_TYPE_COLORS: Record<string, string> = {
  lead: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  product: 'bg-sky-100 text-sky-700 border-sky-200',
  blog_post: 'bg-violet-100 text-violet-700 border-violet-200',
  reference: 'bg-teal-100 text-teal-700 border-teal-200',
  document: 'bg-orange-100 text-orange-700 border-orange-200',
  user: 'bg-pink-100 text-pink-700 border-pink-200',
  automation: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  setting: 'bg-gray-100 text-gray-700 border-gray-200',
}

const ACTION_COLORS: Record<string, string> = {
  created: 'bg-green-100 text-green-700 border-green-200',
  updated: 'bg-blue-100 text-blue-700 border-blue-200',
  deleted: 'bg-red-100 text-red-700 border-red-200',
  viewed: 'bg-gray-100 text-gray-600 border-gray-200',
  exported: 'bg-purple-100 text-purple-700 border-purple-200',
  login: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  assigned: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  status_change: 'bg-orange-100 text-orange-700 border-orange-200',
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrátor',
  SALES: 'Obchodník',
  MARKETING: 'Marketing',
  TECHNICIAN: 'Technik',
  PARTNER: 'Partner',
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  SALES: 'bg-blue-100 text-blue-700',
  MARKETING: 'bg-purple-100 text-purple-700',
  TECHNICIAN: 'bg-yellow-100 text-yellow-800',
  PARTNER: 'bg-gray-100 text-gray-700',
}

const PERIOD_OPTIONS = [
  { value: '', label: 'Všetko' },
  { value: '7', label: '7 dní' },
  { value: '30', label: '30 dní' },
  { value: '90', label: '90 dní' },
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return 'pred chvíľou'
  if (diffMin < 60) return `pred ${diffMin} min`
  if (diffHr < 24) return `pred ${diffHr} hod`
  if (diffDay < 7) return `pred ${diffDay} dň${diffDay === 1 ? '' : diffDay < 5 ? 'ami' : 'mi'}`
  return date.toLocaleDateString('sk-SK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function truncate(str: string | null, maxLen: number): string {
  if (!str) return '—'
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen) + '...'
}

function tryParseJson(str: string | null): string | null {
  if (!str) return null
  try {
    const obj = JSON.parse(str)
    return typeof obj === 'object' ? Object.entries(obj)
      .map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
      .join(', ') : str
  } catch {
    return str
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AuditLogPage() {
  /* ---- Filters ---- */
  const [page, setPage] = useState(1)
  const [entityType, setEntityType] = useState('')
  const [action, setAction] = useState('')
  const [userId, setUserId] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [period, setPeriod] = useState('')

  /* ---- Users for select ---- */
  const { data: usersData } = useQuery<{ users: UserOption[] }>({
    queryKey: ['admin-users-select'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users')
      if (!res.ok) throw new Error('Chyba pri načítavaní používateľov')
      return res.json()
    },
  })
  const users = usersData?.users ?? []

  /* ---- Fetch logs ---- */
  const { data, isLoading } = useQuery<AuditLogResponse>({
    queryKey: ['audit-log', page, entityType, action, userId, search, period],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '50')
      if (entityType) params.set('entityType', entityType)
      if (action) params.set('action', action)
      if (userId) params.set('userId', userId)
      if (search) params.set('search', search)
      if (period) params.set('period', period)

      const res = await fetch(`/api/admin/audit-log?${params.toString()}`)
      if (!res.ok) throw new Error('Chyba pri načítavaní audit logu')
      return res.json()
    },
  })

  const logs = data?.logs ?? []
  const totalPages = data?.totalPages ?? 0
  const total = data?.total ?? 0

  /* ---- Derived action options from data ---- */
  const uniqueActions = useMemo(() => {
    const actions = new Set<string>()
    for (const log of logs) {
      actions.add(log.action)
    }
    return Array.from(actions).sort()
  }, [logs])

  /* ---- Handlers ---- */
  function handleSearch() {
    setSearch(searchInput)
    setPage(1)
  }

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  function handleClearSearch() {
    setSearchInput('')
    setSearch('')
    setPage(1)
  }

  function handleEntityTypeChange(val: string) {
    setEntityType(val === '' ? '' : val)
    setPage(1)
  }

  function handleUserChange(val: string) {
    setUserId(val === '' ? '' : val)
    setPage(1)
  }

  function handlePeriodChange(val: string) {
    setPeriod(val === '' ? '' : val)
    setPage(1)
  }

  function handleClearFilters() {
    setEntityType('')
    setAction('')
    setUserId('')
    setSearch('')
    setSearchInput('')
    setPeriod('')
    setPage(1)
  }

  const hasActiveFilters = entityType || action || userId || search || period

  /* ---- Pagination ---- */
  function goToPage(p: number) {
    if (p >= 1 && p <= totalPages) setPage(p)
  }

  const paginationRange = useMemo(() => {
    const range: number[] = []
    const start = Math.max(1, page - 2)
    const end = Math.min(totalPages, page + 2)
    for (let i = start; i <= end; i++) range.push(i)
    return range
  }, [page, totalPages])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Audit Log
        </h2>
        <p className="text-muted-foreground mt-1">
          Prehľad všetkých administrátorských akcií v systéme.
        </p>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10">
              <FileText className="size-5 text-brand" />
            </div>
            <div>
              <CardTitle className="text-lg">Záznamy aktivít</CardTitle>
              <CardDescription>
                {total > 0
                  ? `Celkom ${total} záznam${total === 1 ? '' : total < 5 ? 'y' : 'ov'}`
                  : 'Žiadne záznamy'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-end gap-3">
            {/* Entity Type */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Typ entity
              </label>
              <Select
                value={entityType}
                onValueChange={handleEntityTypeChange}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Všetky" />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value || '_all'}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Akcia
              </label>
              <Input
                value={action}
                onChange={(e) => {
                  setAction(e.target.value)
                  setPage(1)
                }}
                placeholder="napr. created"
                className="w-[140px] h-9"
              />
            </div>

            {/* User */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Používateľ
              </label>
              <Select value={userId} onValueChange={handleUserChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Všetci" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Všetci</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Hľadať
              </label>
              <div className="flex gap-1">
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="detaily..."
                  className="w-[160px] h-9"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSearch}
                  className="h-9 px-3"
                >
                  <Search className="size-3.5" />
                </Button>
              </div>
            </div>

            {/* Period */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Obdobie
              </label>
              <div className="flex gap-1">
                {PERIOD_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    size="sm"
                    variant={period === opt.value ? 'default' : 'outline'}
                    onClick={() => handlePeriodChange(opt.value)}
                    className="h-9 px-3 text-xs"
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Clear */}
            {hasActiveFilters && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-transparent">
                  &nbsp;
                </label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClearFilters}
                  className="h-9 text-xs text-muted-foreground"
                >
                  <Filter className="size-3.5" />
                  Zrušiť filtre
                </Button>
              </div>
            )}
          </div>

          {/* Table */}
          {isLoading ? (
            <AuditLogSkeleton />
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Clock className="size-10 mb-3 opacity-40" />
              <p className="text-sm">
                {hasActiveFilters
                  ? 'Žiadne záznamy nezodpovedajú filtrom'
                  : 'Zatiaľ žiadne záznamy v audit logu'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border/50 max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Čas</TableHead>
                    <TableHead className="w-[200px]">Používateľ</TableHead>
                    <TableHead className="w-[120px]">Akcia</TableHead>
                    <TableHead className="w-[130px]">Entita</TableHead>
                    <TableHead>Detaily</TableHead>
                    <TableHead className="w-[130px] hidden lg:table-cell">
                      IP Adresa
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      {/* Time */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                          <Clock className="size-3" />
                          {timeAgo(log.createdAt)}
                        </div>
                      </TableCell>

                      {/* User */}
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium">
                            {log.user.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {log.user.email}
                          </span>
                          <Badge
                            className={`self-start text-[10px] px-1.5 py-0 ${
                              ROLE_COLORS[log.user.role] || ROLE_COLORS.PARTNER
                            }`}
                          >
                            {ROLE_LABELS[log.user.role] || log.user.role}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Action */}
                      <TableCell>
                        <Badge
                          className={`${
                            ACTION_COLORS[log.action] ||
                            'bg-gray-100 text-gray-600 border-gray-200'
                          }`}
                        >
                          {log.action}
                        </Badge>
                      </TableCell>

                      {/* Entity Type */}
                      <TableCell>
                        <Badge
                          className={`${
                            ENTITY_TYPE_COLORS[log.entityType] ||
                            'bg-gray-100 text-gray-600 border-gray-200'
                          }`}
                        >
                          {ENTITY_TYPE_LABELS[log.entityType] || log.entityType}
                        </Badge>
                      </TableCell>

                      {/* Details */}
                      <TableCell className="text-xs text-muted-foreground font-mono max-w-[300px]">
                        {truncate(tryParseJson(log.details), 80)}
                      </TableCell>

                      {/* IP Address */}
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {log.ipAddress || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Strana {page} z {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="size-4" />
                </Button>

                {paginationRange[0] > 1 && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => goToPage(1)}
                      className="h-8 w-8 p-0"
                    >
                      1
                    </Button>
                    {paginationRange[0] > 2 && (
                      <span className="text-muted-foreground text-sm px-1">
                        ...
                      </span>
                    )}
                  </>
                )}

                {paginationRange.map((p) => (
                  <Button
                    key={p}
                    size="sm"
                    variant={p === page ? 'default' : 'outline'}
                    onClick={() => goToPage(p)}
                    className="h-8 w-8 p-0"
                  >
                    {p}
                  </Button>
                ))}

                {paginationRange[paginationRange.length - 1] < totalPages && (
                  <>
                    {paginationRange[paginationRange.length - 1] < totalPages - 1 && (
                      <span className="text-muted-foreground text-sm px-1">
                        ...
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => goToPage(totalPages)}
                      className="h-8 w-8 p-0"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* ================================================================== */
/*  Skeleton                                                           */
/* ================================================================== */

function AuditLogSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Skeleton className="h-8 w-[160px]" />
        <Skeleton className="h-8 w-[140px]" />
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-8 w-[180px]" />
      </div>
      <div className="overflow-x-auto rounded-lg border border-border/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Čas</TableHead>
              <TableHead className="w-[200px]">Používateľ</TableHead>
              <TableHead className="w-[120px]">Akcia</TableHead>
              <TableHead className="w-[130px]">Entita</TableHead>
              <TableHead>Detaily</TableHead>
              <TableHead className="w-[130px] hidden lg:table-cell">
                IP Adresa
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-[90px]" />
                </TableCell>
                <TableCell>
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-3 w-[140px]" />
                    <Skeleton className="h-4 w-[70px] rounded-full" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-[70px] rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-[80px] rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[200px]" />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
