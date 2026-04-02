'use client'

import { useQuery } from '@tanstack/react-query'
import {
  UserPlus, Users, TrendingUp, Bot, Clock, UserCheck,
  MessageSquare, Pencil, ArrowUpRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/admin/StatusBadge'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts'
import type { DashboardStats } from '@/types'

/* ─── Colors ─── */
const STATUS_COLORS_MAP: Record<string, string> = {
  NEW: '#3b82f6',
  CONTACTED: '#f59e0b',
  QUALIFIED: '#a855f7',
  PROPOSAL: '#6366f1',
  NEGOTIATION: '#f97316',
  WON: '#22c55e',
  LOST: '#ef4444',
}

const TYPE_COLORS = ['#1e293b', '#d97706', '#059669', '#94a3b8']

const WEEKLY_BAR_COLOR = '#1e293b'

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '13px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
  },
}

const STATUS_LABELS: Record<string, string> = {
  NEW: 'Nový',
  CONTACTED: 'Kontaktovaný',
  QUALIFIED: 'Kvalifikovaný',
  PROPOSAL: 'Ponuka',
  NEGOTIATION: 'Rokovanie',
  WON: 'Získaný',
  LOST: 'Stratený',
}

/* ─── Helpers ─── */
function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Práve teraz'
  if (diffMin < 60) return `pred ${diffMin} min`
  if (diffHr < 24) return `pred ${diffHr} hod`
  if (diffDay < 7) return `pred ${diffDay} dňami`
  return date.toLocaleDateString('sk-SK')
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'lead_created': return <UserPlus className="size-4 text-blue-500" />
    case 'status_changed': return <ArrowUpRight className="size-4 text-yellow-800" />
    case 'note_added': return <Pencil className="size-4 text-green-500" />
    case 'lead_assigned': return <UserCheck className="size-4 text-purple-500" />
    case 'ai_suggestion': return <Bot className="size-4 text-violet-500" />
    case 'lead_archived': return <MessageSquare className="size-4 text-red-500" />
    default: return <Clock className="size-4 text-muted-foreground" />
  }
}

/* ─── Stat Cards Config ─── */
const statCards = [
  { key: 'newLeadsToday' as const, label: 'Nové leady dnes', icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  { key: 'totalLeads' as const, label: 'Celkom leadov', icon: Users, color: 'text-brand-dark', bg: 'bg-brand-dark/5', border: 'border-brand-dark/10' },
  { key: 'conversionRate' as const, label: 'Konverzný pomer', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', suffix: '%' },
  { key: 'aiInteractions' as const, label: 'AI interakcie', icon: Bot, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
]

/* ─── Skeletons ─── */
function StatCardSkeleton() {
  return (
    <Card className="border-border/40">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="size-10 rounded-lg" />
        </div>
        <Skeleton className="mt-3 h-8 w-20" />
      </CardContent>
    </Card>
  )
}

function ChartSkeleton() {
  return (
    <Card className="border-border/40">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[260px] w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-border/40">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 border-border/40">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ─── Custom Tooltip for Line/Bar charts ─── */
function ChartTooltip({ active, payload, label, unit }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
  unit?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-md text-sm">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground">
        {payload[0].value} {unit || 'leadov'}
      </p>
    </div>
  )
}

/* ─── Custom Label for Pie chart ─── */
function PieLabel({ name, percent }: { name: string; percent: number }) {
  return `${name} (${(percent * 100).toFixed(0)}%)`
}

/* ─── Main Component ─── */
export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => fetch('/api/admin/dashboard/stats').then(r => r.json()),
    refetchInterval: 30000,
  })

  if (isLoading) return <DashboardSkeleton />

  // Transform chart data
  const trendData = data?.leadsByMonth
    ? Object.entries(data.leadsByMonth).map(([name, leads]) => ({ name, leads }))
    : []

  const customerTypeData = data?.leadsByCustomerType
    ? Object.entries(data.leadsByCustomerType).map(([name, value]) => ({ name, value }))
    : []

  const statusData = data?.leadsByStatus
    ? Object.entries(data.leadsByStatus)
        .filter(([key]) => key !== 'LOST')
        .map(([key, count]) => ({
          name: STATUS_LABELS[key] || key,
          count,
          fill: STATUS_COLORS_MAP[key] || '#94a3b8',
        }))
    : []

  const dayOrder = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne']
  const weeklyData = data?.weeklyLeads
    ? dayOrder.map((day) => ({ name: day, leads: data.weeklyLeads[day] || 0 }))
    : []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Prehľad kľúčových metrík a aktivít
        </p>
      </div>

      {/* Row 1: Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          const value = data?.[card.key] ?? 0
          return (
            <Card key={card.key} className={`border-border/40 ${card.bg}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                  <div className={`rounded-lg bg-background/80 p-2 ${card.color}`}>
                    <Icon className="size-5" />
                  </div>
                </div>
                <p className="text-3xl font-bold mt-3">
                  {card.suffix ? `${value}${card.suffix}` : value}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Row 2: Lead Trend + Customer Type */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Lead Trend Line Chart */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-lg">Trend leadov (6 mesiacov)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip unit="leadov" />} />
                    <Line
                      type="monotone"
                      dataKey="leads"
                      stroke="#d97706"
                      strokeWidth={2.5}
                      dot={{ r: 5, fill: '#d97706', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 7, fill: '#d97706', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  Žiadne dáta
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Leads by Customer Type Pie Chart */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-lg">Podľa typu zákazníka</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {customerTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={customerTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      label={PieLabel}
                      labelLine={{ stroke: '#94a3b8' }}
                    >
                      {customerTypeData.map((_entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={TYPE_COLORS[index % TYPE_COLORS.length]}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [`${value} leadov`, name]}
                      {...tooltipStyle}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  Žiadne dáta
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Status Bar Chart + Weekly Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Leads by Status Bar Chart */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-lg">Podľa stavu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip unit="leadov" />} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  Žiadne dáta
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Activity Bar Chart */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-lg">Týždenná aktivita</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {weeklyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip unit="leadov" />} />
                    <Bar
                      dataKey="leads"
                      fill={WEEKLY_BAR_COLOR}
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  Žiadne dáta
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Recent Leads Table + Activity Feed */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Leads Table */}
        <Card className="lg:col-span-4 border-border/40">
          <CardHeader>
            <CardTitle className="text-lg">Najnovšie leady</CardTitle>
          </CardHeader>
          <CardContent>
            {(!data?.recentLeads || data.recentLeads.length === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-8">Žiadne leady</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meno</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead className="hidden md:table-cell">Typ</TableHead>
                    <TableHead>Stav</TableHead>
                    <TableHead className="hidden lg:table-cell">Dátum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentLeads.map((lead) => (
                    <TableRow
                      key={lead.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => window.location.href = `/admin/crm/leads/${lead.id}`}
                    >
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">{lead.email}</TableCell>
                      <TableCell className="hidden md:table-cell capitalize text-muted-foreground">{lead.customerType}</TableCell>
                      <TableCell><StatusBadge status={lead.status} /></TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                        {formatTimeAgo(lead.createdAt.toString())}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="lg:col-span-3 border-border/40">
          <CardHeader>
            <CardTitle className="text-lg">Aktivity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0 max-h-96 overflow-y-auto">
              {(!data?.recentActivities || data.recentActivities.length === 0) ? (
                <p className="text-sm text-muted-foreground text-center py-8">Žiadne aktivity</p>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
                  {data.recentActivities.map((activity) => (
                    <div key={activity.id} className="relative flex gap-4 pb-4 last:pb-0">
                      <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-background border border-border">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-sm text-foreground leading-snug">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{activity.user?.name || 'Systém'}</span>
                          <span className="text-xs text-muted-foreground/50">·</span>
                          <span className="text-xs text-muted-foreground">{formatTimeAgo(activity.createdAt.toString())}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
