import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { Header } from '@/components/linzmeier/Header'
import { Footer } from '@/components/linzmeier/Footer'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
  MapPin,
  Building2,
  Home,
  Factory,
  ArrowRight,
  CheckCircle2,
  Eye,
  LayoutGrid,
} from 'lucide-react'

// ─── Types & Config ──────────────────────────────────────────────────

interface Reference {
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
  createdAt: Date
  updatedAt: Date
}

const TYPE_FILTERS = [
  { key: '', label: 'Všetky', icon: LayoutGrid },
  { key: 'rodinny_dom', label: 'Rodinné domy', icon: Home },
  { key: 'bytovy_dom', label: 'Bytové domy', icon: Building2 },
  { key: 'priemysel', label: 'Priemysel', icon: Factory },
] as const

const TYPE_LABELS: Record<string, string> = {
  rodinny_dom: 'Rodinný dom',
  bytovy_dom: 'Bytový dom',
  priemysel: 'Priemysel',
}

const TYPE_COLORS: Record<string, string> = {
  rodinny_dom: 'bg-blue-100 text-blue-700 border-blue-200',
  bytovy_dom: 'bg-purple-100 text-purple-700 border-purple-200',
  priemysel: 'bg-orange-100 text-orange-700 border-orange-200',
}

const TYPE_ICON_COLORS: Record<string, string> = {
  rodinny_dom: 'text-blue-500',
  bytovy_dom: 'text-purple-500',
  priemysel: 'text-orange-500',
}

function parseTags(tags: string | null): string[] {
  if (!tags) return []
  try {
    const parsed = JSON.parse(tags)
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean)
  } catch {
    // ignore
  }
  return tags.split(',').map((s) => s.trim()).filter(Boolean)
}

// ─── Page Component ──────────────────────────────────────────────────

export default async function ReferenciePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams

  const references: Reference[] = await db.reference.findMany({
    where: {
      status: 'PUBLISHED',
      ...(type ? { type } : {}),
    },
    orderBy: { sortOrder: 'asc' },
  })

  const totalCount = await db.reference.count({
    where: { status: 'PUBLISHED' },
  })

  return (
    <>
      <Header />

      <main className="min-h-screen flex flex-col">
        {/* ═══ Hero Section ═══ */}
        <section className="relative overflow-hidden bg-brand-dark">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand-dark/95 to-brand-dark/80" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    asChild
                    className="text-white/60 hover:text-white"
                  >
                    <Link href="/">Domov</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/30" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white">
                    Referencie
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Title */}
            <div className="max-w-2xl">
              <Badge className="bg-warm text-brand-dark mb-4 border-none text-xs font-semibold px-3 py-1">
                <CheckCircle2 className="size-3.5 mr-1.5" />
                {totalCount} {totalCount === 1 ? 'realizácia' : totalCount < 5 ? 'realizácie' : 'realizácií'}
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
                Naše referencie
              </h1>
              <p className="text-lg text-white/70 max-w-xl">
                Prehľad našich úspešných projektov po celom Slovensku. Od rodinných
                domov cez bytové domy až po priemyselné objekty — pozrite sa na
                realizácie, ktoré hovoria za nás.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/10">
              {[
                { value: '40+', label: 'Rokov skúseností', icon: CheckCircle2 },
                { value: '5 000+', label: 'Realizácií', icon: Building2 },
                { value: '98%', label: 'Spokojných klientov', icon: Eye },
                { value: 'CE', label: 'Certifikované systémy', icon: CheckCircle2 },
              ].map((stat) => (
                <div key={stat.label} className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <stat.icon className="size-4 text-warm" />
                    <span className="text-2xl font-bold text-white">
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-sm text-white/50">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Filter Bar ═══ */}
        <section className="border-b border-border/50 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground mr-1 hidden sm:inline">
                Filtrovať:
              </span>
              {TYPE_FILTERS.map((filter) => {
                const isActive = (type || '') === filter.key
                return (
                  <Link key={filter.key} href={filter.key ? `/referencie?type=${filter.key}` : '/referencie'}>
                    <Badge
                      variant={isActive ? 'default' : 'outline'}
                      className={`
                        cursor-pointer select-none transition-all duration-200 gap-1.5 px-3 py-1.5 text-sm font-medium
                        ${isActive
                          ? 'bg-brand-dark text-white hover:bg-brand-dark/90 border-brand-dark'
                          : 'border-border/60 text-muted-foreground hover:border-brand-dark/40 hover:text-foreground bg-white'
                        }
                      `}
                    >
                      <filter.icon className="size-3.5" />
                      {filter.label}
                    </Badge>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* ═══ References Grid ═══ */}
        <section className="flex-1">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
            {references.length === 0 ? (
              /* ── Empty State ── */
              <Card className="p-12 text-center border-border/40">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center justify-center size-16 rounded-full bg-muted">
                    <Building2 className="size-8 text-muted-foreground/40" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Žiadne referencie
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {type
                        ? `Momentálne nemáme žiadne realizácie typu "${TYPE_LABELS[type] || type}". Skúste iný filter alebo si prezrite všetky referencie.`
                        : 'Momentálne nie sú k dispozícii žiadne publikované referencie. Navštívte nás neskôr alebo nás kontaktujte.'}
                    </p>
                  </div>
                  {type && (
                    <Button
                      asChild
                      variant="outline"
                      className="gap-2 mt-2"
                    >
                      <Link href="/referencie">
                        Zobraziť všetky referencie
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                    {type
                      ? TYPE_LABELS[type] || 'Referencie'
                      : 'Všetky realizácie'}
                  </h2>
                  <p className="text-muted-foreground max-w-2xl">
                    Zobrazujeme <span className="font-medium text-foreground">{references.length}</span>{' '}
                    {references.length === 1
                      ? 'referenciu'
                      : references.length < 5
                        ? 'referencie'
                        : 'referencií'}
                    {type
                      ? ` v kategórii ${TYPE_LABELS[type] || type}`
                      : ''}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {references.map((ref) => (
                    <Card
                      key={ref.id}
                      className="group overflow-hidden border-border/40 hover:border-brand-dark/30 hover:shadow-lg transition-all duration-300"
                    >
                      {/* Cover Image */}
                      {ref.coverImage && (
                        <div className="relative h-52 overflow-hidden bg-muted">
                          <Image
                            src={ref.coverImage}
                            alt={ref.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                          {/* Type badge on image */}
                          <Badge
                            className={`
                              absolute top-3 left-3 text-[11px] font-semibold border
                              ${TYPE_COLORS[ref.type] || 'bg-gray-100 text-gray-700 border-gray-200'}
                            `}
                          >
                            <TypeIcon type={ref.type} />
                            {TYPE_LABELS[ref.type] || ref.type}
                          </Badge>
                        </div>
                      )}

                      {!ref.coverImage && (
                        <div className="relative h-40 bg-gradient-to-br from-brand-dark/5 to-brand-dark/10 flex items-center justify-center">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                            <TypeIconLarge type={ref.type} />
                            <span className="text-xs">Bez obrázku</span>
                          </div>
                          {/* Type badge */}
                          <Badge
                            className={`
                              absolute top-3 left-3 text-[11px] font-semibold border
                              ${TYPE_COLORS[ref.type] || 'bg-gray-100 text-gray-700 border-gray-200'}
                            `}
                          >
                            <TypeIcon type={ref.type} />
                            {TYPE_LABELS[ref.type] || ref.type}
                          </Badge>
                        </div>
                      )}

                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold line-clamp-2 group-hover:text-brand-dark transition-colors">
                          {ref.title}
                        </CardTitle>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="size-3.5 shrink-0" />
                          <span className="truncate">{ref.location}</span>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0 space-y-3">
                        {ref.system && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {ref.system}
                          </p>
                        )}

                        {ref.tags && parseTags(ref.tags).length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {parseTags(ref.tags).slice(0, 4).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-[10px] border-border/50 text-muted-foreground font-normal"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {parseTags(ref.tags).length > 4 && (
                              <Badge
                                variant="outline"
                                className="text-[10px] border-border/50 text-muted-foreground font-normal"
                              >
                                +{parseTags(ref.tags).length - 4}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* ═══ CTA Section ═══ */}
        <section className="bg-muted/30 border-t border-border/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <Card className="bg-brand-dark text-white border-0 overflow-hidden relative">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-warm/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <CardContent className="relative p-8 sm:p-12">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                  <div className="max-w-lg">
                    <Badge className="bg-warm text-brand-dark mb-4 border-none text-xs font-semibold px-3 py-1">
                      <CheckCircle2 className="size-3.5 mr-1.5" />
                      Začnite s nami
                    </Badge>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                      Máte záujem o podobnú realizáciu?
                    </h2>
                    <p className="text-white/60 text-sm sm:text-base leading-relaxed">
                      Kontaktujte nás a my vám pripravíme bezplatnú cenovú ponuku
                      prispôsobenú vašmu projektu. Naši odborníci sú vám k
                      dispozícii.
                    </p>
                    <div className="flex items-center gap-4 mt-5 text-sm text-white/50">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-4 text-warm" />
                        Bezplatná konzultácia
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-4 text-warm" />
                        Odpoveď do 24 hodín
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                    <Button
                      asChild
                      size="lg"
                      className="bg-warm text-brand-dark hover:bg-warm-dark shadow-lg shadow-warm/20 gap-2"
                    >
                      <Link href="/#kontakt">
                        Nezáväzná ponuka
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="border-white/20 text-white hover:bg-white/10 hover:text-white"
                    >
                      <Link href="/partner">
                        <Eye className="size-4 mr-2" />
                        Partner portal
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

// ─── Helper: Type Icon (small) ───────────────────────────────────────

function TypeIcon({ type }: { type: string }) {
  const className = `size-3 mr-1 ${TYPE_ICON_COLORS[type] || 'text-gray-500'}`
  switch (type) {
    case 'rodinny_dom':
      return <Home className={className} />
    case 'bytovy_dom':
      return <Building2 className={className} />
    case 'priemysel':
      return <Factory className={className} />
    default:
      return <Building2 className={className} />
  }
}

// ─── Helper: Type Icon (large, for placeholder) ──────────────────────

function TypeIconLarge({ type }: { type: string }) {
  const className = `size-10 ${TYPE_ICON_COLORS[type] || 'text-muted-foreground/40'}`
  switch (type) {
    case 'rodinny_dom':
      return <Home className={className} />
    case 'bytovy_dom':
      return <Building2 className={className} />
    case 'priemysel':
      return <Factory className={className} />
    default:
      return <Building2 className={className} />
  }
}
