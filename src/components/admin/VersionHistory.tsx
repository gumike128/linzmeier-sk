'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { History, RotateCcw, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface Version {
  id: string
  entityType: string
  entityId: string
  data: string
  version: number
  changeNote: string | null
  userId: string
  createdAt: string
  user: {
    name: string | null
    email: string | null
  }
}

interface VersionHistoryProps {
  entityType: 'product' | 'blog_post'
  entityId: string
  onVersionChange?: () => void
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

export function VersionHistory({ entityType, entityId, onVersionChange }: VersionHistoryProps) {
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery<{
    versions: Version[]
  }>({
    queryKey: ['versions', entityType, entityId],
    queryFn: () =>
      fetch(
        `/api/admin/content-versions?entityType=${entityType}&entityId=${entityId}`
      ).then((r) => {
        if (!r.ok) throw new Error('Chyba pri načítavaní verzií')
        return r.json()
      }),
    enabled: !!entityId,
  })

  const [rollbackVersion, setRollbackVersion] = useState<Version | null>(null)
  const [isRollingBack, setIsRollingBack] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const versions = data?.versions || []

  const handleCreateVersion = async () => {
    setIsCreating(true)
    try {
      const res = await fetch('/api/admin/content-versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          entityType,
          entityId,
        }),
      })
      if (res.ok) {
        const result = await res.json()
        toast.success(`Verzia v${result.version} bola vytvorená`)
        refetch()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Chyba pri vytváraní verzie')
      }
    } catch {
      toast.error('Chyba pri vytváraní verzie')
    } finally {
      setIsCreating(false)
    }
  }

  const handleRollback = async () => {
    if (!rollbackVersion) return
    setIsRollingBack(true)
    try {
      const res = await fetch('/api/admin/content-versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rollback',
          entityType,
          entityId,
          versionId: rollbackVersion.id,
        }),
      })
      if (res.ok) {
        toast.success('Verzia bola úspešne obnovená')
        queryClient.invalidateQueries({ queryKey: ['versions', entityType, entityId] })
        onVersionChange?.()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Chyba pri obnove verzie')
      }
    } catch {
      toast.error('Chyba pri obnove verzie')
    } finally {
      setIsRollingBack(false)
      setRollbackVersion(null)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="size-4" />
              História verzií ({versions.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateVersion}
              disabled={isCreating}
              className="gap-1.5 text-xs"
            >
              {isCreating ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Plus className="size-3.5" />
              )}
              Uložiť verziu
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : versions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Zatiaľ žiadne uložené verzie. Kliknutím na &quot;Uložiť verziu&quot;
              vytvoríte prvý snapshot.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto custom-scrollbar">
              {versions.map((v, idx) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                      <Badge
                        variant="outline"
                        className="font-mono text-xs px-2 py-0.5"
                      >
                        v{v.version}
                      </Badge>
                      {idx === 0 && (
                        <span className="absolute -top-1 -right-1 size-2 bg-green-500 rounded-full border border-background" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {v.changeNote || 'Bez popisu'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {v.user?.name || 'Neznámy'} · {formatDateTime(v.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setRollbackVersion(v)}
                    className="shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Obnoviť túto verziu"
                  >
                    <RotateCcw className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rollback confirmation dialog */}
      <AlertDialog
        open={!!rollbackVersion}
        onOpenChange={(open) => {
          if (!open) setRollbackVersion(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potvrdiť obnovu verzie</AlertDialogTitle>
            <AlertDialogDescription>
              Naozaj chcete obnoviť na verziu{' '}
              <strong>v{rollbackVersion?.version}</strong>
              {rollbackVersion?.changeNote
                ? ` (${rollbackVersion.changeNote})`
                : ''}
              ? Súčasný stav bude automaticky uložený ako nová verzia pred
              obnovou.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrušiť</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRollback}
              className="bg-destructive hover:bg-destructive/90 text-white"
              disabled={isRollingBack}
            >
              {isRollingBack && (
                <Loader2 className="size-4 mr-2 animate-spin" />
              )}
              Obnoviť
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
