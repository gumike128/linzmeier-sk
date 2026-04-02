'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Users,
  Settings,
  UserPlus,
  Loader2,
  Save,
  Mail,
  Bot,
  Wrench,
  ExternalLink,
  Eye,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface UserRow {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

interface SettingItem {
  key: string
  value: string
  type: string
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const { data: session } = useSession()
  const userRole = session?.user?.role ?? 'PARTNER'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Nastavenia
        </h2>
        <p className="text-muted-foreground mt-1">
          Správa používateľov a systémové nastavenia
        </p>
      </div>

      {/* Users Section – only for ADMIN */}
      {userRole === 'ADMIN' && <UsersSection />}

      {/* Maintenance Mode */}
      <MaintenanceSection />

      {/* System Settings */}
      <SystemSettingsSection />
    </div>
  )
}

/* ================================================================== */
/*  Section 1: Používatelia                                             */
/* ================================================================== */

function UsersSection() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PARTNER' as string,
  })
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<{
    users: UserRow[]
  }>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users')
      if (!res.ok) throw new Error('Chyba pri načítavaní používateľov')
      return res.json()
    },
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Chyba pri vytváraní používateľa')
      }
      return res.json() as Promise<{ user: UserRow }>
    },
    onSuccess: () => {
      toast.success('Používateľ bol úspešne vytvorený')
      setDialogOpen(false)
      setForm({ name: '', email: '', password: '', role: 'PARTNER' })
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Neočakávaná chyba')
    },
  })

  function formatDate(dateStr: string | null) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card className="border-border/40">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10">
              <Users className="size-5 text-brand" />
            </div>
            <div>
              <CardTitle className="text-lg">Používatelia</CardTitle>
              <CardDescription>
                Správa používateľov administrácie
              </CardDescription>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <UserPlus className="size-4" />
                Nový používateľ
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>Nový používateľ</DialogTitle>
                <DialogDescription>
                  Vytvorte nového používateľa administrácie.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="user-name">Meno a priezvisko</Label>
                  <Input
                    id="user-name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Ján Novák"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-email">E-mail</Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="jan@linzmeier.sk"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-password">Heslo</Label>
                  <Input
                    id="user-password"
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, password: e.target.value }))
                    }
                    placeholder="Minimálne 6 znakov"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rola</Label>
                  <Select
                    value={form.role}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, role: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Zrušiť
                </Button>
                <Button
                  onClick={() => createMutation.mutate()}
                  disabled={
                    !form.name.trim() ||
                    !form.email.trim() ||
                    !form.password.trim() ||
                    createMutation.isPending
                  }
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Vytváram...
                    </>
                  ) : (
                    'Vytvoriť'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : !data?.users.length ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Zatiaľ žiadni používatelia
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border/50">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Meno</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Rola</TableHead>
                  <TableHead>Stav</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Posledné prihlásenie
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          ROLE_COLORS[user.role] || ROLE_COLORS.PARTNER
                        }`}
                      >
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.isActive ? 'default' : 'secondary'}
                        className={
                          user.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-100'
                            : ''
                        }
                      >
                        {user.isActive ? 'Aktívny' : 'Neaktívny'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {formatDate(user.lastLoginAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ================================================================== */
/*  Section 2: Systémové nastavenia                                     */
/* ================================================================== */

function SystemSettingsSection() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<{
    settings: SettingItem[]
  }>({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await fetch('/api/admin/settings')
      if (!res.ok) throw new Error('Chyba pri načítavaní nastavení')
      return res.json()
    },
  })

  /* Derive server values from query data */
  const serverSettings = data?.settings ?? []
  const settingsMap: Record<string, string> = {}
  for (const s of serverSettings) {
    settingsMap[s.key] = s.value
  }
  const serverPrompt = settingsMap['chatbot_system_prompt'] ?? ''
  const serverEmail = settingsMap['company_email'] ?? 'info@linzmeier.sk'

  /* Draft pattern: local edits tracked separately from server data */
  const [draft, setDraft] = useState<{
    prompt: string
    email: string
  } | null>(null)

  const chatbotPrompt = draft?.prompt ?? serverPrompt
  const companyEmail = draft?.email ?? serverEmail
  const isDirty = draft !== null

  function updatePrompt(val: string) {
    setDraft((prev) =>
      prev ? { ...prev, prompt: val } : { prompt: val, email: serverEmail },
    )
  }

  function updateEmail(val: string) {
    setDraft((prev) =>
      prev ? { ...prev, email: val } : { prompt: serverPrompt, email: val },
    )
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: [
            { key: 'chatbot_system_prompt', value: chatbotPrompt },
            { key: 'company_email', value: companyEmail },
          ],
        }),
      })
      if (!res.ok) throw new Error('Chyba pri ukladaní nastavení')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Nastavenia boli uložené')
      setDraft(null)
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Neočakávaná chyba')
    },
  })

  if (isLoading) {
    return (
      <Card className="border-border/40">
        <CardContent className="py-10">
          <div className="flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/40">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-warm/10">
            <Settings className="size-5 text-warm-dark" />
          </div>
          <div>
            <CardTitle className="text-lg">Systémové nastavenia</CardTitle>
            <CardDescription>
              Konfigurácia chatbotu a kontaktných údajov
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Chatbot system prompt */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Bot className="size-4 text-muted-foreground" />
            <Label className="text-sm font-medium">
              System prompt chatbota
            </Label>
          </div>
          <Textarea
            value={chatbotPrompt}
            onChange={(e) => updatePrompt(e.target.value)}
            placeholder="Zadajte system prompt pre AI chatbot..."
            className="min-h-[120px] font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Tento text sa použije ako systémový prompt pre AI chatbot na
            webe.
          </p>
        </div>

        {/* Company email */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Kontaktný e-mail</Label>
          </div>
          <Input
            type="email"
            value={companyEmail}
            onChange={(e) => updateEmail(e.target.value)}
            placeholder="info@linzmeier.sk"
          />
          <p className="text-xs text-muted-foreground">
            Verejný kontaktný e-mail zobrazený na webe.
          </p>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!isDirty || saveMutation.isPending}
            className="gap-2 bg-brand hover:bg-brand/90"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Ukladám...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Uložiť nastavenia
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/* ================================================================== */
/*  Section 3: Maintenance Mode                                        */
/* ================================================================== */

function MaintenanceSection() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<{
    settings: SettingItem[]
  }>({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await fetch('/api/admin/settings')
      if (!res.ok) throw new Error('Chyba')
      return res.json()
    },
    select: (d) => d,
  })

  const settingsMap: Record<string, string> = {}
  for (const s of data?.settings ?? []) {
    settingsMap[s.key] = s.value
  }

  const isMaintenance = settingsMap['maintenance_mode'] === 'true'
  const maintenanceMessage =
    settingsMap['maintenance_message'] ??
    'Pracujeme na vylepšení našich služieb. Stránka sa čoskoro vráti.'

  const [messageDraft, setMessageDraft] = useState<string | null>(null)
  const currentMessage = messageDraft ?? maintenanceMessage

  const toggleMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: [
            { key: 'maintenance_mode', value: String(enabled) },
            { key: 'maintenance_message', value: currentMessage },
          ],
        }),
      })
      if (!res.ok) throw new Error('Chyba pri ukladaní')
      return res.json()
    },
    onSuccess: (_, enabled) => {
      setMessageDraft(null)
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      toast.success(
        enabled
          ? 'Maintenance mód bol zapnutý'
          : 'Maintenance mód bol vypnutý',
      )
    },
    onError: () => {
      toast.error('Nepodarilo sa zmeniť stav maintenance módu')
    },
  })

  const saveMessageMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: [{ key: 'maintenance_message', value: currentMessage }],
        }),
      })
      if (!res.ok) throw new Error('Chyba')
      return res.json()
    },
    onSuccess: () => {
      setMessageDraft(null)
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      toast.success('Správa bola uložená')
    },
  })

  if (isLoading) {
    return (
      <Card className="border-border/40">
        <CardContent className="py-10">
          <div className="flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={isMaintenance ? 'border-warm/50 bg-warm/5' : 'border-border/40'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-10 items-center justify-center rounded-lg ${isMaintenance ? 'bg-warm/20' : 'bg-muted'}`}
            >
              <Wrench className={`size-5 ${isMaintenance ? 'text-warm-dark' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Maintenance mód
                {isMaintenance && (
                  <span className="inline-flex items-center rounded-full bg-warm/20 px-2 py-0.5 text-[11px] font-semibold text-warm-dark">
                    AKTÍVNY
                  </span>
                )}
              </CardTitle>
              <CardDescription className="flex items-center gap-3">
                {isMaintenance
                  ? <span>Verejná stránka je pre návštevníkov skrytá</span>
                  : <span>Verejná stránka je prístupná normálne</span>}
                <a
                  href={`/?preview=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <Eye className="size-3" />
                  Zobraziť ako návštevník
                  <ExternalLink className="size-2.5" />
                </a>
              </CardDescription>
            </div>
          </div>

          <Switch
            checked={isMaintenance}
            onCheckedChange={(checked) => toggleMutation.mutate(checked)}
            disabled={toggleMutation.isPending}
          />
        </div>
      </CardHeader>

      {isMaintenance && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Správa pre návštevníkov
            </Label>
            <Textarea
              value={currentMessage}
              onChange={(e) => setMessageDraft(e.target.value)}
              placeholder="Zadajte správu zobrazenú počas údržby..."
              className="min-h-[80px] text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Táto správa sa zobrazí návštevníkom na údržbovej stránke.
            </p>
          </div>
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => saveMessageMutation.mutate()}
              disabled={
                messageDraft === null || saveMessageMutation.isPending
              }
              className="gap-2"
            >
              {saveMessageMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Ukladám...
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  Uložiť správu
                </>
              )}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
