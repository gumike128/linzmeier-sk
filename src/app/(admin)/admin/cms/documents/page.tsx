'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Plus,
  Search,
  FolderOpen,
  File,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Document {
  id: string
  title: string
  description: string | null
  category: string
  fileType: string
  fileSize: number | null
  fileUrl: string
  isPublic: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CATEGORY_LABELS: Record<string, string> = {
  technical_sheet: 'Technický list',
  bim_cad: 'BIM/CAD',
  manual: 'Montážny návod',
  certificate: 'Certifikát',
}

const CATEGORY_COLORS: Record<string, string> = {
  technical_sheet: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  bim_cad: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  manual: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  certificate: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
}

const FILE_TYPE_COLORS: Record<string, string> = {
  pdf: 'bg-red-100 text-red-800 hover:bg-red-100',
  dwg: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  dxf: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100',
  rvt: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100',
  doc: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  docx: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  xls: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
  xlsx: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
  zip: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/* ------------------------------------------------------------------ */
/*  Schema                                                             */
/* ------------------------------------------------------------------ */

const createDocumentSchema = z.object({
  title: z.string().min(1, 'Názov dokumentu je povinný').max(300),
  description: z.string().optional().default(''),
  category: z.string().min(1, 'Kategória je povinná'),
  fileType: z.string().min(1, 'Typ súboru je povinný'),
  fileUrl: z.string().min(1, 'URL súboru je povinná'),
  isPublic: z.boolean().default(true),
})

type DocumentForm = z.infer<typeof createDocumentSchema>

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function DocumentsPage() {
  const queryClient = useQueryClient()
  const [category, setCategory] = useState<string>('__all__')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const handleSearch = (value: string) => {
    setSearch(value)
    const t = setTimeout(() => {
      setDebouncedSearch(value)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }

  const form = useForm<DocumentForm>({
    resolver: zodResolver(createDocumentSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'technical_sheet',
      fileType: 'pdf',
      fileUrl: '',
      isPublic: true,
    },
  })

  // Fetch documents
  const { data, isLoading, isError } = useQuery<{
    documents: Document[]
    total: number
    page: number
    totalPages: number
  }>({
    queryKey: ['documents', category, debouncedSearch, page],
    queryFn: () => {
      const params = new URLSearchParams()
      if (category !== '__all__') params.set('category', category)
      if (debouncedSearch) params.set('search', debouncedSearch)
      params.set('page', String(page))
      params.set('limit', '20')
      return fetch(`/api/admin/documents?${params}`).then((r) => {
        if (!r.ok) throw new Error('Chyba pri načítavaní dokumentov')
        return r.json()
      })
    },
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: DocumentForm) => {
      const res = await fetch('/api/admin/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          description: data.description || null,
          category: data.category,
          fileType: data.fileType,
          fileUrl: data.fileUrl,
          isPublic: data.isPublic,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Chyba pri vytváraní')
      return json
    },
    onSuccess: () => {
      toast.success('Dokument bol úspešne vytvorený')
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      form.reset()
      setShowCreateForm(false)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/documents?id=${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Chyba pri odstraňovaní')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Dokument bol odstránený')
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      setDeleteTarget(null)
    },
    onError: (err: Error) => {
      toast.error(err.message)
      setDeleteTarget(null)
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dokumenty</h2>
          <p className="text-muted-foreground text-sm">
            Správa technických dokumentov a súborov
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-warm hover:bg-warm-dark text-white"
        >
          <Plus className="size-4 mr-2" />
          Nový dokument
        </Button>
      </div>

      {/* Create form (inline dialog) */}
      {showCreateForm && (
        <Card className="border-warm/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Nový dokument
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setShowCreateForm(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) =>
                  createMutation.mutate(data)
                )}
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Názov *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Názov dokumentu"
                            {...field}
                          />
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
                            <SelectItem value="technical_sheet">
                              Technický list
                            </SelectItem>
                            <SelectItem value="bim_cad">
                              BIM/CAD
                            </SelectItem>
                            <SelectItem value="manual">
                              Montážny návod
                            </SelectItem>
                            <SelectItem value="certificate">
                              Certifikát
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fileType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Typ súboru *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="pdf, dwg, zip..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fileUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL súboru *</FormLabel>
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
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Popis</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Stručný popis dokumentu"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Verejný dokument</FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Verejné dokumenty budú dostupné na webovej stránke
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Zrušiť
                  </Button>
                  <Button
                    type="submit"
                    className="bg-warm hover:bg-warm-dark text-white"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="size-4 mr-2" />
                    )}
                    Vytvoriť
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Hľadať dokumenty..."
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
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Kategória" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Všetky kategórie</SelectItem>
            <SelectItem value="technical_sheet">
              Technický list
            </SelectItem>
            <SelectItem value="bim_cad">BIM/CAD</SelectItem>
            <SelectItem value="manual">Montážny návod</SelectItem>
            <SelectItem value="certificate">Certifikát</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 bg-muted rounded-md" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-muted rounded w-1/3" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <Card>
          <CardContent className="p-6 text-center text-destructive">
            Nepodarilo sa načítať dokumenty. Skúste to znova.
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {data && data.documents.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center">
            <FolderOpen className="size-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              Žiadne dokumenty neboli nájdené.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="size-4 mr-2" />
              Nahrať dokument
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Documents list */}
      {data && data.documents.length > 0 && (
        <>
          <div className="space-y-2">
            {data.documents.map((doc) => (
              <Card
                key={doc.id}
                className="hover:border-border/80 transition-all"
              >
                <CardContent className="p-4 flex items-center gap-4">
                  {/* File icon */}
                  <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                    <File className="size-5 text-muted-foreground" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm truncate">
                        {doc.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className={
                          CATEGORY_COLORS[doc.category] ?? ''
                        }
                      >
                        {CATEGORY_LABELS[doc.category] ?? doc.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          FILE_TYPE_COLORS[doc.fileType.toLowerCase()] ??
                          'bg-gray-100 text-gray-700 hover:bg-gray-100'
                        }
                      >
                        {doc.fileType.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(doc.fileSize)}
                      </span>
                    </div>
                    {doc.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {doc.description}
                      </p>
                    )}
                  </div>

                  {/* Public indicator */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                    {doc.isPublic ? (
                      <Eye className="size-3.5" />
                    ) : (
                      <EyeOff className="size-3.5" />
                    )}
                    <span>{doc.isPublic ? 'Verejný' : 'Súkromný'}</span>
                  </div>

                  {/* Delete button */}
                  <AlertDialog
                    open={deleteTarget === doc.id}
                    onOpenChange={(open) =>
                      !open && setDeleteTarget(null)
                    }
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTarget(doc.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Odstrániť dokument &ldquo;{doc.title}&rdquo;?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Táto akcia je nevratná. Súbor bude trvale odstránený z
                          databázy.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Zrušiť</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(doc.id)}
                          className="bg-destructive text-white hover:bg-destructive/90"
                        >
                          {deleteMutation.isPending && (
                            <Loader2 className="size-4 mr-2 animate-spin" />
                          )}
                          Odstrániť
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
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
