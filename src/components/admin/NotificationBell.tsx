'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Clock, X, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useQuery } from '@tanstack/react-query'

interface Reminder {
  id: string
  name: string
  email: string
  status: string
  reminderAt: string
  assignedTo?: { name: string } | null
}

function formatReminderTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 0) {
    // Past
    const absMin = Math.abs(diffMin)
    if (absMin < 60) return `pred ${absMin} min`
    if (absMin < 1440) return `pred ${Math.floor(absMin / 60)} hod`
    return `pred ${Math.floor(absMin / 1440)} dň${Math.floor(absMin / 1440) === 1 ? 'om' : Math.floor(absMin / 1440) < 5 ? 'ami' : 'mi'}`
  }
  if (diffMin < 60) return `za ${diffMin} min`
  if (diffHr < 24) return `za ${diffHr} hod`
  return `za ${diffDay} d${diffDay === 1 ? 'eň' : diffDay < 5 ? 'ni' : 'ní'}`
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

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  QUALIFIED: 'bg-purple-100 text-purple-800',
  PROPOSAL: 'bg-indigo-100 text-indigo-800',
  NEGOTIATION: 'bg-orange-100 text-orange-800',
  WON: 'bg-green-100 text-green-800',
  LOST: 'bg-red-100 text-red-800',
}

export function NotificationBell() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const { data, isLoading } = useQuery<{ reminders: Reminder[] }>({
    queryKey: ['reminders'],
    queryFn: () => fetch('/api/admin/leads/reminders').then(r => r.json()),
    refetchInterval: 60_000, // refresh every minute
  })

  const reminders = data?.reminders || []
  const count = reminders.length

  const handleNavigate = useCallback((leadId: string) => {
    setOpen(false)
    router.push(`/admin/crm/leads/${leadId}`)
  }, [router])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9 text-muted-foreground hover:text-foreground"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Bell className="size-4" />
          )}
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
              {count > 9 ? '9+' : count}
            </span>
          )}
          <span className="sr-only">Pripomienky</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Pripomienky</h3>
            {count > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {count}
              </Badge>
            )}
          </div>
          {count > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => setOpen(false)}
            >
              <X className="size-3" />
            </Button>
          )}
        </div>

        {/* Reminders list */}
        {count === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted mb-3">
              <Bell className="size-5" />
            </div>
            <p className="text-sm font-medium">Žiadne pripomienky</p>
            <p className="text-xs mt-1">Nemáte žiadne nadchádzajúce pripomienky</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {reminders.map((reminder) => {
              const isPast = new Date(reminder.reminderAt) < new Date()
              return (
                <div key={reminder.id}>
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex gap-3 items-start"
                    onClick={() => handleNavigate(reminder.id)}
                  >
                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-full mt-0.5 ${
                      isPast ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      <Clock className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{reminder.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0 rounded-full font-medium ${
                          STATUS_COLORS[reminder.status] || 'bg-gray-100 text-gray-800'
                        }`}>
                          {STATUS_LABELS[reminder.status] || reminder.status}
                        </span>
                        <span className={`text-xs ${isPast ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                          {formatReminderTime(reminder.reminderAt)}
                        </span>
                      </div>
                      {reminder.assignedTo && (
                        <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                          Priradený: {reminder.assignedTo.name}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="size-3.5 text-muted-foreground/40 shrink-0 mt-1" />
                  </button>
                  <Separator className="last:hidden" />
                </div>
              )
            })}
          </div>
        )}

        {/* Footer */}
        {count > 0 && (
          <div className="border-t px-4 py-2">
            <p className="text-[11px] text-muted-foreground text-center">
              Zobrazujú sa pripomienky na najbližších 24 hodín
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
