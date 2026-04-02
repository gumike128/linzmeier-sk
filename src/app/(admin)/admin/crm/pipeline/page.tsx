'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Building2, Clock, User, Kanban } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, LEAD_STATUS_FLOW } from '@/lib/rbac'

// ─── Column definitions ────────────────────────────────────────────────

interface ColumnDef {
  key: string
  label: string
  accentColor: string
  accentBorder: string
  accentBg: string
  accentDot: string
}

const COLUMNS: ColumnDef[] = [
  { key: 'NEW', label: 'NOVÝ', accentColor: 'text-blue-600', accentBorder: 'border-t-blue-500', accentBg: 'bg-blue-50', accentDot: 'bg-blue-500' },
  { key: 'CONTACTED', label: 'KONTAKTOVANÝ', accentColor: 'text-yellow-800', accentBorder: 'border-t-yellow-500', accentBg: 'bg-yellow-100', accentDot: 'bg-warm' },
  { key: 'QUALIFIED', label: 'KVALIFIKOVANÝ', accentColor: 'text-purple-600', accentBorder: 'border-t-purple-500', accentBg: 'bg-purple-50', accentDot: 'bg-purple-500' },
  { key: 'PROPOSAL', label: 'PONUKA', accentColor: 'text-indigo-600', accentBorder: 'border-t-indigo-500', accentBg: 'bg-indigo-50', accentDot: 'bg-indigo-500' },
  { key: 'NEGOTIATION', label: 'ROKOVANIE', accentColor: 'text-orange-600', accentBorder: 'border-t-orange-500', accentBg: 'bg-orange-50', accentDot: 'bg-orange-500' },
  { key: 'WON', label: 'ZÍSKANÝ', accentColor: 'text-green-600', accentBorder: 'border-t-green-500', accentBg: 'bg-green-50', accentDot: 'bg-green-500' },
  { key: 'LOST', label: 'STRATENÝ', accentColor: 'text-red-600', accentBorder: 'border-t-red-500', accentBg: 'bg-red-50', accentDot: 'bg-red-500' },
]

// ─── Utility functions ─────────────────────────────────────────────────

const CUSTOMER_TYPE_LABELS: Record<string, string> = {
  architekt: 'Architekt',
  firma: 'Firma',
  investor: 'Investor',
  other: 'Iné',
}

const PRIORITY_BORDER_COLORS: Record<string, string> = {
  low: 'border-l-gray-300',
  normal: 'border-l-blue-400',
  high: 'border-l-orange-400',
  urgent: 'border-l-red-500',
}

const PROJECT_TYPE_LABELS: Record<string, string> = {
  novostavba: 'Novostavba',
  rekonstrukcia: 'Rekonštrukcia',
  priemysel: 'Priemysel',
  other: 'Iné',
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1) return 'práve teraz'
  if (diffMin < 60) return `pred ${diffMin} min`
  if (diffHr < 24) return `pred ${diffHr} hod`
  if (diffDay < 7) return `pred ${diffDay} dň${diffDay === 1 ? 'om' : diffDay < 5 ? 'ami' : 'mi'}`
  return new Date(dateStr).toLocaleDateString('sk-SK', { day: 'numeric', month: 'short' })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

function getTransitionTargets(currentStatus: string): string[] {
  return LEAD_STATUS_FLOW[currentStatus] || []
}

// ─── Types ─────────────────────────────────────────────────────────────

interface LeadItem {
  id: string
  name: string
  email: string
  company: string | null
  customerType: string
  projectType: string | null
  priority: string
  status: string
  reminderAt: string | null
  createdAt: string
  updatedAt: string
  assignedTo: { id: string; name: string } | null
}

// ─── Draggable Card Component ──────────────────────────────────────────

function DraggableCard({
  lead,
  onNavigate,
}: {
  lead: LeadItem
  onNavigate: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { lead },
  })

  const style = transform
    ? { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 }
    : undefined

  const priorityBorder = PRIORITY_BORDER_COLORS[lead.priority] || PRIORITY_BORDER_COLORS.normal

  return (
    <div ref={setNodeRef} style={style} {...attributes} className={isDragging ? 'z-50' : ''}>
      <Card
        className={`border-l-4 ${priorityBorder} shadow-sm hover:shadow-md transition-all border-border/40 group`}
      >
        <CardContent className="p-3 space-y-2">
          {/* Grip handle + Name */}
          <div className="flex items-start gap-1.5">
            <button
              className="mt-0.5 text-muted-foreground/30 hover:text-muted-foreground cursor-grab active:cursor-grabbing shrink-0 transition-colors"
              aria-label="Presunúť kartu"
              {...listeners}
            >
              <GripVertical className="size-4" />
            </button>
            <button
              className="flex-1 min-w-0 text-left"
              onClick={(e) => {
                e.stopPropagation()
                onNavigate()
              }}
            >
              <p className="font-medium text-sm truncate group-hover:text-brand-dark transition-colors">
                {lead.name}
              </p>
              {lead.company && (
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                  <Building2 className="size-3 shrink-0" />
                  {lead.company}
                </p>
              )}
            </button>
          </div>

          {/* Badges row */}
          <div className="flex items-center gap-1.5 flex-wrap pl-[22px]">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
              {CUSTOMER_TYPE_LABELS[lead.customerType] || lead.customerType}
            </Badge>
            {lead.projectType && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                {PROJECT_TYPE_LABELS[lead.projectType] || lead.projectType}
              </Badge>
            )}
          </div>

          {/* Footer: assigned user + time + reminder */}
          <div className="flex items-center justify-between pt-0.5 pl-[22px]">
            <div className="flex items-center gap-1.5">
              {lead.assignedTo ? (
                <div className="flex items-center gap-1">
                  <div className="flex size-5 items-center justify-center rounded-full bg-brand-dark text-white text-[9px] font-bold shrink-0">
                    {getInitials(lead.assignedTo.name)}
                  </div>
                  <span className="text-[11px] text-muted-foreground truncate max-w-[80px]">
                    {lead.assignedTo.name.split(' ')[0]}
                  </span>
                </div>
              ) : (
                <User className="size-3 text-muted-foreground/40" />
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {lead.reminderAt && (
                <span className={`flex items-center gap-0.5 text-[10px] ${
                  new Date(lead.reminderAt) < new Date()
                    ? 'text-red-500'
                    : 'text-yellow-800'
                }`} title={`Pripomienka: ${new Date(lead.reminderAt).toLocaleString('sk-SK')}`}>
                  <Clock className="size-2.5" />
                </span>
              )}
              <span className="text-[10px] text-muted-foreground/60 flex items-center gap-0.5">
                {formatTimeAgo(lead.createdAt)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Droppable Column Component ────────────────────────────────────────

function DroppableColumn({
  column,
  leads,
  isOver,
  onNavigate,
}: {
  column: ColumnDef
  leads: LeadItem[]
  isOver: boolean
  onNavigate: (lead: LeadItem) => void
}) {
  const { setNodeRef, isOver: isDroppableOver } = useDroppable({ id: column.key })
  const isHighlighted = isOver || isDroppableOver

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-[280px] flex flex-col rounded-xl border transition-all duration-200 ${
        isHighlighted
          ? 'border-brand-dark/50 bg-brand-dark/[0.03] scale-[1.01]'
          : 'border-border/40 bg-muted/20'
      }`}
    >
      {/* Column header */}
      <div className={`border-t-[3px] ${column.accentBorder} rounded-t-xl px-3 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`size-2 rounded-full ${column.accentDot}`} />
            <h3 className={`text-xs font-bold tracking-wider uppercase ${column.accentColor}`}>
              {column.label}
            </h3>
          </div>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${column.accentBg} ${column.accentColor}`}>
            {leads.length}
          </span>
        </div>
      </div>

      {/* Scrollable cards list */}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-240px)] p-2 space-y-2 custom-scrollbar">
        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground/30">
            <div className="size-8 rounded-full border-2 border-dashed border-muted-foreground/20 flex items-center justify-center mb-2">
              <span className="text-xs">+</span>
            </div>
            <p className="text-[11px]">Prisunte kartu sem</p>
          </div>
        ) : (
          leads.map((lead) => (
            <DraggableCard key={lead.id} lead={lead} onNavigate={() => onNavigate(lead)} />
          ))
        )}
      </div>
    </div>
  )
}

// ─── Skeleton Loading ──────────────────────────────────────────────────

function PipelineSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-44" />
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className="flex-shrink-0 w-[280px] flex flex-col bg-muted/20 rounded-xl border border-border/40"
          >
            <div className={`border-t-[3px] ${col.accentBorder} rounded-t-xl px-3 py-3`}>
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-4 w-5 rounded-full" />
              </div>
            </div>
            <div className="p-2 space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-[88px] rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Pipeline Page ────────────────────────────────────────────────

export default function PipelinePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overColumnId, setOverColumnId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const { data, isLoading } = useQuery({
    queryKey: ['pipeline'],
    queryFn: () => fetch('/api/admin/pipeline').then((r) => r.json()),
    refetchInterval: 30_000,
  })

  const columns = data?.columns as Record<string, LeadItem[]> | undefined

  // Find the active lead for drag overlay
  const activeLead = activeId
    ? Object.values(columns || {}).flat().find((l) => l.id === activeId) ?? null
    : null

  const totalLeads = columns
    ? Object.values(columns).reduce((sum, arr) => sum + arr.length, 0)
    : 0

  // Navigate to lead detail
  const handleNavigate = useCallback(
    (lead: LeadItem) => {
      if (!activeId) {
        router.push(`/admin/crm/leads/${lead.id}`)
      }
    },
    [router, activeId]
  )

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }, [])

  // Handle drag over – determine target column
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event
    if (over) {
      const overId = String(over.id)
      // Check if the over element is a column or a card in a column
      if (COLUMNS.some((c) => c.key === overId)) {
        setOverColumnId(overId)
      } else {
        // It's a card – find which column it belongs to
        const card = Object.values(columns || {})
          .flat()
          .find((l) => l.id === overId)
        if (card) {
          setOverColumnId(card.status)
        }
      }
    }
  }, [columns])

  // Handle drag end – update lead status via API
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)
      setOverColumnId(null)

      if (!over || !active) return

      const leadId = String(active.id)
      let targetStatus = String(over.id)

      // If dropped on a card, use that card's column as target
      const overCard = Object.values(columns || {})
        .flat()
        .find((l) => l.id === targetStatus)
      if (overCard) {
        targetStatus = overCard.status
      }

      // Find current lead
      const currentLead = columns
        ? Object.values(columns).flat().find((l) => l.id === leadId)
        : null

      if (!currentLead || currentLead.status === targetStatus) return

      // Validate transition is allowed
      const validTargets = getTransitionTargets(currentLead.status)
      if (!validTargets.includes(targetStatus)) {
        toast.error(
          `Prechod z "${LEAD_STATUS_LABELS[currentLead.status]}" do "${LEAD_STATUS_LABELS[targetStatus]}" nie je povolený`
        )
        return
      }

      // Optimistic UI update
      queryClient.setQueryData(['pipeline'], (old: { columns: Record<string, LeadItem[]> }) => {
        if (!old?.columns) return old
        const newCols: Record<string, LeadItem[]> = {}
        for (const [status, leads] of Object.entries(old.columns)) {
          if (status === currentLead.status) {
            newCols[status] = leads.filter((l) => l.id !== leadId)
          } else if (status === targetStatus) {
            newCols[status] = [{ ...currentLead, status: targetStatus }, ...leads]
          } else {
            newCols[status] = leads
          }
        }
        return { columns: newCols }
      })

      // API call to update status
      try {
        const res = await fetch(`/api/admin/leads/${leadId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: targetStatus }),
        })
        if (!res.ok) throw new Error('API error')

        toast.success(`${currentLead.name} → ${LEAD_STATUS_LABELS[targetStatus]}`)
        queryClient.invalidateQueries({ queryKey: ['leads'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      } catch {
        toast.error('Chyba pri presune leadu. Navraciam pôvodný stav.')
        queryClient.invalidateQueries({ queryKey: ['pipeline'] })
      }
    },
    [columns, queryClient]
  )

  if (isLoading) return <PipelineSkeleton />

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-brand-dark/10">
            <Kanban className="size-5 text-brand-dark" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {totalLeads} {totalLeads === 1 ? 'lead' : totalLeads < 5 ? 'leadov' : 'leadov'} &middot; 7 fáz
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs hidden sm:flex items-center gap-1.5">
          <GripVertical className="size-3" />
          Ťahajte karty pre zmenu stavu
        </Badge>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto flex-1 pb-4 custom-scrollbar">
          {COLUMNS.map((col) => {
            const leads = (columns?.[col.key] || []) as LeadItem[]
            return (
              <DroppableColumn
                key={col.key}
                column={col}
                leads={leads}
                isOver={overColumnId === col.key}
                onNavigate={handleNavigate}
              />
            )
          })}
        </div>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={null}>
          {activeLead ? (
            <Card
              className={`border-l-4 ${
                PRIORITY_BORDER_COLORS[activeLead.priority] || PRIORITY_BORDER_COLORS.normal
              } shadow-xl w-[260px] rotate-[1.5deg]`}
            >
              <CardContent className="p-3 space-y-2">
                <p className="font-medium text-sm truncate">{activeLead.name}</p>
                {activeLead.company && (
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                    <Building2 className="size-3 shrink-0" />
                    {activeLead.company}
                  </p>
                )}
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 font-normal"
                  >
                    {CUSTOMER_TYPE_LABELS[activeLead.customerType] || activeLead.customerType}
                  </Badge>
                  <Badge
                    className={`text-[10px] px-1.5 py-0 font-normal ${
                      LEAD_STATUS_COLORS[activeLead.status] || ''
                    }`}
                  >
                    {LEAD_STATUS_LABELS[activeLead.status] || activeLead.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
