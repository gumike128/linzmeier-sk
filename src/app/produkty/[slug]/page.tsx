import { notFound } from 'next/navigation'
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
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Building2,
  Home,
  Factory,
  Package,
  Layers,
  PanelTop,
  Wrench,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────
interface SpecItem {
  label: string
  value: string
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

const categoryIcons: Record<string, React.ReactNode> = {
  'izolacne-panely': <Layers className="size-5" />,
  'fasadne-systemy': <Package className="size-5" />,
  'priecelove-dosky': <PanelTop className="size-5" />,
  'prislusenstvo': <Wrench className="size-5" />,
}

const categoryLabels: Record<string, string> = {
  'izolacne-panely': 'Izolačné panely',
  'fasadne-systemy': 'Fasádne systémy',
  'priecelove-dosky': 'Priečelové dosky',
  'prislusenstvo': 'Príslušenstvo',
}

const suitableForIcons: Record<string, React.ReactNode> = {
  'rodinne-domy': <Home className="size-4" />,
  'bytove-domy': <Building2 className="size-4" />,
  'priemysel': <Factory className="size-4" />,
}

const suitableForLabels: Record<string, string> = {
  'rodinne-domy': 'Rodinné domy',
  'bytove-domy': 'Bytové domy',
  'priemysel': 'Priemysel',
}

// ─── Page ─────────────────────────────────────────────────────────────
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const product = await db.product.findUnique({
    where: { slug },
  })

  if (!product || product.status !== 'PUBLISHED') {
    notFound()
  }

  const specs = safeParse<SpecItem[]>(product.specs)
  const benefits = safeParse<BenefitItem[]>(product.benefits)
  const suitableFor = safeParse<string[]>(product.suitableFor)
  const galleryImages = safeParse<string[]>(product.galleryImages)

  const categoryIcon = categoryIcons[product.category] || <Package className="size-5" />
  const categoryLabel = categoryLabels[product.category] || product.category

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">
        {/* ── Breadcrumb Bar ──────────────────────────────────── */}
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
                  <BreadcrumbLink asChild>
                    <Link href="/#produkty">Produkty</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium text-foreground">
                    {product.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </section>

        {/* ── Product Content ──────────────────────────────────── */}
        <section className="py-10 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Back button */}
            <Button
              variant="ghost"
              asChild
              className="mb-6 text-muted-foreground hover:text-foreground -ml-2"
            >
              <Link href="/#produkty">
                <ArrowLeft className="size-4 mr-1.5" />
                Späť na produkty
              </Link>
            </Button>

            <div className="grid gap-10 lg:grid-cols-5 lg:gap-16">
              {/* ── Left: Image + Gallery ──────────────────── */}
              <div className="lg:col-span-2">
                <div className="sticky top-24 space-y-4">
                  {/* Main image */}
                  {product.imageUrl && (
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border/40 bg-muted/30">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 1024px) 100vw, 40vw"
                      />
                    </div>
                  )}

                  {/* Gallery thumbnails */}
                  {galleryImages && galleryImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                      {galleryImages.slice(0, 4).map((img, i) => (
                        <div
                          key={i}
                          className="relative aspect-square rounded-lg overflow-hidden border border-border/40 bg-muted/30"
                        >
                          <Image
                            src={img}
                            alt={`${product.name} - ${i + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 25vw, 10vw"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No image placeholder */}
                  {!product.imageUrl && (
                    <div className="aspect-[4/3] rounded-xl bg-muted/50 border border-dashed border-border/60 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Package className="size-12 mx-auto mb-3 opacity-40" />
                        <p className="text-sm">Obrázok produktu</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Right: Details ────────────────────────────── */}
              <div className="lg:col-span-3 space-y-8">
                {/* Category badge */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-brand-dark/10 text-brand-dark border-brand-dark/20 gap-1.5 px-3 py-1"
                  >
                    {categoryIcon}
                    {categoryLabel}
                  </Badge>
                </div>

                {/* Product name */}
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-dark">
                  {product.name}
                </h1>

                {/* Short description */}
                {product.shortDesc && (
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {product.shortDesc}
                  </p>
                )}

                {/* CTA buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button
                    asChild
                    size="lg"
                    className="bg-warm text-brand-dark hover:bg-warm-dark shadow-md"
                  >
                    <Link href="/#kontakt">
                      Požiadať o ponuku
                      <ChevronRight className="size-4 ml-1" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/#kontakt">
                      Kontaktujte nás
                    </Link>
                  </Button>
                </div>

                {/* Divider */}
                <div className="h-px bg-border/60" />

                {/* ── Full Description ────────────────────── */}
                {product.description && (
                  <div className="prose prose-neutral max-w-none">
                    <h2 className="text-xl font-semibold text-foreground mb-3">
                      Popis produktu
                    </h2>
                    <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {product.description}
                    </div>
                  </div>
                )}

                {/* ── Benefits ─────────────────────────────── */}
                {benefits && benefits.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                      Výhody
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {benefits.map((benefit, i) => (
                        <Card
                          key={i}
                          className="border-border/40 bg-muted/20 hover:bg-muted/40 transition-colors"
                        >
                          <CardContent className="p-4 flex gap-3">
                            <CheckCircle2 className="size-5 text-eco shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {benefit.title}
                              </p>
                              {benefit.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {benefit.description}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Technical Specifications ──────────────── */}
                {specs && specs.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                      Technické parametre
                    </h2>
                    <Card className="border-border/40">
                      <CardContent className="p-0">
                        <div className="divide-y divide-border/40">
                          {specs.map((spec, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between px-5 py-3.5"
                            >
                              <span className="text-sm text-muted-foreground">
                                {spec.label}
                              </span>
                              <span className="text-sm font-medium text-foreground">
                                {spec.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* ── Suitable For ─────────────────────────── */}
                {suitableFor && suitableFor.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                      Vhodné pre
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {suitableFor.map((item) => {
                        const key = item.toLowerCase().replace(/\s+/g, '-')
                        return (
                          <Badge
                            key={key}
                            variant="outline"
                            className="gap-1.5 px-3 py-1.5 text-sm border-border/60 bg-background hover:bg-muted/50"
                          >
                            {suitableForIcons[key] || <Building2 className="size-4" />}
                            {suitableForLabels[key] || item}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ── Bottom CTA ────────────────────────────── */}
                <div className="rounded-xl bg-brand-dark p-6 sm:p-8 mt-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Zaujal vás tento produkt?
                      </h3>
                      <p className="text-sm text-white/60 mt-1">
                        Kontaktujte nás a získajte cenovú ponuku na mieru.
                      </p>
                    </div>
                    <Button
                      asChild
                      size="lg"
                      className="bg-warm text-brand-dark hover:bg-warm-dark shadow-md shrink-0"
                    >
                      <Link href="/#kontakt">
                        Požiadať o ponuku
                        <ChevronRight className="size-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
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
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  const product = await db.product.findUnique({
    where: { slug },
  })

  if (!product || product.status !== 'PUBLISHED') {
    return { title: 'Produkt nenájdený | LINZMEIER.SK' }
  }

  return {
    title: product.metaTitle || `${product.name} | LINZMEIER.SK`,
    description:
      product.metaDescription ||
      product.shortDesc ||
      `${product.name} od LINZMEIER – nemecká kvalita pre slovenský trh.`,
    openGraph: {
      title: product.metaTitle || `${product.name} | LINZMEIER.SK`,
      description:
        product.metaDescription ||
        product.shortDesc ||
        undefined,
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
      type: 'website',
      locale: 'sk_SK',
    },
  }
}
