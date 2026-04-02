'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, Save, Globe, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
/*  Schema                                                             */
/* ------------------------------------------------------------------ */

const referenceSchema = z.object({
  title: z.string().min(1, 'Názov referencie je povinný').max(300),
  description: z.string().optional().default(''),
  type: z.string().min(1, 'Typ referencie je povinný'),
  location: z.string().min(1, 'Lokalita je povinná').max(200),
  system: z.string().optional().default(''),
  coverImage: z.string().optional().default(''),
  tags: z.string().optional().default(''),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  sortOrder: z.coerce.number().int().default(0),
})

type ReferenceForm = z.infer<typeof referenceSchema>

interface ReferenceData {
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
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ReferenceEditorPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const isNew = params.id === 'new'

  const form = useForm<ReferenceForm>({
    resolver: zodResolver(referenceSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'rodinny_dom',
      location: '',
      system: '',
      coverImage: '',
      tags: '',
      status: 'DRAFT',
      sortOrder: 0,
    },
  })

  // Fetch existing reference
  const { data: reference, isLoading } = useQuery<ReferenceData>({
    queryKey: ['reference', params.id],
    queryFn: () =>
      fetch(`/api/admin/references/${params.id}`).then((r) => {
        if (!r.ok) throw new Error('Referencia nebola nájdená')
        return r.json()
      }),
    enabled: !isNew,
  })

  useEffect(() => {
    if (reference) {
      form.reset({
        title: reference.title,
        description: reference.description ?? '',
        type: reference.type,
        location: reference.location,
        system: reference.system ?? '',
        coverImage: reference.coverImage ?? '',
        tags: reference.tags ?? '',
        status: reference.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
        sortOrder: reference.sortOrder,
      })
    }
  }, [reference, form])

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: ReferenceForm) => {
      const payload = {
        title: data.title,
        description: data.description || null,
        type: data.type,
        location: data.location,
        system: data.system || null,
        coverImage: data.coverImage || null,
        tags: data.tags || null,
        status: data.status,
        sortOrder: data.sortOrder,
      }

      if (isNew) {
        const res = await fetch('/api/admin/references', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Chyba pri vytváraní')
        return json
      } else {
        const res = await fetch(`/api/admin/references/${params.id}`, {
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
          ? 'Referencia bola úspešne vytvorená'
          : 'Referencia bola uložená'
      )
      queryClient.invalidateQueries({ queryKey: ['references'] })
      if (isNew) {
        router.replace(`/admin/cms/references/${saved.id}`)
      }
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/references/${params.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Chyba pri odstraňovaní')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Referencia bola odstránená')
      queryClient.invalidateQueries({ queryKey: ['references'] })
      router.push('/admin/cms/references')
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const handleSave = () => {
    form.handleSubmit((data) => saveMutation.mutate(data))()
  }

  const handlePublish = () => {
    form.handleSubmit((data) => {
      saveMutation.mutate({ ...data, status: 'PUBLISHED' })
    })()
  }

  const onSubmit = (_data: ReferenceForm) => {
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
        <Link href="/admin/cms/references">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">
            {isNew ? 'Nová referencia' : 'Upraviť referenciu'}
          </h2>
        </div>
        {!isNew && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive hover:text-destructive">
                <Trash2 className="size-4 mr-2" />
                Odstrániť
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Naozaj chcete odstrániť túto referenciu?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Táto akcia je nevratná. Referencia bude trvale odstránená z
                  databázy.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Zrušiť</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate()}
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
        )}
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
            {/* Left column */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Základné údaje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Názov referencie *</FormLabel>
                      <FormControl>
                        <Input placeholder="Názov referencie" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Typ *</FormLabel>
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
                          <SelectItem value="rodinny_dom">
                            Rodinný dom
                          </SelectItem>
                          <SelectItem value="bytovy_dom">
                            Bytový dom
                          </SelectItem>
                          <SelectItem value="priemysel">Priemysel</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lokalita *</FormLabel>
                      <FormControl>
                        <Input placeholder="Napr. Bratislava, Slovensko" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="system"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Systém</FormLabel>
                      <FormControl>
                        <Input placeholder="Napr. Thermowand" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Popis</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Popis projektu"
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Right column */}
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

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tagy</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="tag1, tag2, tag3"
                            {...field}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Oddelené čiarkou
                        </p>
                        <FormMessage />
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
                    name="coverImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL obrázka</FormLabel>
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
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
