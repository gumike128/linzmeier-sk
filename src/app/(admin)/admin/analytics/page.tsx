'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Users, UserPlus, TrendingUp, BarChart3, Globe, FileText,
  Activity, Trophy, ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'

/* ─── Types ─── */
interface AnalyticsData {
  period: { days: number }
  timestamp: string
  kpis: {
    totalLeadsInRange: number
    newToday: number
    newThisWeek: number
    newThisMonth: number
    totalLeads: number
    conversionRate: number
    avgLeadScore: number
    activeUsers: number
    totalUsers: number
    publishedProducts: number
    publishedPosts: number
    aiInteractions: number
  }
  funnel: Record<string, number>
  sources: Record<string, { count: number; won: number }>
  customerTypes: Record<string, { count: number; won: number }>
  projectTypes: Record<string, number>
  dailyTrend: Array<{ date: string; new: number; won: number }>
  monthlyTrend: Array<{ month: string; leads: number; won: number }>
  scoreDistribution: Array<{ range: string; count: number }>
  assignment: {
    assigned: number
    unassigned: number
    byUser: Record<string, number>
  }
  activities: Record<string, number>
  utmSources: Record<string, number>
  recentWonLeads: Array<{
    id: string
    name: string
    customerType: string
    projectType: string
    score: number
    createdAt: string
  }>
}

/* ─── Colors ─── */
const AMBER = '#d97706'
const GREEN = '#22c55e'
const BRAND_DARK = '#1e293b'
const PURPLE = '#7c3aed'

const FUNNEL_COLORS: Record<string, string> = {
  NEW: '#3b82f6',
  CONTACTED: '#f59e0b',
  QUALIFIED: '#a855f7',
  PROPOSAL: '#6366f1',
  NEGOTIATION: '#f97316',
  WON: '#22c55e',
}

const FUNNEL_LABELS: Record<string, string> = {
  NEW: 'Nový',
  CONTACTED: 'Kontaktovaný',
  QUALIFIED: 'Kvalifikovaný',
  PROPOSAL: 'Ponuka',
  NEGOTIATION: 'Rokovanie',
  WON: 'Získaný',
}

const PIE_COLORS = [AMBER, GREEN, BRAND_DARK, PURPLE, '#ef4444', '#06b6d4', '#f59e0b', '#ec4899']

const SOURCE_LABELS: Record<string, string> = {
  web_form: 'Webový formulár',
  manual: 'Manuálne',
  neznámy: 'Neznámy',
}

const CUSTOMER_TYPE_LABELS: Record<string, string> = {
  firma: 'Firma',
  architekt: 'Architekt',
  investor: 'Investor',
  neurčené: 'Neurčené',
}

const PROJECT_TYPE_LABELS: Record<string, string> = {
  novostavba: 'Novostavba',
  rekonstrukcia: 'Rekonštrukcia',
  priemysel: 'Priemysel',
  nešpecifikované: 'Nešpecifikované',
}

const ACTIVITY_LABELS: Record<string, string> = {
  status_changed: 'Zmena stavu',
  note_added: 'Poznámka pridaná',
  lead_created: 'Lead vytvorený',
  lead_assigned: 'Lead priradený',
  ai_suggestion: 'AI návrh',
  lead_archived: 'Lead archivovaný',
}

const PERIOD_OPTIONS = [
  { days: 7, label: '7d' },
  { days: 30, label: '30d' },
  { days: 90, label: '90d' },
  { days: 365, label: '365d' },
]

/* ─── Helpers ─── */
function fmt(n: number): string {
  return n.toLocaleString('sk-SK')
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('sk-SK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/* ─── Skeleton Components ─── */
function KpiCardSkeleton() {
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
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <div className="flex gap-2">
          {PERIOD_OPTIONS.map((_, i) => (
            <Skeleton key={i} className="h-9 w-14 rounded-md" />
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <KpiCardSkeleton key={i} />)}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <Card className="border-border/40">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 rounded-lg border p-4">
                <Skeleton className="size-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ─── Custom Chart Tooltip ─── */
function ChartTooltipContent({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2.5 shadow-md text-sm">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-muted-foreground">
          <span className="inline-block size-2 rounded-full mr-1.5" style={{ backgroundColor: entry.color }} />
          {entry.name}: <span className="font-medium text-foreground">{fmt(entry.value)}</span>
        </p>
      ))}
    </div>
  )
}

/* ─── Custom Pie Label ─── */
function PieLabel({ name, percent }: { name: string; percent: number }) {
  return `${name} (${(percent * 100).toFixed(0)}%)`
}

/* ─── Custom Bar Label ─── */
function BarLabel({ x, y, width, value }: {
  x: number
  y: number
  width: number
  value: number
}) {
  return (
    <text
      x={x + width + 8}
      y={y + 14}
      textAnchor="start"
      fill="#64748b"
      fontSize={12}
    >
      {value}
    </text>
  )
}

/* ─── KPI Cards Config ─── */
const kpiCards = [
  {
    label: 'Leady v období',
    key: 'totalLeadsInRange' as const,
    icon: Users,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    label: 'Nové dnes',
    key: 'newToday' as const,
    icon: UserPlus,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    label: 'Konverzný pomer',
    key: 'conversionRate' as const,
    icon: TrendingUp,
    color: 'text-yellow-800',
    bg: 'bg-yellow-100',
    suffix: '%',
  },
  {
    label: 'Priemerné skóre',
    key: 'avgLeadScore' as const,
    icon: BarChart3,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    label: 'Aktívni používatelia',
    key: 'activeUsers' as const,
    icon: Globe,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    subtitleKey: 'totalUsers' as const,
    subtitle: 'z celkovo',
  },
  {
    label: 'Publikovaný obsah',
    key: 'publishedProducts' as const,
    icon: FileText,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    subtitleKey: 'publishedPosts' as const,
    subtitle: 'článkov',
  },
]

/* ─── Main Component ─── */
export default function AnalyticsPage() {
  const [period, setPeriod] = useState(30)

  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['analytics', period],
    queryFn: () => fetch(`/api/admin/analytics?period=${period}`).then(r => r.json()),
    refetchInterval: 60000,
  })

  if (isLoading) return <AnalyticsSkeleton />
  if (!data) return null

  /* ── Derived data ── */

  // Funnel (exclude LOST and total)
  const funnelData = Object.entries(data.funnel)
    .filter(([key]) => key !== 'LOST' && key !== 'total')
    .map(([key, count]) => ({
      name: FUNNEL_LABELS[key] || key,
      count,
      fill: FUNNEL_COLORS[key] || '#94a3b8',
    }))

  // Sources Pie
  const sourcesPie = Object.entries(data.sources).map(([key, val]) => ({
    name: SOURCE_LABELS[key] || key,
    value: val.count,
  }))

  // Monthly trend
  const monthlyData = data.monthlyTrend.map((m) => ({
    ...m,
    month: m.month.replace('-', '. '),
  }))

  // Score distribution
  const scoreData = data.scoreDistribution.map((d) => ({
    ...d,
    fill: BRAND_DARK,
  }))

  // UTM Sources
  const utmData = Object.entries(data.utmSources)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({
      name: key,
      count,
    }))

  // Activities
  const activityData = Object.entries(data.activities)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({
      name: ACTIVITY_LABELS[key] || key,
      count,
    }))

  // Assignment Pie
  const assignmentPie = [
    { name: 'Priradené', value: data.assignment.assigned },
    { name: 'Nepriradené', value: data.assignment.unassigned },
  ]

  const ASSIGNMENT_COLORS = [AMBER, '#94a3b8']

  // Project Types
  const projectTypeData = Object.entries(data.projectTypes)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({
      name: PROJECT_TYPE_LABELS[key] || key,
      count,
    }))

  return (
    <div className="space-y-6">
      {/* Page Header + Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytika</h1>
          <p className="text-muted-foreground mt-1">
            Komplexný prehľad výkonnosti CRM a obsahu
          </p>
        </div>
        <div className="flex gap-2">
          {PERIOD_OPTIONS.map((opt) => (
            <Button
              key={opt.days}
              variant={period === opt.days ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(opt.days)}
              className={period === opt.days ? 'bg-brand-dark hover:bg-brand-dark/90' : ''}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpiCards.map((card) => {
          const Icon = card.icon
          const value = data.kpis[card.key] ?? 0
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
                  {card.suffix ? `${value}${card.suffix}` : fmt(value)}
                </p>
                {card.subtitle && card.subtitleKey && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {fmt(data.kpis[card.subtitleKey])} {card.subtitle}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Row 1: Conversion Funnel + Lead Sources */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Conversion Funnel */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-lg">Konverzný lievik</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {funnelData.length > 0 && funnelData.some(d => d.count > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={funnelData}
                    layout="vertical"
                    margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 12, fill: '#334155' }}
                      axisLine={false}
                      tickLine={false}
                      width={100}
                    />
                    <Tooltip
                      content={<ChartTooltipContent />}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={32} name="Leadov">
                      {funnelData.map((entry, index) => (
                        <Cell key={`funnel-${index}`} fill={entry.fill} />
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

        {/* Lead Sources Pie */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-lg">Zdroje leadov</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {sourcesPie.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourcesPie}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={3}
                      dataKey="value"
                      label={PieLabel}
                      labelLine={{ stroke: '#94a3b8' }}
                    >
                      {sourcesPie.map((_entry, index) => (
                        <Cell
                          key={`source-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [`${fmt(value)} leadov`, name]}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '13px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      formatter={(value: string) => (
                        <span className="text-xs text-muted-foreground">{value}</span>
                      )}
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

      {/* Row 2: Monthly Trend + Score Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Trend Line Chart */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-lg">Mesačný trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="month"
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
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '12px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="leads"
                      stroke={AMBER}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: AMBER, stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: AMBER, stroke: '#fff', strokeWidth: 2 }}
                      name="Leady"
                    />
                    <Line
                      type="monotone"
                      dataKey="won"
                      stroke={GREEN}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: GREEN, stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: GREEN, stroke: '#fff', strokeWidth: 2 }}
                      name="Získané"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  Žiadne dáta pre toto obdobie
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-lg">Distribúcia skóre</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {scoreData.some(d => d.count > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={scoreData}
                    layout="vertical"
                    margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="range"
                      tick={{ fontSize: 12, fill: '#334155' }}
                      axisLine={false}
                      tickLine={false}
                      width={50}
                    />
                    <Tooltip content={<ChartTooltipContent />} cursor={{ fill: '#f8fafc' }} />
                    <Bar
                      dataKey="count"
                      fill={BRAND_DARK}
                      radius={[0, 6, 6, 0]}
                      maxBarSize={32}
                      name="Leadov"
                      label={BarLabel}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  Žiadne skóre k zobrazeniu
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: UTM Sources + Activity Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* UTM Sources */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-lg">UTM zdroje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {utmData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={utmData}
                    layout="vertical"
                    margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 12, fill: '#334155' }}
                      axisLine={false}
                      tickLine={false}
                      width={90}
                    />
                    <Tooltip content={<ChartTooltipContent />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={32} name="Leadov">
                      {utmData.map((_entry, index) => (
                        <Cell key={`utm-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  Žiadne UTM dáta
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity Breakdown */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-lg">Aktivity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {activityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={activityData}
                    layout="vertical"
                    margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 12, fill: '#334155' }}
                      axisLine={false}
                      tickLine={false}
                      width={110}
                    />
                    <Tooltip content={<ChartTooltipContent />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={32} name="Počet">
                      {activityData.map((_entry, index) => (
                        <Cell key={`activity-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  Žiadne aktivity v tomto období
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Assignment Pie + Project Types */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Assignment Pie */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-lg">Priradenie leadov</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {(data.assignment.assigned + data.assignment.unassigned) > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assignmentPie}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={3}
                      dataKey="value"
                      label={PieLabel}
                      labelLine={{ stroke: '#94a3b8' }}
                    >
                      {assignmentPie.map((_entry, index) => (
                        <Cell key={`assign-${index}`} fill={ASSIGNMENT_COLORS[index]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [`${fmt(value)} leadov`, name]}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '13px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      formatter={(value: string) => (
                        <span className="text-xs text-muted-foreground">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  Žiadne dáta o priradení
                </div>
              )}
            </div>
            {/* Summary row */}
            <div className="flex items-center justify-center gap-6 mt-2 pt-4 border-t border-border/40">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-800">{fmt(data.assignment.assigned)}</p>
                <p className="text-xs text-muted-foreground">Priradené</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-muted-foreground">{fmt(data.assignment.unassigned)}</p>
                <p className="text-xs text-muted-foreground">Nepriradené</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Types */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-lg">Typy projektov</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {projectTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={projectTypeData}
                    layout="vertical"
                    margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 12, fill: '#334155' }}
                      axisLine={false}
                      tickLine={false}
                      width={110}
                    />
                    <Tooltip content={<ChartTooltipContent />} cursor={{ fill: '#f8fafc' }} />
                    <Bar
                      dataKey="count"
                      fill={BRAND_DARK}
                      radius={[0, 6, 6, 0]}
                      maxBarSize={32}
                      name="Projektov"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  Žiadne dáta o typoch projektov
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Won Leads */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="size-5 text-yellow-800" />
            Nedávno získané leady
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentWonLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Trophy className="size-12 opacity-20 mb-3" />
              <p className="text-sm">Žiadne získané leady v tomto období</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.recentWonLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-start gap-4 rounded-lg border border-border/40 p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => {
                    window.location.href = `/admin/crm/leads/${lead.id}`
                  }}
                >
                  {/* Avatar */}
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 font-semibold text-sm">
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{lead.name}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {lead.customerType && (
                        <Badge variant="secondary" className="text-xs">
                          {CUSTOMER_TYPE_LABELS[lead.customerType] || lead.customerType}
                        </Badge>
                      )}
                      {lead.projectType && (
                        <Badge variant="outline" className="text-xs">
                          {PROJECT_TYPE_LABELS[lead.projectType] || lead.projectType}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {lead.score != null && lead.score > 0 && (
                        <span className="flex items-center gap-1">
                          <BarChart3 className="size-3" />
                          Skóre: <span className="font-medium text-foreground">{lead.score}</span>
                        </span>
                      )}
                      <span>{formatDate(lead.createdAt)}</span>
                    </div>
                  </div>
                  {/* Arrow */}
                  <ArrowRight className="size-4 text-muted-foreground/50 shrink-0 mt-1" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer info */}
      <div className="text-center text-xs text-muted-foreground py-2">
        Dáta aktualizované: {formatDate(data.timestamp)} · Obdobie: {data.period.days} dní
      </div>
    </div>
  )
}
