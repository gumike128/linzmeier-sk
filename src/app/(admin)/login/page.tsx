'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import Image from 'next/image'
import { Loader2, Lock, Mail, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Chyba prihlásenia', { description: 'Nesprávny email alebo heslo.' })
      } else {
        router.push('/admin/dashboard')
      }
    } catch {
      toast.error('Chyba', { description: 'Nastala neočakávaná chyba.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center mb-2">
            <Image
              src="/logo.png"
              alt="LINZMEIER Admin"
              width={160}
              height={48}
              className="h-12 w-auto"
            />
          </div>
          <CardTitle className="text-xl">Prihlásenie do administrácie</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Zadajte svoje prihlasovacie údaje</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@linzmeier.sk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Heslo</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-brand-dark hover:bg-brand text-white"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin mr-2 size-4" /> : null}
              Prihlásiť sa
            </Button>
          </form>

          {/* View pages link */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-dark transition-colors"
            >
              <ExternalLink className="size-3.5" />
              Zobraziť stránky
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
