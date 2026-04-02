import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { db } from '@/lib/db'
import { Header } from '@/components/linzmeier/Header'
import { Footer } from '@/components/linzmeier/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Layers,
  Package,
  PanelTop,
  Wrench,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────
interface ProductRecord {
  id: string
  name: string
  slug: string
  shortDesc: string | null
  description: string | null
  category: string
  imageUrl: string | null
  benefits: string | null
  suitableFor: string | null
  sortOrder: number
}

interface BenefitItem {
  title: string
  description?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────
function safeParse<T>(value: string | null): T | null {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

const categoryConfig: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  'izolacne-panely': {
    label: 'Izolačné panely',
    icon: <Layers className="size-6" />,
    color: 'text-blue-600',
  },
  'fasadne-systemy': {
    label: 'Fasádne systémy',
    icon: <Package className="size-6" />,
    color: 'text-orange-600',
  },
  'priecelove-dosky': {
    label: 'Priečelové dosky',
    icon: <PanelTop className="size-6" />,
    color: 'text-emerald-600',
  },
  prislusenstvo: {
    label: 'Príslušenstvo',
    icon: <Wrench className="size-6" />,
    color: 'text-purple-600',
  },
}

const defaultCategoryConfig = {
  label: 'Ostatné produkty',
  icon: <Package className="size-6" />,
  color: 'text-gray-600',
}

// ─── Page ─────────────────────────────────────────────────────────────
export default async function ProduktyPage() {
  const products = await db.product.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
  })

  // Group products by category slug
  const grouped = products.reduce<
    Record<string, ProductRecord[]>
  >((acc, p) => {
    const cat = p.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  // Category display order
  const categoryOrder = [
    'izolacne-panely',
    'fasadne-systemy',
    'priecelove-dosky',
    'prislusenstvo',
  ]

  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const aIdx = categoryOrder.indexOf(a)
    const bIdx = categoryOrder.indexOf(b)
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
    if (aIdx !== -1) return -1
    if (bIdx !== -1) return 1
    return 0
  })

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">
        {/* ── Breadcrumb ────────────────────────────────────── */}
        <section className="bg-muted/40 border-b border-border/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">Domov</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium text-foreground">
                    Produkty
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </section>

        {/* ── Hero Section ──────────────────────────────────── */}
        <section className="bg-brand-dark relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-warm)_0%,_transparent_50%)] opacity-20" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative">
            <div className="max-w-2xl">
              <Badge
                variant="secondary"
                className="bg-warm/20 text-warm-dark border-warm/30 mb-4 px-3 py-1"
              >
                Katalóg produktov
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
                Naše produkty
              </h1>
              <p className="text-lg text-white/70 leading-relaxed">
                Komplexný systém fasádnych riešení z jednej ruky — od izolačných
                panelov cez fasádne systémy až po architektonické priečelové dosky
                a kompletné príslušenstvo.
              </p>
            </div>
          </div>
        </section>

        {/* ── Category Navigation ───────────────────────────── */}
        {sortedCategories.length > 0 && (
          <section className="border-b border-border/40 sticky top-16 z-10 bg-background/95 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <nav className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-none">
                {sortedCategories.map((cat) => {
                  const config = categoryConfig[cat] || defaultCategoryConfig
                  return (
                    <a
                      key={cat}
                      href={`#${cat}`}
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/60 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-muted/50 transition-colors whitespace-nowrap"
                    >
                      <span className={config.color}>{config.icon}</span>
                      {config.label}
                    </a>
                  )
                })}
              </nav>
            </div>
          </section>
        )}

        {/* ── Products by Category ──────────────────────────── */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {sortedCategories.length === 0 ? (
              <div className="text-center py-20">
                <Package className="size-16 mx-auto mb-4 text-muted-foreground/30" />
                <h2 className="text-xl font-semibold text-muted-foreground mb-2">
                  Žiadne produkty
                </h2>
                <p className="text-muted-foreground/60">
                  V súčasnosti nie sú k dispozícii žiadne publikované produkty.
                  Kontaktujte nás pre viac informácií.
                </p>
                <Button
                  asChild
                  className="mt-6 bg-warm text-brand-dark hover:bg-warm-dark"
                >
                  <Link href="/#kontakt">
                    Kontaktujte nás
                    <ArrowRight className="size-4 ml-1" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-16">
                {sortedCategories.map((cat) => {
                  const config = categoryConfig[cat] || defaultCategoryConfig
                  const catProducts = grouped[cat]
                  return (
                    <div key={cat} id={cat} className="scroll-mt-32">
                      {/* Category header */}
                      <div className="flex items-center gap-3 mb-8">
                        <div
                          className={`flex items-center justify-center size-12 rounded-xl bg-muted/60 ${config.color}`}
                        >
                          {config.icon}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">
                            {config.label}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {catProducts.length}{' '}
                            {catProducts.length === 1 ? 'produkt' : catProducts.length < 5 ? 'produkty' : 'produktov'}
                          </p>
                        </div>
                      </div>

                      {/* Products grid */}
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {catProducts.map((product) => {
                          const benefits = safeParse<BenefitItem[]>(
                            product.benefits
                          )
                          const suitableFor = safeParse<string[]>(
                            product.suitableFor
                          )

                          return (
                            <Card
                              key={product.id}
                              className="group overflow-hidden border border-border/50 hover:shadow-lg hover:shadow-brand/5 transition-all duration-300 hover:-translate-y-1"
                            >
                              {/* Image */}
                              {product.imageUrl ? (
                                <Link
                                  href={`/produkty/${product.slug}`}
                                  className="block relative aspect-video overflow-hidden"
                                >
                                  <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                </Link>
                              ) : (
                                <Link
                                  href={`/produkty/${product.slug}`}
                                  className="block relative aspect-video overflow-hidden bg-gradient-to-br from-brand/10 via-warm-light/30 to-eco-light/20"
                                >
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/80 shadow-sm">
                                      {config.icon}
                                    </div>
                                  </div>
                                </Link>
                              )}

                              {/* Content */}
                              <CardContent className="p-5 flex flex-col gap-3">
                                <Link href={`/produkty/${product.slug}`}>
                                  <h3 className="text-lg font-semibold text-brand-dark hover:text-warm-dark transition-colors leading-snug">
                                    {product.name}
                                  </h3>
                                </Link>

                                {product.shortDesc && (
                                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                    {product.shortDesc}
                                  </p>
                                )}

                                {/* Benefits */}
                                {benefits && benefits.length > 0 && (
                                  <div className="space-y-1.5 pt-1">
                                    {benefits.slice(0, 3).map((b, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center gap-2 text-sm"
                                      >
                                        <CheckCircle2 className="size-3.5 text-eco shrink-0" />
                                        <span className="text-muted-foreground">
                                          {b.title}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Suitable for */}
                                {suitableFor && suitableFor.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    {suitableFor.map((s) => (
                                      <Badge
                                        key={s}
                                        variant="secondary"
                                        className="text-xs bg-muted/80 text-muted-foreground border-0"
                                      >
                                        {s}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                {/* CTA */}
                                <Link
                                  href={`/produkty/${product.slug}`}
                                  className="inline-flex items-center gap-1 text-sm font-medium text-warm-dark hover:text-warm-dark transition-colors pt-1"
                                >
                                  Zobraziť detail
                                  <ChevronRight className="size-3.5" />
                                </Link>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── Bottom CTA ─────────────────────────────────── */}
            <div className="mt-20 rounded-2xl bg-brand-dark p-8 sm:p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--color-warm)_0%,_transparent_60%)] opacity-15" />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    Potrebujete poradiť s výberom produktov?
                  </h3>
                  <p className="text-white/60 max-w-lg">
                    Naši technickí poradci vám pomôžu vybrať ten najlepší
                    systém pre váš projekt. Bezplatná konzultácia.
                  </p>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="bg-warm text-brand-dark hover:bg-warm-dark shadow-lg shrink-0"
                >
                  <Link href="/#kontakt">
                    Nezáväzná konzultácia
                    <ArrowRight className="size-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

// ─── Metadata ─────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Produkty | LINZMEIER.SK',
  description:
    'Polyuretánové izolačné systémy LINITHERM — nadkrokvová izolácia, plochá strecha, izolácia stropu, prevetrávaná fasáda a podlaha. Prémiová kvalita z Nemecka pre slovenský trh.',
  openGraph: {
    title: 'Produkty | LINZMEIER.SK',
    description:
      'Polyuretánové izolačné systémy LINITHERM — nadkrokvová izolácia, plochá strecha, izolácia stropu, prevetrávaná fasáda a podlaha.',
    locale: 'sk_SK',
    type: 'website',
  },
}
