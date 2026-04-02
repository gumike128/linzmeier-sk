'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, Save, Globe, Sparkles, X, CalendarClock, Info } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { VersionHistory } from '@/components/admin/VersionHistory'

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

type AiGenerateType = 'full' | 'excerpt' | 'seo'

/* ------------------------------------------------------------------ */
/*  Schema                                                             */
/* ------------------------------------------------------------------ */

const blogSchema = z.object({
  title: z.string().min(1, 'Názov článku je povinný').max(300),
  slug: z.string().max(200).optional().default(''),
  content: z.string().optional().default(''),
  excerpt: z.string().max(500, 'Max 500 znakov').optional().default(''),
  coverImage: z.string().optional().default(''),
  category: z.string().optional().default(''),
  tags: z.string().optional().default(''),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  metaTitle: z.string().optional().default(''),
  metaDescription: z.string().optional().default(''),
  metaKeywords: z.string().optional().default(''),
})

type BlogForm = z.infer<typeof blogSchema>

interface BlogData {
  id: string
  title: string
  slug: string
  content: string | null
  excerpt: string | null
  coverImage: string | null
  category: string | null
  tags: string | null
  status: string
  publishedAt: string | null
  scheduledAt: string | null
  metaTitle: string | null
  metaDescription: string | null
  metaKeywords: string | null
}

/* ------------------------------------------------------------------ */
/*  Tags helpers                                                       */
/* ------------------------------------------------------------------ */

function parseTags(tagsStr: string | null): string[] {
  if (!tagsStr) return []
  try {
    const parsed = JSON.parse(tagsStr)
    return Array.isArray(parsed) ? parsed.filter((t: unknown) => typeof t === 'string') : []
  } catch {
    return []
  }
}

function serializeTags(tags: string[]): string {
  return JSON.stringify(tags)
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BlogEditorPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const isNew = params.id === 'new'

  // Tags state (local, synced with form)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  // Scheduled publish state
  const [scheduledAt, setScheduledAt] = useState('')

  // AI dialog state
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [aiTopic, setAiTopic] = useState('')
  const [aiTone, setAiTone] = useState('profesionálny')
  const [aiType, setAiType] = useState<AiGenerateType>('full')
  const [aiResult, setAiResult] = useState('')
  const [aiGenerated, setAiGenerated] = useState(false)

  const form = useForm<BlogForm>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      coverImage: '',
      category: '',
      tags: '',
      status: 'DRAFT',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
    },
  })

  // Watch title for AI topic pre-fill
  const watchedTitle = form.watch('title')

  // Fetch existing post
  const { data: post, isLoading } = useQuery<BlogData>({
    queryKey: ['blog-post', params.id],
    queryFn: () =>
      fetch(`/api/admin/blog/${params.id}`).then((r) => {
        if (!r.ok) throw new Error('Článok nebol nájdený')
        return r.json()
      }),
    enabled: !isNew,
  })

  useEffect(() => {
    if (post) {
      const parsedTags = parseTags(post.tags)
      setTags(parsedTags)
      if (post.scheduledAt) {
        setScheduledAt(post.scheduledAt.slice(0, 16))
      }
      form.reset({
        title: post.title,
        slug: post.slug,
        content: post.content ?? '',
        excerpt: post.excerpt ?? '',
        coverImage: post.coverImage ?? '',
        category: post.category ?? '',
        tags: post.tags ?? '',
        status: post.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
        metaTitle: post.metaTitle ?? '',
        metaDescription: post.metaDescription ?? '',
        metaKeywords: post.metaKeywords ?? '',
      })
    }
  }, [post, form])

  // Sync tags to form value
  useEffect(() => {
    form.setValue('tags', serializeTags(tags), { shouldDirty: true })
  }, [tags, form])

  // Tags input handler
  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault()
        const value = tagInput.trim().replace(/,$/g, '')
        if (value && !tags.includes(value) && tags.length < 20) {
          setTags((prev) => [...prev, value.toLowerCase()])
          setTagInput('')
        }
      }
    },
    [tagInput, tags]
  )

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }, [])

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: BlogForm) => {
      const payload: Record<string, unknown> = {
        title: data.title,
        slug: data.slug || undefined,
        content: data.content || null,
        excerpt: data.excerpt || null,
        coverImage: data.coverImage || null,
        category: data.category || null,
        tags: data.tags || null,
        status: data.status,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        metaKeywords: data.metaKeywords || null,
      }

      // Include scheduledAt if set
      if (scheduledAt) {
        payload.scheduledAt = new Date(scheduledAt).toISOString()
      } else if (!isNew) {
        payload.scheduledAt = null
      }

      if (isNew) {
        const res = await fetch('/api/admin/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Chyba pri vytváraní')
        return json
      } else {
        const res = await fetch(`/api/admin/blog/${params.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Chyba pri ukladaní')
        return json
      }
    },
    onSuccess: (saved) => {
      toast.success(
        isNew
          ? 'Článok bol úspešne vytvorený'
          : 'Článok bol uložený'
      )
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
      queryClient.invalidateQueries({ queryKey: ['versions', 'blog_post'] })
      if (isNew) {
        router.replace(`/admin/cms/blog/${saved.id}`)
      }
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  // AI generate mutation
  const aiGenerateMutation = useMutation({
    mutationFn: async () => {
      const apiType = aiType === 'excerpt' ? 'blog' : aiType === 'seo' ? 'seo' : 'blog'
      const res = await fetch('/api/admin/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: apiType,
          topic: aiTopic,
          tone: aiTone,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Chyba pri generovaní')
      return json.content as string
    },
    onSuccess: (content) => {
      setAiResult(content)
      setAiGenerated(true)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const handleAiApply = () => {
    if (!aiResult) return
    if (aiType === 'full') {
      form.setValue('content', aiResult, { shouldDirty: true })
      toast.success('Obsah článku bol vložený')
    } else if (aiType === 'excerpt') {
      const truncated = aiResult.length > 500 ? aiResult.slice(0, 500) : aiResult
      form.setValue('excerpt', truncated, { shouldDirty: true })
      toast.success('Perex bol vložený')
    } else if (aiType === 'seo') {
      // Try to parse SEO response - may contain title, description, keywords
      const lines = aiResult.split('\n').filter((l) => l.trim())
      let metaTitle = ''
      let metaDesc = ''
      let metaKw = ''
      for (const line of lines) {
        const lower = line.toLowerCase()
        if (lower.includes('title:') || lower.includes('názov:')) {
          metaTitle = line.split(/[:.]/)[1]?.trim() || ''
        } else if (lower.includes('description:') || lower.includes('popis:')) {
          metaDesc = line.split(/[:.]/)[1]?.trim() || ''
        } else if (lower.includes('keywords:') || lower.includes('kľúčové:')) {
          metaKw = line.split(/[:.]/)[1]?.trim() || ''
        }
      }
      // If we couldn't parse structured data, just put it all in description
      if (!metaTitle && !metaDesc) {
        metaDesc = aiResult.slice(0, 160)
      }
      if (metaTitle) form.setValue('metaTitle', metaTitle.slice(0, 70), { shouldDirty: true })
      if (metaDesc) form.setValue('metaDescription', metaDesc.slice(0, 160), { shouldDirty: true })
      if (metaKw) form.setValue('metaKeywords', metaKw, { shouldDirty: true })
      toast.success('SEO meta údaje boli vložené')
    }
    setAiDialogOpen(false)
    resetAiDialog()
  }

  const resetAiDialog = () => {
    setAiResult('')
    setAiGenerated(false)
  }

  const openAiDialog = () => {
    setAiTopic(watchedTitle || '')
    setAiTone('profesionálny')
    setAiType('full')
    setAiResult('')
    setAiGenerated(false)
    setAiDialogOpen(true)
  }

  const handleSave = () => {
    form.handleSubmit((data) => saveMutation.mutate(data))()
  }

  const handlePublish = () => {
    form.handleSubmit((data) => {
      saveMutation.mutate({ ...data, status: 'PUBLISHED' })
    })()
  }

  const onSubmit = (_data: BlogForm) => {
    // Handled by saveMutation
  }

  if (!isNew && isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Link href="/admin/cms/blog">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {isNew ? 'Nový článok' : 'Upraviť článok'}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {/* AI Generate button */}
          <Dialog
            open={aiDialogOpen}
            onOpenChange={(open) => {
              setAiDialogOpen(open)
              if (!open) resetAiDialog()
            }}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 text-yellow-800 border-yellow-300 hover:bg-yellow-100 hover:text-yellow-800"
                onClick={openAiDialog}
              >
                <Sparkles className="size-4" />
                AI vygeneruj
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="size-5 text-yellow-800" />
                  AI vygeneruj obsah
                </DialogTitle>
              </DialogHeader>

              {!aiGenerated ? (
                <>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Typ obsahu</Label>
                      <Select value={aiType} onValueChange={(v) => setAiType(v as AiGenerateType)}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Celý článok</SelectItem>
                          <SelectItem value="excerpt">Iba perex</SelectItem>
                          <SelectItem value="seo">SEO meta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Téma článku</Label>
                      <Textarea
                        placeholder="Napr. Výhody izolačných panelov pre rodinné domy..."
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Štýl tónu</Label>
                      <Select value={aiTone} onValueChange={setAiTone}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="profesionálny">
                            Profesionálny
                          </SelectItem>
                          <SelectItem value="technický">
                            Technický
                          </SelectItem>
                          <SelectItem value="marketingový">
                            Marketingový
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setAiDialogOpen(false)}
                    >
                      Zrušiť
                    </Button>
                    <Button
                      className="bg-warm hover:bg-yellow-600 text-white"
                      onClick={() => aiGenerateMutation.mutate()}
                      disabled={!aiTopic || aiGenerateMutation.isPending}
                    >
                      {aiGenerateMutation.isPending && (
                        <Loader2 className="size-4 mr-2 animate-spin" />
                      )}
                      Generovať
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                <>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        Výsledok
                        <Badge variant="outline" className="text-xs">
                          {aiType === 'full'
                            ? 'Celý článok'
                            : aiType === 'excerpt'
                              ? 'Perex'
                              : 'SEO meta'}
                        </Badge>
                      </Label>
                      <Textarea
                        value={aiResult}
                        onChange={(e) => setAiResult(e.target.value)}
                        rows={12}
                        className="min-h-[240px] font-mono text-sm"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAiGenerated(false)
                        setAiResult('')
                      }}
                    >
                      <Loader2 className="size-4 mr-2" />
                      Generovať znova
                    </Button>
                    <Button
                      className="bg-warm hover:bg-yellow-600 text-white"
                      onClick={handleAiApply}
                    >
                      Použiť
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={handleSave}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <Save className="size-4 mr-2" />
            )}
            Uložiť
          </Button>
          <Button
            className="bg-warm hover:bg-warm-dark text-white"
            onClick={handlePublish}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <Globe className="size-4 mr-2" />
            )}
            Publikovať
          </Button>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main content – 2 cols */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Názov článku *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Názov článku"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="automaticky-vygenerovany-slug"
                            {...field}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Ak nevyplníte, slug sa vygeneruje automaticky z názvu
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Category select */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategória</FormLabel>
                        <Select
                          value={field.value || '__none__'}
                          onValueChange={(v) =>
                            field.onChange(v === '__none__' ? '' : v)
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Vyberte kategóriu" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="__none__">
                              — Bez kategórie —
                            </SelectItem>
                            {BLOG_CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Tags input */}
                  <div className="space-y-2">
                    <Label>Tagy</Label>
                    <Input
                      placeholder="Napíšte tag a stlačte Enter..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                    />
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="gap-1 pr-1 text-xs cursor-default"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 transition-colors"
                              aria-label={`Odstrániť tag ${tag}`}
                            >
                              <X className="size-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Stlačte Enter alebo čiarku pre pridanie tagu. Max 20 tagov.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Perex</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Stručný súhrn článku (max 500 znakov)"
                            maxLength={500}
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <div className="text-xs text-muted-foreground text-right">
                          {(field.value ?? '').length}/500
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Obsah</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Obsah článku..."
                            rows={16}
                            className="min-h-[300px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar – 1 col */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Nastavenia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stav</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DRAFT">Koncept</SelectItem>
                            <SelectItem value="PUBLISHED">
                              Publikovaný
                            </SelectItem>
                            <SelectItem value="ARCHIVED">
                              Archivovaný
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="coverImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL obálkového obrázka</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://..."
                            {...field}
                          />
                        </FormControl>
                        {field.value && (
                          <div className="mt-2 rounded-md overflow-hidden bg-muted h-32">
                            <img
                              src={field.value}
                              alt="Cover"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Scheduled publishing */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <CalendarClock className="size-3.5" />
                      Plánované publikovanie
                    </Label>
                    <Input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                    />
                    {scheduledAt && new Date(scheduledAt) > new Date() && (
                      <p className="text-xs text-yellow-800 bg-yellow-100 border border-yellow-200 rounded-md p-2 flex items-start gap-1.5">
                        <Info className="size-3.5 mt-0.5 shrink-0" />
                        Článok bude automaticky publikovaný {new Date(scheduledAt).toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}.
                        Stav zostane Koncept až do vypnutia.
                      </p>
                    )}
                    {scheduledAt && new Date(scheduledAt) <= new Date() && (
                      <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-md p-2 flex items-start gap-1.5">
                        <Info className="size-3.5 mt-0.5 shrink-0" />
                        Zadaný dátum je v minulosti. Článok bude publikovaný okamžite.
                      </p>
                    )}
                  </div>

                  {post?.publishedAt && (
                    <div className="text-xs text-muted-foreground pt-1 border-t">
                      Publikovaný: {new Date(post.publishedAt).toLocaleDateString('sk-SK', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">SEO Meta údaje</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="metaTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Meta title (max 70 znakov)"
                            maxLength={70}
                            {...field}
                          />
                        </FormControl>
                        <div className="text-xs text-muted-foreground text-right">
                          {(field.value ?? '').length}/70
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metaDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Meta description (max 160 znakov)"
                            maxLength={160}
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <div className="text-xs text-muted-foreground text-right">
                          {(field.value ?? '').length}/160
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metaKeywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta kľúčové slová</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="slovo1, slovo2, slovo3"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>

      {/* Version history – only for existing posts */}
      {!isNew && (
        <VersionHistory
          entityType="blog_post"
          entityId={params.id}
          onVersionChange={() => {
            queryClient.invalidateQueries({ queryKey: ['blog-post', params.id] })
          }}
        />
      )}
    </div>
  )
}
