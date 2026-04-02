'use client'

import { useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Bot, Clock, Mail, Phone, Building2, MapPin,
  UserPlus, ArrowUpRight, Pencil, UserCheck, MessageSquare,
  Send, Sparkles, Package, Globe, Loader2, Bell, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ScorePanel } from '@/components/admin/ScorePanel'
import { LEAD_STATUS_LABELS, LEAD_STATUS_FLOW } from '@/lib/rbac'
import { toast } from 'sonner'

const CUSTOMER_TYPE_LABELS: Record<string, string> = {
  architekt: 'Architekt',
  firma: 'Firma',
  investor: 'Investor',
  other: 'Iné',
}

const PROJECT_TYPE_LABELS: Record<string, string> = {
  novostavba: 'Novostavba',
  rekonstrukcia: 'Rekonštrukcia',
  priemysel: 'Priemysel',
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

const SOURCE_LABELS: Record<string, string> = {
  web_form: 'Webový formulár',
  manual: 'Manuálne',
  referral: 'Odporúčanie',
  email: 'E-mail',
  phone: 'Telefón',
}

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

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('sk-SK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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

interface LeadDetail {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  customerType: string
  projectType: string | null
  message: string
  source: string
  status: string
  priority: string
  score: number | null
  scoreDetails: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmContent: string | null
  reminderAt: string | null
  assignedTo: { id: string; name: string; email: string } | null
  createdAt: string
  updatedAt: string
  notes: {
    id: string
    content: string
    createdAt: string
    author: { id: string; name: string }
  }[]
  activities: {
    id: string
    type: string
    description: string
    createdAt: string
    user: { id: string; name: string }
  }[]
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-9" />
        <div>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32 mt-1" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-24" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          <Card><CardContent className="p-6"><div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}</div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}</div></CardContent></Card>
        </div>
        <div className="lg:col-span-2">
          <Card><CardContent className="p-6"><div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}</div></CardContent></Card>
        </div>
      </div>
    </div>
  )
}

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const leadId = params.id as string

  const [noteText, setNoteText] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [suggesting, setSuggesting] = useState(false)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [reminderDate, setReminderDate] = useState('')
  const [savingReminder, setSavingReminder] = useState(false)

  const { data: lead, isLoading } = useQuery<LeadDetail>({
    queryKey: ['lead', leadId],
    queryFn: () => fetch(`/api/admin/leads/${leadId}`).then(r => {
      if (!r.ok) throw new Error('Lead not found')
      return r.json()
    }),
    enabled: !!leadId,
  })

  const handleStatusChange = useCallback(async (newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['lead', leadId] })
        queryClient.invalidateQueries({ queryKey: ['leads'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
        toast.success('Stav leadu bol aktualizovaný')
      }
    } catch {
      toast.error('Nepodarilo sa aktualizovať stav')
    }
  }, [leadId, queryClient])

  const handleAddNote = useCallback(async () => {
    if (!noteText.trim()) return
    setAddingNote(true)
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteText.trim() }),
      })
      if (res.ok) {
        setNoteText('')
        queryClient.invalidateQueries({ queryKey: ['lead', leadId] })
        toast.success('Poznámka bola pridaná')
      }
    } catch {
      toast.error('Nepodarilo sa pridať poznámku')
    } finally {
      setAddingNote(false)
    }
  }, [leadId, noteText, queryClient])

  const handleAISuggest = useCallback(async () => {
    setSuggesting(true)
    setSuggestion(null)
    try {
      const res = await fetch('/api/admin/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      })
      if (res.ok) {
        const data = await res.json()
        setSuggestion(data.suggestion)
      } else {
        toast.error('Nepodarilo sa vygenerovať návrh')
      }
    } catch {
      toast.error('Chyba pri generovaní návrhu')
    } finally {
      setSuggesting(false)
    }
  }, [leadId])

  const handleUseSuggestion = useCallback(() => {
    if (suggestion) {
      setNoteText(suggestion)
      setSuggestion(null)
    }
  }, [suggestion])

  const handleSetReminder = useCallback(async () => {
    if (!reminderDate) return
    setSavingReminder(true)
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminderAt: new Date(reminderDate).toISOString() }),
      })
      if (res.ok) {
        setReminderDate('')
        queryClient.invalidateQueries({ queryKey: ['lead', leadId] })
        toast.success('Pripomienka bola nastavená')
      }
    } catch {
      toast.error('Nepodarilo sa nastaviť pripomienku')
    } finally {
      setSavingReminder(false)
    }
  }, [leadId, reminderDate, queryClient])

  const handleCancelReminder = useCallback(async () => {
    setSavingReminder(true)
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminderAt: null }),
      })
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['lead', leadId] })
        toast.success('Pripomienka bola zrušená')
      }
    } catch {
      toast.error('Nepodarilo sa zrušiť pripomienku')
    } finally {
      setSavingReminder(false)
    }
  }, [leadId, queryClient])

  if (isLoading) return <DetailSkeleton />
  if (!lead) return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <p className="text-lg">Lead nebol nájdený</p>
      <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/crm/leads')}>
        <ArrowLeft className="size-4 mr-2" />
        Späť na leady
      </Button>
    </div>
  )

  const availableStatuses = LEAD_STATUS_FLOW[lead.status] || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => router.push('/admin/crm/leads')}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{lead.name}</h1>
            <div className="flex items-center gap-2">
              {availableStatuses.length > 0 ? (
                <Select value={lead.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-[160px] h-8">
                    <StatusBadge status={lead.status} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        <div className="flex items-center gap-2">
                          <span className={`inline-block size-2 rounded-full ${LEAD_STATUS_LABELS[s] ? '' : 'bg-gray-400'}`} />
                          {LEAD_STATUS_LABELS[s] || s}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <StatusBadge status={lead.status} />
              )}
              <Badge className={PRIORITY_COLORS[lead.priority] || PRIORITY_COLORS.normal}>
                {PRIORITY_LABELS[lead.priority] || lead.priority}
              </Badge>
              <Badge variant="outline" className="font-normal">
                {CUSTOMER_TYPE_LABELS[lead.customerType] || lead.customerType}
              </Badge>
            </div>
          </div>
          <p className="text-muted-foreground mt-1">{lead.email}</p>
        </div>
        <Button
          variant="outline"
          className="border-violet-200 text-violet-700 hover:bg-violet-50 shrink-0"
          onClick={handleAISuggest}
          disabled={suggesting}
        >
          {suggesting ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="size-4 mr-2" />
          )}
          AI navrhni odpoveď
        </Button>
      </div>

      {/* AI Suggestion */}
      {suggestion && (
        <Card className="border-violet-200 bg-violet-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="size-5 text-violet-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-violet-900">AI návrh odpovede</p>
                <p className="text-sm text-violet-800 mt-1 whitespace-pre-wrap leading-relaxed">{suggestion}</p>
                <Button
                  size="sm"
                  className="mt-3 bg-violet-600 hover:bg-violet-700 text-white"
                  onClick={handleUseSuggestion}
                >
                  <Send className="size-3 mr-1.5" />
                  Použiť ako poznámku
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setSuggestion(null)}>
                ×
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Column – Info */}
        <div className="lg:col-span-3 space-y-6">
          {/* Contact Info */}
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Kontaktné údaje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <Globe className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Meno</p>
                    <p className="text-sm font-medium truncate">{lead.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <Mail className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <a href={`mailto:${lead.email}`} className="text-sm font-medium text-brand-dark hover:underline truncate block">
                      {lead.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <Phone className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Telefón</p>
                    <p className="text-sm font-medium">{lead.phone || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <Building2 className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Firma</p>
                    <p className="text-sm font-medium truncate">{lead.company || '—'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Info */}
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informácie o projekte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Typ projektu</p>
                  <p className="text-sm font-medium">
                    {PROJECT_TYPE_LABELS[lead.projectType || ''] || lead.projectType || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Zdroj</p>
                  <p className="text-sm font-medium">
                    {SOURCE_LABELS[lead.source] || lead.source}
                  </p>
                </div>
              </div>

              {/* UTM Parameters */}
              {(lead.utmSource || lead.utmMedium || lead.utmCampaign || lead.utmContent) ? (
                <div className="rounded-lg bg-muted/30 border border-border/40 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="size-4 text-muted-foreground" />
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">UTM parametre</p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {lead.utmSource && (
                      <div>
                        <p className="text-xs text-muted-foreground">Source</p>
                        <p className="text-sm font-medium">{lead.utmSource}</p>
                      </div>
                    )}
                    {lead.utmMedium && (
                      <div>
                        <p className="text-xs text-muted-foreground">Medium</p>
                        <p className="text-sm font-medium">{lead.utmMedium}</p>
                      </div>
                    )}
                    {lead.utmCampaign && (
                      <div>
                        <p className="text-xs text-muted-foreground">Campaign</p>
                        <p className="text-sm font-medium">{lead.utmCampaign}</p>
                      </div>
                    )}
                    {lead.utmContent && (
                      <div>
                        <p className="text-xs text-muted-foreground">Content</p>
                        <p className="text-sm font-medium">{lead.utmContent}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Správa</p>
                <div className="rounded-lg bg-muted/50 p-3 border border-border/40">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{lead.message}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Vytvorené</p>
                  <p className="font-medium">{formatDateTime(lead.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Aktualizované</p>
                  <p className="font-medium">{formatDateTime(lead.updatedAt)}</p>
                </div>
              </div>
              {lead.assignedTo && (
                <div className="flex items-center gap-3 pt-2 border-t">
                  <div className="flex size-9 items-center justify-center rounded-full bg-brand-dark/10 text-brand-dark text-xs font-bold">
                    {lead.assignedTo.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Priradený</p>
                    <p className="text-sm font-medium">{lead.assignedTo.name}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reminder Card */}
          <Card className={`border-border/40 ${lead.reminderAt ? 'border-yellow-300 bg-yellow-100/50' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Bell className={`size-4 ${lead.reminderAt ? 'text-yellow-800' : 'text-muted-foreground'}`} />
                <CardTitle className="text-base">Pripomienka</CardTitle>
                {lead.reminderAt && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Aktívna</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {lead.reminderAt ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-yellow-100">
                      <Bell className="size-5 text-yellow-800" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        {formatDateTime(lead.reminderAt)}
                      </p>
                      <p className="text-xs text-yellow-800">
                        {new Date(lead.reminderAt) > new Date() ? 'Nadchádzajúca' : 'Minulá'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-yellow-300 text-yellow-800 hover:bg-yellow-100 shrink-0"
                    onClick={handleCancelReminder}
                    disabled={savingReminder}
                  >
                    {savingReminder ? (
                      <Loader2 className="size-4 mr-1.5 animate-spin" />
                    ) : (
                      <X className="size-4 mr-1.5" />
                    )}
                    Zrušiť pripomienku
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
                  <div className="flex-1 w-full">
                    <Label htmlFor="reminder-input" className="text-xs text-muted-foreground mb-1.5 block">
                      Dátum a čas pripomienky
                    </Label>
                    <Input
                      id="reminder-input"
                      type="datetime-local"
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <Button
                    size="sm"
                    className="bg-yellow-600 hover:bg-yellow-700 text-white shrink-0"
                    onClick={handleSetReminder}
                    disabled={savingReminder || !reminderDate}
                  >
                    {savingReminder ? (
                      <Loader2 className="size-4 mr-1.5 animate-spin" />
                    ) : (
                      <Bell className="size-4 mr-1.5" />
                    )}
                    Nastaviť
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column – Score + Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <ScorePanel
            leadId={lead.id}
            score={lead.score}
            scoreDetails={lead.scoreDetails}
          />
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Časová os</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0 max-h-[600px] overflow-y-auto">
                {(!lead.activities || lead.activities.length === 0) ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Žiadne aktivity</p>
                ) : (
                  <div className="relative">
                    <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
                    {lead.activities.map((activity) => (
                      <div key={activity.id} className="relative flex gap-4 pb-5 last:pb-0">
                        <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-background border border-border">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="text-sm text-foreground leading-snug">{activity.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">{activity.user?.name || 'Systém'}</span>
                            <span className="text-xs text-muted-foreground/50">·</span>
                            <span className="text-xs text-muted-foreground">{formatTimeAgo(activity.createdAt)}</span>
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

      {/* Notes Section */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Poznámky</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing notes */}
          {lead.notes && lead.notes.length > 0 && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {lead.notes.map((note) => (
                <div key={note.id} className="rounded-lg bg-muted/30 border border-border/40 p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/30">
                    <span className="text-xs font-medium text-muted-foreground">{note.author?.name}</span>
                    <span className="text-xs text-muted-foreground/50">·</span>
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(note.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Separator className="my-2" />

          {/* Add note form */}
          <div className="space-y-3">
            <Label htmlFor="note-input">Pridať poznámku</Label>
            <Textarea
              id="note-input"
              placeholder="Napíšte poznámku k tomuto leadu..."
              rows={3}
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                disabled={addingNote || !noteText.trim()}
                onClick={handleAddNote}
              >
                {addingNote ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : (
                  <Send className="size-4 mr-2" />
                )}
                Pridať poznámku
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
