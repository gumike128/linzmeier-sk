'use client'

import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  Bot,
  Send,
  Copy,
  Loader2,
  Sparkles,
  BarChart3,
  MessageSquare,
  Clock,
  Zap,
  User,
  FileText,
  Search,
  HelpCircle,
  PenLine,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface AIStats {
  total: number
  byType: Record<string, number>
  avgDurationMs: number
  recentInteractions: {
    id: string
    type: string
    input: string
    model: string
    durationMs: number | null
    createdAt: string
    user: { name: string }
  }[]
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

const TYPE_LABELS: Record<string, string> = {
  chatbot: 'Chatbot',
  generate_blog: 'Blog článok',
  generate_product: 'Popis produktu',
  generate_seo: 'SEO meta',
  generate_faq: 'FAQ',
  suggest: 'Návrh odpovede',
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  chatbot: MessageSquare,
  generate_blog: PenLine,
  generate_product: FileText,
  generate_seo: Search,
  generate_faq: HelpCircle,
  suggest: Sparkles,
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AIToolsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          AI Nástroje
        </h2>
        <p className="text-muted-foreground mt-1">
          Testujte chatbot, generujte obsah a sledujte AI štatistiky
        </p>
      </div>

      <Tabs defaultValue="chatbot" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[420px]">
          <TabsTrigger value="chatbot" className="gap-2">
            <Bot className="size-4" />
            <span className="hidden sm:inline">Chatbot</span>
          </TabsTrigger>
          <TabsTrigger value="generate" className="gap-2">
            <Sparkles className="size-4" />
            <span className="hidden sm:inline">Generátor</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <BarChart3 className="size-4" />
            <span className="hidden sm:inline">Štatistiky</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chatbot">
          <ChatbotTab />
        </TabsContent>

        <TabsContent value="generate">
          <GeneratorTab />
        </TabsContent>

        <TabsContent value="stats">
          <StatsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ================================================================== */
/*  Tab 1: Chatbot                                                     */
/* ================================================================== */

function ChatbotTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: generateId(),
      role: 'assistant',
      content:
        'Vitajte! Som asistent spoločnosti LINZMEIER. Môžem vám pomôcť s informáciami o našich produktoch, fasádnych systémoch, izolačných paneloch a ďalších službách. Čo vás zaujíma?',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: trimmed,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Chyba pri komunikácii s AI')
      }

      const data = await res.json()
      const aiMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.response,
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Neočakávaná chyba')
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'assistant',
          content: 'Prepáčte, nastala chyba. Skúste to prosím neskôr.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-warm/10">
            <Bot className="size-5 text-warm-dark" />
          </div>
          <div>
            <CardTitle className="text-lg">AI Chatbot – Testovanie</CardTitle>
            <p className="text-sm text-muted-foreground">
              Testujte chatbot pred nasadením na web
            </p>
          </div>
          <Badge variant="secondary" className="ml-auto">
            Testovací režim
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Messages area */}
        <ScrollArea className="h-[480px] px-4 md:px-6" ref={scrollRef}>
          <div className="flex flex-col gap-4 py-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    msg.role === 'assistant'
                      ? 'bg-brand/10 text-brand'
                      : 'bg-warm/10 text-warm-dark'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <Bot className="size-4" />
                  ) : (
                    <User className="size-4" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'assistant'
                      ? 'bg-muted text-foreground'
                      : 'bg-brand text-white'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <Bot className="size-4" />
                </div>
                <div className="rounded-xl bg-muted px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      AI píše...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="border-t border-border/50 p-4 md:px-6">
          <div className="flex gap-3">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Napíšte správu..."
              className="min-h-[44px] max-h-[120px] resize-none flex-1 rounded-lg"
              rows={1}
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="h-11 w-11 shrink-0 rounded-lg bg-brand hover:bg-brand/90"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              <span className="sr-only">Odoslať</span>
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Stlačte Enter pre odoslanie, Shift+Enter pre nový riadok
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/* ================================================================== */
/*  Tab 2: Generátor obsahu                                             */
/* ================================================================== */

const CONTENT_TYPES = [
  { value: 'blog', label: 'Blog článok', icon: PenLine },
  { value: 'product', label: 'Popis produktu', icon: FileText },
  { value: 'seo', label: 'SEO meta', icon: Search },
  { value: 'faq', label: 'FAQ', icon: HelpCircle },
] as const

const TONES = [
  { value: 'profesionálny', label: 'Profesionálny' },
  { value: 'technický', label: 'Technický' },
  { value: 'marketingový', label: 'Marketingový' },
] as const

function GeneratorTab() {
  const [contentType, setContentType] = useState('blog')
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('profesionálny')
  const [result, setResult] = useState('')
  const queryClient = useQueryClient()

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: contentType, topic, tone }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Chyba pri generovaní')
      }
      return res.json() as Promise<{ content: string }>
    },
    onSuccess: (data) => {
      setResult(data.content)
      toast.success('Obsah bol úspešne vygenerovaný')
      queryClient.invalidateQueries({ queryKey: ['ai-stats'] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Neočakávaná chyba')
    },
  })

  function handleCopy() {
    if (!result) return
    navigator.clipboard.writeText(result)
    toast.success('Obsah bol skopírovaný do schránky')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Config card */}
      <Card className="border-border/40">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-warm/10">
              <Sparkles className="size-5 text-warm-dark" />
            </div>
            <div>
              <CardTitle className="text-lg">Generátor obsahu</CardTitle>
              <p className="text-sm text-muted-foreground">
                Vygenerujte profesionálny obsah pomocou AI
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Content type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Typ obsahu</label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Vyberte typ" />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_TYPES.map((ct) => {
                  const Icon = ct.icon
                  return (
                    <SelectItem key={ct.value} value={ct.value}>
                      <span className="flex items-center gap-2">
                        <Icon className="size-4" />
                        {ct.label}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Topic */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Téma</label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="napr. Výhody izolačných panelov pre rodinné domy"
              className="w-full"
            />
          </div>

          {/* Tone */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Štýl / Tón</label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Vyberte štýl" />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Generate button */}
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={!topic.trim() || generateMutation.isPending}
            className="w-full bg-brand hover:bg-brand/90"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generujem...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Generovať
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result card */}
      <Card className="border-border/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Výsledok</CardTitle>
            {result && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-2"
              >
                <Copy className="size-3.5" />
                Skopírovať
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {generateMutation.isPending ? (
            <div className="flex min-h-[280px] items-center justify-center rounded-lg border border-dashed border-border/50">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="size-8 animate-spin" />
                <p className="text-sm">AI generuje obsah...</p>
              </div>
            </div>
          ) : result ? (
            <Textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              className="min-h-[280px] font-mono text-sm"
            />
          ) : (
            <div className="flex min-h-[280px] items-center justify-center rounded-lg border border-dashed border-border/50">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <FileText className="size-10 opacity-30" />
                <p className="text-sm">Vyplňte formulár a kliknite na &quot;Generovať&quot;</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* ================================================================== */
/*  Tab 3: AI Štatistiky                                               */
/* ================================================================== */

function StatsTab() {
  const { data, isLoading, error } = useQuery<AIStats>({
    queryKey: ['ai-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/ai/stats')
      if (!res.ok) throw new Error('Chyba pri načítavaní štatistík')
      return res.json()
    },
    refetchInterval: 30000,
  })

  if (error) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="py-10">
          <div className="flex flex-col items-center gap-2 text-destructive">
            <p className="text-sm">Nepodarilo sa načítať štatistiky</p>
            <p className="text-xs text-muted-foreground">
              {error instanceof Error ? error.message : 'Neznáma chyba'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="border-border/40">
            <CardContent className="py-6">
              <div className="flex items-center gap-3">
                <div className="size-10 animate-pulse rounded-lg bg-muted" />
                <div className="space-y-2">
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-6 w-16 animate-pulse rounded bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const sortedTypes = Object.entries(data.byType).sort(
    ([, a], [, b]) => b - a,
  )

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/40">
          <CardContent className="py-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10">
                <Zap className="size-5 text-brand" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Celkovo</p>
                <p className="text-2xl font-bold">{data.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardContent className="py-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-warm/10">
                <MessageSquare className="size-5 text-warm-dark" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chatbot</p>
                <p className="text-2xl font-bold">
                  {data.byType['chatbot'] ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardContent className="py-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-eco/10">
                <Sparkles className="size-5 text-eco" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Generované</p>
                <p className="text-2xl font-bold">
                  {Object.entries(data.byType)
                    .filter(([k]) => k.startsWith('generate_'))
                    .reduce((s, [, v]) => s + v, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardContent className="py-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100">
                <Clock className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Priem. doba</p>
                <p className="text-2xl font-bold">{data.avgDurationMs}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* By type breakdown */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-lg">Podľa typu</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Zatiaľ žiadne AI interakcie
              </p>
            ) : (
              <div className="space-y-3">
                {sortedTypes.map(([type, count]) => {
                  const Icon = TYPE_ICONS[type] || Zap
                  const pct =
                    data.total > 0 ? Math.round((count / data.total) * 100) : 0
                  return (
                    <div key={type} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Icon className="size-3.5 text-muted-foreground" />
                          <span>{TYPE_LABELS[type] || type}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span>{count}x</span>
                          <Badge variant="secondary" className="text-xs">
                            {pct}%
                          </Badge>
                        </div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-brand transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent interactions */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-lg">Najnovšie interakcie</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentInteractions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Zatiaľ žiadne AI interakcie
              </p>
            ) : (
              <ScrollArea className="max-h-[360px]">
                <div className="space-y-3">
                  {data.recentInteractions.map((item) => {
                    const Icon = TYPE_ICONS[item.type] || Zap
                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 rounded-lg border border-border/40 p-3"
                      >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                          <Icon className="size-3.5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {TYPE_LABELS[item.type] || item.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {item.durationMs}ms
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-foreground truncate">
                            {item.input}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {item.user.name} •{' '}
                            {new Date(item.createdAt).toLocaleString('sk-SK')}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
