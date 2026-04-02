'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  Zap,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Mail,
  UserPlus,
  Bell,
  ArrowRight,
  X,
} from 'lucide-react'
import { LEAD_STATUS_LABELS } from '@/lib/rbac'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AutomationAction {
  type: 'email' | 'assign' | 'notify'
  template?: string
  strategy?: string
  assignTo?: string
}

interface AutomationCondition {
  fromStatus?: string
  toStatus?: string
  customerType?: string
}

interface AutomationRow {
  id: string
  name: string
  description?: string | null
  trigger: string
  conditions: string
  actions: string
  isActive: boolean
  createdAt: string
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TRIGGER_LABELS: Record<string, string> = {
  lead_created: 'Nový lead vytvorený',
  status_change: 'Zmena statusu',
}

const ACTION_TYPE_LABELS: Record<string, string> = {
  email: 'Email notifikácia',
  assign: 'Auto-priradiť',
  notify: 'Interná notifikácia',
}

const ACTION_TYPE_ICONS: Record<string, typeof Mail> = {
  email: Mail,
  assign: UserPlus,
  notify: Bell,
}

const ACTION_TYPE_COLORS: Record<string, string> = {
  email: 'bg-blue-100 text-blue-700',
  assign: 'bg-green-100 text-green-700',
  notify: 'bg-yellow-100 text-yellow-800',
}

const CUSTOMER_TYPE_LABELS: Record<string, string> = {
  architekt: 'Architekt',
  firma: 'Firma',
  investor: 'Investor',
  other: 'Iné',
}

const EMPTY_ACTION: AutomationAction = {
  type: 'email',
  template: '',
  strategy: '',
  assignTo: '',
}

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

function parseJsonField<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

function formatConditionsSummary(
  trigger: string,
  conditions: AutomationCondition,
): string {
  if (trigger === 'status_change') {
    const parts: string[] = []
    if (conditions.fromStatus) {
      parts.push(LEAD_STATUS_LABELS[conditions.fromStatus] || conditions.fromStatus)
    }
    if (conditions.toStatus) {
      parts.push(LEAD_STATUS_LABELS[conditions.toStatus] || conditions.toStatus)
    }
    if (parts.length > 0) {
      return parts.join(' → ')
    }
  }
  if (conditions.customerType) {
    return `Typ: ${CUSTOMER_TYPE_LABELS[conditions.customerType] || conditions.customerType}`
  }
  return 'Bez podmienok'
}

function formatActionsSummary(actions: AutomationAction[]): string {
  return actions.map((a) => ACTION_TYPE_LABELS[a.type] || a.type).join(', ')
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export default function AutomationsPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<{ automations: AutomationRow[] }>({
    queryKey: ['admin-automations'],
    queryFn: async () => {
      const res = await fetch('/api/admin/automations')
      if (!res.ok) throw new Error('Chyba pri načítavaní automatizácií')
      return res.json()
    },
  })

  const automations = data?.automations ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Automatizácie
          </h2>
          <p className="text-muted-foreground mt-1">
            Nastavte automatické akcie pri vytvorení leadu a zmene statusu.
          </p>
        </div>
        <div className="flex gap-2">
          <SeedButton queryClient={queryClient} />
          <CreateAutomationDialog queryClient={queryClient} />
        </div>
      </div>

      {/* Automations list */}
      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : automations.length === 0 ? (
        <Card className="border-border/40">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <Zap className="size-7 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              Zatiaľ žiadne automatizácie
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Vytvorte prvú automatizáciu alebo kliknite na &quot;Seedovať&quot; pre
              predvolené.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {automations.map((automation) => (
            <AutomationCard
              key={automation.id}
              automation={automation}
              queryClient={queryClient}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ================================================================== */
/*  Automation Card                                                    */
/* ================================================================== */

function AutomationCard({
  automation,
  queryClient,
}: {
  automation: AutomationRow
  queryClient: ReturnType<typeof useQueryClient>
}) {
  const conditions = parseJsonField<AutomationCondition>(automation.conditions, {})
  const actions = parseJsonField<AutomationAction[]>(automation.actions, [])

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const toggleMutation = useMutation({
    mutationFn: async (isActive: boolean) => {
      const res = await fetch(`/api/admin/automations/${automation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      })
      if (!res.ok) throw new Error('Chyba pri prepínaní automatizácie')
      return res.json()
    },
    onSuccess: () => {
      toast.success(
        automation.isActive ? 'Automatizácia deaktivovaná' : 'Automatizácia aktivovaná',
      )
      queryClient.invalidateQueries({ queryKey: ['admin-automations'] })
    },
    onError: () => {
      toast.error('Nepodarilo sa zmeniť stav automatizácie')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/automations/${automation.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Chyba pri odstraňovaní')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Automatizácia bola odstránená')
      queryClient.invalidateQueries({ queryKey: ['admin-automations'] })
      setDeleteOpen(false)
    },
    onError: () => {
      toast.error('Nepodarilo sa odstrániť automatizáciu')
    },
  })

  return (
    <>
      <Card className="border-border/40">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            {/* Left content */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-foreground">
                  {automation.name}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {TRIGGER_LABELS[automation.trigger] || automation.trigger}
                </Badge>
                <Badge
                  variant={automation.isActive ? 'default' : 'secondary'}
                  className={
                    automation.isActive
                      ? 'bg-green-100 text-green-700 hover:bg-green-100'
                      : ''
                  }
                >
                  {automation.isActive ? 'Aktívna' : 'Neaktívna'}
                </Badge>
              </div>

              {automation.description && (
                <p className="text-sm text-muted-foreground">
                  {automation.description}
                </p>
              )}

              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="font-medium text-foreground">Podmienka:</span>
                  <span>{formatConditionsSummary(automation.trigger, conditions)}</span>
                </div>
                <Separator orientation="vertical" className="h-4 hidden sm:block" />
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-sm font-medium text-foreground">Akcie:</span>
                  {actions.map((action, idx) => {
                    const Icon = ACTION_TYPE_ICONS[action.type] || Mail
                    return (
                      <Badge
                        key={idx}
                        variant="outline"
                        className={`gap-1 ${ACTION_TYPE_COLORS[action.type] || ''}`}
                      >
                        <Icon className="size-3" />
                        {ACTION_TYPE_LABELS[action.type] || action.type}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={automation.isActive}
                  onCheckedChange={(checked) => toggleMutation.mutate(checked)}
                  disabled={toggleMutation.isPending}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="size-3.5" />
                <span className="hidden sm:inline">Upraviť</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive hover:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-3.5" />
                <span className="hidden sm:inline">Odstrániť</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editOpen && (
        <AutomationFormDialog
          automation={automation}
          open={editOpen}
          onOpenChange={setEditOpen}
          queryClient={queryClient}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Odstrániť automatizáciu</AlertDialogTitle>
            <AlertDialogDescription>
              Naozaj chcete odstrániť automatizáciu &quot;{automation.name}&quot;?
              Táto akcia je nevratná.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrušiť</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                'Odstrániť'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/* ================================================================== */
/*  Seed Button                                                        */
/* ================================================================== */

function SeedButton({ queryClient }: { queryClient: ReturnType<typeof useQueryClient> }) {
  const seedMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/automations/seed', {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Chyba pri seedovaní')
      return res.json() as Promise<{ created: string[]; skipped: string[] }>
    },
    onSuccess: (data) => {
      if (data.created.length > 0) {
        toast.success(`Vytvorené: ${data.created.join(', ')}`)
      } else {
        toast.info('Všetky predvolené automatizácie už existujú')
      }
      queryClient.invalidateQueries({ queryKey: ['admin-automations'] })
    },
    onError: () => {
      toast.error('Nepodarilo sa seedovať automatizácie')
    },
  })

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={() => seedMutation.mutate()}
      disabled={seedMutation.isPending}
    >
      {seedMutation.isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Zap className="size-4" />
      )}
      Seedovať predvolené
    </Button>
  )
}

/* ================================================================== */
/*  Create Automation Dialog (wrapper)                                  */
/* ================================================================== */

function CreateAutomationDialog({
  queryClient,
}: {
  queryClient: ReturnType<typeof useQueryClient>
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" className="gap-2 bg-warm hover:bg-warm/90 text-white" asChild>
        <button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Nová automatizácia
        </button>
      </Button>
      <AutomationFormDialog
        open={open}
        onOpenChange={setOpen}
        queryClient={queryClient}
      />
    </Dialog>
  )
}

/* ================================================================== */
/*  Automation Form Dialog                                             */
/* ================================================================== */

function AutomationFormDialog({
  automation,
  open,
  onOpenChange,
  queryClient,
}: {
  automation?: AutomationRow
  open: boolean
  onOpenChange: (v: boolean) => void
  queryClient: ReturnType<typeof useQueryClient>
}) {
  const isEditing = !!automation

  const existingConditions = automation
    ? parseJsonField<AutomationCondition>(automation.conditions, {})
    : {}
  const existingActions = automation
    ? parseJsonField<AutomationAction[]>(automation.actions, [])
    : []

  const [name, setName] = useState(automation?.name ?? '')
  const [description, setDescription] = useState(automation?.description ?? '')
  const [trigger, setTrigger] = useState(automation?.trigger ?? 'lead_created')
  const [conditions, setConditions] = useState<AutomationCondition>({
    fromStatus: existingConditions.fromStatus ?? '',
    toStatus: existingConditions.toStatus ?? '',
    customerType: existingConditions.customerType ?? '',
  })
  const [actions, setActions] = useState<AutomationAction[]>(
    existingActions.length > 0 ? existingActions : [{ ...EMPTY_ACTION }],
  )

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Build clean conditions
      const cleanConditions: Record<string, unknown> = {}
      if (trigger === 'status_change') {
        if (conditions.fromStatus) cleanConditions.fromStatus = conditions.fromStatus
        if (conditions.toStatus) cleanConditions.toStatus = conditions.toStatus
      }
      if (conditions.customerType) cleanConditions.customerType = conditions.customerType

      const payload = {
        name,
        description: description || undefined,
        trigger,
        conditions: cleanConditions,
        actions,
        isActive: isEditing ? automation.isActive : true,
      }

      const url = isEditing
        ? `/api/admin/automations/${automation.id}`
        : '/api/admin/automations'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Chyba pri ukladaní')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success(
        isEditing
          ? 'Automatizácia bola aktualizovaná'
          : 'Automatizácia bola vytvorená',
      )
      queryClient.invalidateQueries({ queryKey: ['admin-automations'] })
      onOpenChange(false)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Neočakávaná chyba')
    },
  })

  function addAction() {
    setActions((prev) => [...prev, { ...EMPTY_ACTION }])
  }

  function removeAction(idx: number) {
    setActions((prev) => prev.filter((_, i) => i !== idx))
  }

  function updateAction(idx: number, field: keyof AutomationAction, value: string) {
    setActions((prev) =>
      prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a)),
    )
  }

  function resetForm() {
    setName('')
    setDescription('')
    setTrigger('lead_created')
    setConditions({ fromStatus: '', toStatus: '', customerType: '' })
    setActions([{ ...EMPTY_ACTION }])
  }

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? 'Upraviť automatizáciu' : 'Nová automatizácia'}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? 'Upravte nastavenia automatizácie.'
            : 'Vytvorte novú automatizáciu pre automatické akcie.'}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-5 py-2">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="auto-name">Názov</Label>
          <Input
            id="auto-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Názov automatizácie"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="auto-desc">Popis</Label>
          <Textarea
            id="auto-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Voliteľný popis..."
            rows={2}
          />
        </div>

        {/* Trigger */}
        <div className="space-y-2">
          <Label>Spúšťač</Label>
          <Select value={trigger} onValueChange={setTrigger}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lead_created">Nový lead vytvorený</SelectItem>
              <SelectItem value="status_change">Zmena statusu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Conditions */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Podmienky</Label>

          {trigger === 'status_change' && (
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={conditions.fromStatus || '_none'}
                onValueChange={(v) =>
                  setConditions((c) => ({
                    ...c,
                    fromStatus: v === '_none' ? '' : v,
                  }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Z statusu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Bez podmienky</SelectItem>
                  {Object.entries(LEAD_STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <ArrowRight className="size-4 text-muted-foreground" />

              <Select
                value={conditions.toStatus || '_none'}
                onValueChange={(v) =>
                  setConditions((c) => ({
                    ...c,
                    toStatus: v === '_none' ? '' : v,
                  }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Na status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Bez podmienky</SelectItem>
                  {Object.entries(LEAD_STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Customer type filter */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Filtrovať podľa typu zákazníka (voliteľné)
            </Label>
            <Select
              value={conditions.customerType || '_none'}
              onValueChange={(v) =>
                setConditions((c) => ({
                  ...c,
                  customerType: v === '_none' ? '' : v,
                }))
              }
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Všetky typy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Všetky typy</SelectItem>
                {Object.entries(CUSTOMER_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Akcie</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={addAction}
            >
              <Plus className="size-3.5" />
              Pridať akciu
            </Button>
          </div>

          {actions.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Pridajte aspoň jednu akciu
            </p>
          )}

          <div className="space-y-3">
            {actions.map((action, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-3 rounded-lg border border-border/50 p-3"
              >
                <div className="flex items-center justify-between">
                  <Select
                    value={action.type}
                    onValueChange={(v) =>
                      updateAction(idx, 'type', v)
                    }
                  >
                    <SelectTrigger className="w-[220px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ACTION_TYPE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {actions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeAction(idx)}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>

                {/* Type-specific fields */}
                {action.type === 'email' && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Šablóna emailu
                    </Label>
                    <Input
                      value={action.template ?? ''}
                      onChange={(e) => updateAction(idx, 'template', e.target.value)}
                      placeholder="názov_šablóny"
                      className="text-sm"
                    />
                  </div>
                )}

                {action.type === 'assign' && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Stratégia priradenia
                    </Label>
                    <Select
                      value={action.strategy || 'round_robin'}
                      onValueChange={(v) => updateAction(idx, 'strategy', v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="round_robin">
                          Round-robin (riadkovanie)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {action.type === 'notify' && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Notifikovať používateľa (voliteľné)
                    </Label>
                    <Input
                      value={action.assignTo ?? ''}
                      onChange={(e) => updateAction(idx, 'assignTo', e.target.value)}
                      placeholder="ID používateľa (prázdne = všetci)"
                      className="text-sm"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => {
            onOpenChange(false)
            resetForm()
          }}
        >
          Zrušiť
        </Button>
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={!name.trim() || actions.length === 0 || saveMutation.isPending}
          className="gap-2 bg-warm hover:bg-warm/90 text-white"
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Ukladám...
            </>
          ) : isEditing ? (
            'Uložiť zmeny'
          ) : (
            'Vytvoriť'
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
