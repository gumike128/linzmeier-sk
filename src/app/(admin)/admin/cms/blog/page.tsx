'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, FileText, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { sk } from 'date-fns/locale'

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
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const BLOG_CATEGORIES = [
  'Fasáda',
  'Zateplenie',
  'Produkty',
  'Montáž',
  'Energetika',
  'Normy a certifikácie',
  'Spoločnosť',
] as const

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  status: string
  category: string | null
  tags: string | null
  coverImage: string | null
  publishedAt: string | null
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

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Koncept',
  PUBLISHED: 'Publikovaný',
  ARCHIVED: 'Archivovaný',
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function BlogPage() {
  const router = useRouter()
  const [status, setStatus] = useState<string>('__all__')
  const [category, setCategory] = useState<string>('__all__')
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
    posts: BlogPost[]
    total: number
    page: number
    totalPages: number
  }>({
    queryKey: ['blog-posts', status, category, debouncedSearch, page],
    queryFn: () => {
      const params = new URLSearchParams()
      if (status !== '__all__') params.set('status', status)
      if (category !== '__all__') params.set('category', category)
      if (debouncedSearch) params.set('search', debouncedSearch)
      params.set('page', String(page))
      params.set('limit', '20')
      return fetch(`/api/admin/blog?${params}`).then((r) => {
        if (!r.ok) throw new Error('Chyba pri načítavaní článkov')
        return r.json()
      })
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Blog</h2>
          <p className="text-muted-foreground text-sm">
            Správa blogových článkov
          </p>
        </div>
        <Button
          onClick={() => router.push('/admin/cms/blog/new')}
          className="bg-warm hover:bg-warm-dark text-white"
        >
          <Plus className="size-4 mr-2" />
          Nový článok
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Hľadať články..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
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

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={category === '__all__' ? 'default' : 'outline'}
          size="sm"
          className={
            category === '__all__'
              ? 'bg-brand-dark text-white hover:bg-brand-dark'
              : ''
          }
          onClick={() => {
            setCategory('__all__')
            setPage(1)
          }}
        >
          Všetky kategórie
        </Button>
        {BLOG_CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={category === cat ? 'default' : 'outline'}
            size="sm"
            className={
              category === cat
                ? 'bg-brand-dark text-white hover:bg-brand-dark'
                : ''
            }
            onClick={() => {
              setCategory(cat)
              setPage(1)
            }}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 space-y-2">
                <div className="h-5 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <Card>
          <CardContent className="p-6 text-center text-destructive">
            Nepodarilo sa načítať články. Skúste to znova.
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {data && data.posts.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center">
            <FileText className="size-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Žiadne články neboli nájdené.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/admin/cms/blog/new')}
            >
              <Plus className="size-4 mr-2" />
              Napísať článok
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Blog post list */}
      {data && data.posts.length > 0 && (
        <>
          <div className="space-y-3">
            {data.posts.map((post) => (
              <Link
                key={post.id}
                href={`/admin/cms/blog/${post.id}`}
                className="block"
              >
                <Card className="hover:shadow-md hover:border-border/80 transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      {/* Cover image thumbnail */}
                      {post.coverImage && (
                        <div className="hidden sm:block w-20 h-14 rounded-md bg-muted overflow-hidden flex-shrink-0">
                          <img
                            src={post.coverImage}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-sm leading-tight line-clamp-1">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {post.category && (
                              <Badge variant="outline" className="text-xs">
                                {post.category}
                              </Badge>
                            )}
                            <Badge
                              className={
                                STATUS_CLASS[post.status] ?? ''
                              }
                            >
                              {STATUS_LABELS[post.status] ?? post.status}
                            </Badge>
                          </div>
                        </div>
                        {post.excerpt && (
                          <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          {post.publishedAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3" />
                              {format(
                                new Date(post.publishedAt),
                                'd. MMM yyyy',
                                { locale: sk }
                              )}
                            </span>
                          )}
                          <span>
                            Vytvorený:{' '}
                            {format(new Date(post.createdAt), 'd. MMM yyyy', {
                              locale: sk,
                            })}
                          </span>
                        </div>
                      </div>
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
