'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, Save, Globe, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
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
/*  Schema                                                             */
/* ------------------------------------------------------------------ */

const productSchema = z.object({
  name: z.string().min(1, 'Názov produktu je povinný').max(200),
  category: z.string().min(1, 'Kategória je povinná'),
  shortDesc: z.string().max(200, 'Max 200 znakov').optional().default(''),
  description: z.string().optional().default(''),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  sortOrder: z.coerce.number().int().default(0),
  suitableForRD: z.boolean().default(false),
  suitableForBytoveDomy: z.boolean().default(false),
  suitableForPriemysel: z.boolean().default(false),
  imageUrl: z.string().optional().default(''),
  metaTitle: z.string().optional().default(''),
  metaDescription: z.string().optional().default(''),
})

type ProductForm = z.infer<typeof productSchema>

interface ProductData {
  id: string
  name: string
  slug: string
  shortDesc: string | null
  description: string | null
  category: string
  status: string
  sortOrder: number
  imageUrl: string | null
  suitableFor: string | null
  metaTitle: string | null
  metaDescription: string | null
}

function parseSuitableFor(val: string | null) {
  try {
    const arr = val ? JSON.parse(val) : []
    return {
      suitableForRD: Array.isArray(arr) && arr.includes('RD'),
      suitableForBytoveDomy:
        Array.isArray(arr) && arr.includes('Bytové domy'),
      suitableForPriemysel:
        Array.isArray(arr) && arr.includes('Priemysel'),
    }
  } catch {
    return {
      suitableForRD: false,
      suitableForBytoveDomy: false,
      suitableForPriemysel: false,
    }
  }
}

function buildSuitableFor(data: ProductForm): string {
  const arr: string[] = []
  if (data.suitableForRD) arr.push('RD')
  if (data.suitableForBytoveDomy) arr.push('Bytové domy')
  if (data.suitableForPriemysel) arr.push('Priemysel')
  return JSON.stringify(arr)
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ProductEditorPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const isNew = params.id === 'new'

  // AI dialog state
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [aiTopic, setAiTopic] = useState('')
  const [aiTone, setAiTone] = useState('profesionálny')
  const [aiResult, setAiResult] = useState('')
  const [aiGenerated, setAiGenerated] = useState(false)

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category: 'panels',
      shortDesc: '',
      description: '',
      status: 'DRAFT',
      sortOrder: 0,
      suitableForRD: false,
      suitableForBytoveDomy: false,
      suitableForPriemysel: false,
      imageUrl: '',
      metaTitle: '',
      metaDescription: '',
    },
  })

  // Watch product name for AI topic pre-fill
  const watchedName = form.watch('name')

  // Fetch existing product data
  const { data: product, isLoading } = useQuery<ProductData>({
    queryKey: ['product', params.id],
    queryFn: () =>
      fetch(`/api/admin/products/${params.id}`).then((r) => {
        if (!r.ok) throw new Error('Produkt nebol nájdený')
        return r.json()
      }),
    enabled: !isNew,
  })

  useEffect(() => {
    if (product) {
      const suitable = parseSuitableFor(product.suitableFor)
      form.reset({
        name: product.name,
        category: product.category,
        shortDesc: product.shortDesc ?? '',
        description: product.description ?? '',
        status: product.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
        sortOrder: product.sortOrder,
        ...suitable,
        imageUrl: product.imageUrl ?? '',
        metaTitle: product.metaTitle ?? '',
        metaDescription: product.metaDescription ?? '',
      })
    }
  }, [product, form])

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      const payload = {
        name: data.name,
        category: data.category,
        shortDesc: data.shortDesc || null,
        description: data.description || null,
        status: data.status,
        sortOrder: data.sortOrder,
        imageUrl: data.imageUrl || null,
        suitableFor: buildSuitableFor(data),
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
      }

      if (isNew) {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Chyba pri vytváraní')
        return json
      } else {
        const res = await fetch(`/api/admin/products/${params.id}`, {
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
          ? 'Produkt bol úspešne vytvorený'
          : 'Produkt bol uložený'
      )
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['versions', 'product'] })
      if (isNew) {
        router.replace(`/admin/cms/products/${saved.id}`)
      }
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  // AI generate mutation
  const aiGenerateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'product',
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
    form.setValue('description', aiResult, { shouldDirty: true })
    toast.success('Popis produktu bol vložený')
    setAiDialogOpen(false)
    resetAiDialog()
  }

  const resetAiDialog = () => {
    setAiResult('')
    setAiGenerated(false)
  }

  const openAiDialog = () => {
    setAiTopic(watchedName || '')
    setAiTone('profesionálny')
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

  const onSubmit = (_data: ProductForm) => {
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
      <div className="flex items-center gap-4">
        <Link href="/admin/cms/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">
            {isNew ? 'Nový produkt' : 'Upraviť produkt'}
          </h2>
        </div>
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

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left column – Main info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Základné údaje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Názov produktu *</FormLabel>
                      <FormControl>
                        <Input placeholder="Názov produktu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategória *</FormLabel>
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
                          <SelectItem value="panels">
                            Izolačné panely
                          </SelectItem>
                          <SelectItem value="facades">
                            Fasádne systémy
                          </SelectItem>
                          <SelectItem value="boards">
                            Priečelové dosky
                          </SelectItem>
                          <SelectItem value="accessories">
                            Príslušenstvo
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shortDesc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Krátky popis</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Krátky popis produktu (max 200 znakov)"
                          maxLength={200}
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <div className="text-xs text-muted-foreground text-right">
                        {(field.value ?? '').length}/200
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description with AI button */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Podrobný popis</FormLabel>
                        {/* AI generate button */}
                        <Dialog
                          open={aiDialogOpen}
                          onOpenChange={(open) => {
                            setAiDialogOpen(open)
                            if (!open) resetAiDialog()
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="gap-1.5 text-yellow-800 hover:text-yellow-800 hover:bg-yellow-100 h-7 px-2 text-xs"
                              onClick={openAiDialog}
                            >
                              <Sparkles className="size-3.5" />
                              AI popis
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[520px]">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Sparkles className="size-5 text-yellow-800" />
                                AI vygeneruj popis produktu
                              </DialogTitle>
                            </DialogHeader>

                            {!aiGenerated ? (
                              <>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label>Téma / Názov produktu</Label>
                                    <Textarea
                                      placeholder="Napr. LINZMEIER T60 izolačný panel..."
                                      value={aiTopic}
                                      onChange={(e) => setAiTopic(e.target.value)}
                                      rows={2}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Štýl tónu</Label>
                                    <Select
                                      value={aiTone}
                                      onValueChange={setAiTone}
                                    >
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
                                    disabled={
                                      !aiTopic || aiGenerateMutation.isPending
                                    }
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
                                    <Label>Výsledok</Label>
                                    <Textarea
                                      value={aiResult}
                                      onChange={(e) => setAiResult(e.target.value)}
                                      rows={10}
                                      className="min-h-[200px] font-mono text-sm"
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
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="Podrobný popis produktu"
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          <SelectItem value="ARCHIVED">Archivovaný</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priorita (poradie)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Right column – Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Vhodnosť</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <FormField
                    control={form.control}
                    name="suitableForRD"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <Label className="cursor-pointer">Rodinné domy (RD)</Label>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="suitableForBytoveDomy"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <Label className="cursor-pointer">Bytové domy</Label>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="suitableForPriemysel"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <Label className="cursor-pointer">Priemysel</Label>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Obrázok</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL obrázka</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>

      {/* Version history – only for existing products */}
      {!isNew && (
        <VersionHistory
          entityType="product"
          entityId={params.id}
          onVersionChange={() => {
            queryClient.invalidateQueries({ queryKey: ['product', params.id] })
          }}
        />
      )}
    </div>
  )
}
