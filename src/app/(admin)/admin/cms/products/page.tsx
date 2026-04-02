'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Package } from 'lucide-react'
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

interface Product {
  id: string
  name: string
  slug: string
  shortDesc: string | null
  category: string
  status: string
  sortOrder: number
  imageUrl: string | null
  createdAt: string
  updatedAt: string
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  DRAFT: 'default',
  PUBLISHED: 'secondary',
  ARCHIVED: 'outline',
}

const STATUS_CLASS: Record<string, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  PUBLISHED: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
  ARCHIVED: 'bg-gray-100 text-gray-600 hover:bg-gray-100',
}

const CATEGORY_LABELS: Record<string, string> = {
  panels: 'Izolačné panely',
  facades: 'Fasádne systémy',
  boards: 'Priečelové dosky',
  accessories: 'Príslušenstvo',
}

const CATEGORY_COLORS: Record<string, string> = {
  panels: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  facades: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  boards: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  accessories: 'bg-pink-100 text-pink-800 hover:bg-pink-100',
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ProductsPage() {
  const router = useRouter()
  const [category, setCategory] = useState<string>('__all__')
  const [status, setStatus] = useState<string>('__all__')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)

  // Debounce search
  const handleSearch = (value: string) => {
    setSearch(value)
    const t = setTimeout(() => {
      setDebouncedSearch(value)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }

  const { data, isLoading, isError } = useQuery<{
    products: Product[]
    total: number
    page: number
    totalPages: number
  }>({
    queryKey: ['products', category, status, debouncedSearch, page],
    queryFn: () => {
      const params = new URLSearchParams()
      if (category !== '__all__') params.set('category', category)
      if (status !== '__all__') params.set('status', status)
      if (debouncedSearch) params.set('search', debouncedSearch)
      params.set('page', String(page))
      params.set('limit', '20')
      return fetch(`/api/admin/products?${params}`).then((r) => {
        if (!r.ok) throw new Error('Chyba pri načítavaní produktov')
        return r.json()
      })
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Produkty</h2>
          <p className="text-muted-foreground text-sm">
            Správa produktov katalógu
          </p>
        </div>
        <Button
          onClick={() => router.push('/admin/cms/products/new')}
          className="bg-warm hover:bg-warm-dark text-white"
        >
          <Plus className="size-4 mr-2" />
          Nový produkt
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Hľadať produkty..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={category}
          onValueChange={(v) => {
            setCategory(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Kategória" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Všetky kategórie</SelectItem>
            <SelectItem value="panels">Izolačné panely</SelectItem>
            <SelectItem value="facades">Fasádne systémy</SelectItem>
            <SelectItem value="boards">Priečelové dosky</SelectItem>
            <SelectItem value="accessories">Príslušenstvo</SelectItem>
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
            Nepodarilo sa načítať produkty. Skúste to znova.
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {data && data.products.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center">
            <Package className="size-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Žiadne produkty neboli nájdené.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/admin/cms/products/new')}
            >
              <Plus className="size-4 mr-2" />
              Pridať produkt
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Product grid */}
      {data && data.products.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.products.map((product) => (
              <Link
                key={product.id}
                href={`/admin/cms/products/${product.id}`}
                className="block"
              >
                <Card className="hover:shadow-md hover:border-border/80 transition-all cursor-pointer">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                        {product.name}
                      </h3>
                      <Badge
                        variant={STATUS_VARIANT[product.status] ?? 'default'}
                        className={`${STATUS_CLASS[product.status] ?? ''} shrink-0`}
                      >
                        {product.status === 'DRAFT'
                          ? 'Koncept'
                          : product.status === 'PUBLISHED'
                            ? 'Publikovaný'
                            : 'Archivovaný'}
                      </Badge>
                    </div>
                    {product.shortDesc && (
                      <p className="text-muted-foreground text-xs line-clamp-2">
                        {product.shortDesc}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={CATEGORY_COLORS[product.category] ?? ''}
                      >
                        {CATEGORY_LABELS[product.category] ?? product.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">
                        # {product.sortOrder}
                      </span>
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
