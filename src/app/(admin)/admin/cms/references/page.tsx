'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Building2, MapPin } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Reference {
  id: string
  title: string
  description: string | null
  type: string
  location: string
  system: string | null
  coverImage: string | null
  tags: string | null
  status: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STATUS_CLASS: Record<string, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  PUBLISHED: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
  ARCHIVED: 'bg-gray-100 text-gray-600 hover:bg-gray-100',
}

const TYPE_LABELS: Record<string, string> = {
  rodinny_dom: 'Rodinný dom',
  bytovy_dom: 'Bytový dom',
  priemysel: 'Priemysel',
}

const TYPE_COLORS: Record<string, string> = {
  rodinny_dom: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  bytovy_dom: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  priemysel: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ReferencesPage() {
  const router = useRouter()
  const [type, setType] = useState<string>('__all__')
  const [status, setStatus] = useState<string>('__all__')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)

  const handleSearch = (value: string) => {
    setSearch(value)
    const t = setTimeout(() => {
      setDebouncedSearch(value)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }

  const { data, isLoading, isError } = useQuery<{
    references: Reference[]
    total: number
    page: number
    totalPages: number
  }>({
    queryKey: ['references', type, status, debouncedSearch, page],
    queryFn: () => {
      const params = new URLSearchParams()
      if (type !== '__all__') params.set('type', type)
      if (status !== '__all__') params.set('status', status)
      if (debouncedSearch) params.set('search', debouncedSearch)
      params.set('page', String(page))
      params.set('limit', '20')
      return fetch(`/api/admin/references?${params}`).then((r) => {
        if (!r.ok) throw new Error('Chyba pri načítavaní referencií')
        return r.json()
      })
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Referencie</h2>
          <p className="text-muted-foreground text-sm">
            Správa realizačných referencií
          </p>
        </div>
        <Button
          onClick={() => router.push('/admin/cms/references/new')}
          className="bg-warm hover:bg-warm-dark text-white"
        >
          <Plus className="size-4 mr-2" />
          Nová referencia
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Hľadať referencie..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={type}
          onValueChange={(v) => {
            setType(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Typ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Všetky typy</SelectItem>
            <SelectItem value="rodinny_dom">Rodinný dom</SelectItem>
            <SelectItem value="bytovy_dom">Bytový dom</SelectItem>
            <SelectItem value="priemysel">Priemysel</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Stav" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Všetky stavy</SelectItem>
            <SelectItem value="DRAFT">Koncept</SelectItem>
            <SelectItem value="PUBLISHED">Publikovaný</SelectItem>
            <SelectItem value="ARCHIVED">Archivovaný</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 space-y-3">
                <div className="h-5 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <Card>
          <CardContent className="p-6 text-center text-destructive">
            Nepodarilo sa načítať referencie. Skúste to znova.
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {data && data.references.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center">
            <Building2 className="size-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              Žiadne referencie neboli nájdené.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/admin/cms/references/new')}
            >
              <Plus className="size-4 mr-2" />
              Pridať referenciu
            </Button>
          </CardContent>
        </Card>
      )}

      {/* References grid */}
      {data && data.references.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.references.map((ref) => (
              <Link
                key={ref.id}
                href={`/admin/cms/references/${ref.id}`}
                className="block"
              >
                <Card className="hover:shadow-md hover:border-border/80 transition-all cursor-pointer">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                        {ref.title}
                      </h3>
                      <Badge
                        className={
                          STATUS_CLASS[ref.status] ?? ''
                        }
                      >
                        {ref.status === 'DRAFT'
                          ? 'Koncept'
                          : ref.status === 'PUBLISHED'
                            ? 'Publikovaný'
                            : 'Archivovaný'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {ref.location}
                      </span>
                      {ref.system && <span>{ref.system}</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={TYPE_COLORS[ref.type] ?? ''}
                      >
                        {TYPE_LABELS[ref.type] ?? ref.type}
                      </Badge>
                      {ref.tags && (
                        <span className="text-xs text-muted-foreground truncate">
                          {ref.tags}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Predošlá
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Strana {page} z {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Ďalšia
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
