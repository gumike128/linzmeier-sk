'use client'

import { useState, useRef, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageCircle, X, Send, Loader2, Bot } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

/* ── Markdown prose styles for chat bubbles ────────────────────────── */
function ChatMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }: { children?: ReactNode }) => (
          <p className="m-0 last:mb-0">{children}</p>
        ),
        strong: ({ children }: { children?: ReactNode }) => (
          <strong className="font-semibold">{children}</strong>
        ),
        ul: ({ children }: { children?: ReactNode }) => (
          <ul className="m-0 mt-1.5 pl-4 list-disc space-y-0.5">{children}</ul>
        ),
        ol: ({ children }: { children?: ReactNode }) => (
          <ol className="m-0 mt-1.5 pl-4 list-decimal space-y-0.5">{children}</ol>
        ),
        li: ({ children }: { children?: ReactNode }) => (
          <li className="leading-relaxed">{children}</li>
        ),
        a: ({ href, children }: { href?: string; children?: ReactNode }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-warm-dark"
          >
            {children}
          </a>
        ),
        code: ({ className, children }: { className?: string; children?: ReactNode }) => {
          // Inline code (no className) vs code block
          const isBlock = className?.includes('language-')
          if (isBlock) {
            return (
              <pre className="mt-1.5 mb-1 overflow-x-auto rounded-md bg-black/5 p-2 text-xs">
                <code className={className}>{children}</code>
              </pre>
            )
          }
          return (
            <code className="rounded bg-black/5 px-1 py-0.5 text-xs font-mono">
              {children}
            </code>
          )
        },
        h1: ({ children }: { children?: ReactNode }) => (
          <h1 className="text-base font-bold mb-1">{children}</h1>
        ),
        h2: ({ children }: { children?: ReactNode }) => (
          <h2 className="text-sm font-bold mb-1">{children}</h2>
        ),
        h3: ({ children }: { children?: ReactNode }) => (
          <h3 className="text-sm font-semibold mb-0.5">{children}</h3>
        ),
        blockquote: ({ children }: { children?: ReactNode }) => (
          <blockquote className="border-l-2 border-warm pl-3 italic opacity-90 my-1">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-2 border-border" />,
        table: ({ children }: { children?: ReactNode }) => (
          <div className="my-1.5 overflow-x-auto">
            <table className="w-full text-xs border-collapse">{children}</table>
          </div>
        ),
        th: ({ children }: { children?: ReactNode }) => (
          <th className="border border-border bg-muted px-2 py-1 text-left font-semibold">
            {children}
          </th>
        ),
        td: ({ children }: { children?: ReactNode }) => (
          <td className="border border-border px-2 py-1">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const welcomeMessage =
    'Dobrý deň! Som AI asistent LINZMEIER. Pomôžem vám s výberom produktov, technickými informáciami alebo cenovou ponukou. Čo vás zaujíma?'

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'assistant', content: welcomeMessage }])
    }
  }, [isOpen, messages.length])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages])

  async function handleSend() {
    if (!input.trim() || isLoading) return
    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      })
      const data = await res.json()
      if (res.ok && data.response) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.response },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.error || 'Ospravedlňujem sa, nastala chyba pri spracovaní. Skúste to prosím neskôr.',
          },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Ospravedlňujem sa, nastala chyba. Skúste to prosím neskôr.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-6 z-40 flex items-center justify-center size-14 rounded-full bg-brand-dark text-white shadow-lg hover:bg-brand transition-colors"
            aria-label="Otvoriť chat"
          >
            <MessageCircle className="size-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-40 w-[380px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-brand-dark text-white shrink-0">
              <div className="flex items-center gap-2">
                <Bot className="size-5" />
                <span className="font-semibold text-sm">
                  LINZMEIER AI Asistent
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Zavrieť chat"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-warm text-brand-dark rounded-br-sm'
                        : 'bg-muted text-foreground rounded-bl-sm'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <ChatMarkdown content={msg.content} />
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted px-3 py-2 rounded-xl rounded-bl-sm">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Napíšte správu..."
                  className="flex-1 h-9 text-sm"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-9 w-9 bg-brand-dark hover:bg-brand shrink-0"
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="size-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
