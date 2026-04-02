'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Package,
  FileText,
  Info,
  Download,
  ExternalLink,
  ArrowRight,
  Shield,
  Award,
  Clock,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
  Building2,
  Factory,
  Layers,
  ChevronRight,
  Handshake,
  Globe,
  TrendingUp,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────
interface Product {
  id: string
  name: string
  slug: string
  shortDesc: string | null
  description: string | null
  category: string
  specs: string | null
  benefits: string | null
  imageUrl: string | null
  suitableFor: string | null
}

interface Document {
  id: string
  title: string
  description: string | null
  category: string
  fileType: string
  fileSize: number | null
  fileUrl: string
}

// ─── Category helpers ───────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  panels: 'Izolačné panely',
  facades: 'Fasádne systémy',
  boards: 'Priečelové dosky',
  accessories: 'Príslušenstvo',
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  panels: <Layers className="size-4" />,
  facades: <Package className="size-4" />,
  boards: <Building2 className="size-4" />,
  accessories: <Factory className="size-4" />,
}

const DOC_CATEGORY_LABELS: Record<string, string> = {
  TECHNICAL: 'Technické listy',
  BIM: 'BIM / CAD podklady',
  MANUAL: 'Montážne návody',
  CERTIFICATE: 'Certifikáty',
  CATALOG: 'Katalógy',
  OTHER: 'Ostatné',
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function parseSuitableFor(value: string | null): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed.map(String)
  } catch {
    // ignore
  }
  return value.split(',').map((s) => s.trim()).filter(Boolean)
}

// ─── Partner Portal Page ────────────────────────────────────────────
export default function PartnerPortal() {
  const [products, setProducts] = useState<Product[]>([])
  const [docsByCategory, setDocsByCategory] = useState<
    Record<string, Document[]>
  >({})
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productDetailOpen, setProductDetailOpen] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const url = filterCategory
          ? `/api/public/products?category=${filterCategory}`
          : '/api/public/products'
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setProducts(data.products)
        }
      } catch (err) {
        console.error('Failed to fetch products:', err)
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchProducts()
  }, [filterCategory])

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const res = await fetch('/api/public/documents')
        if (res.ok) {
          const data = await res.json()
          setDocsByCategory(data.documents)
        }
      } catch (err) {
        console.error('Failed to fetch documents:', err)
      } finally {
        setLoadingDocs(false)
      }
    }
    fetchDocuments()
  }, [])

  function handleProductClick(product: Product) {
    setSelectedProduct(product)
    setProductDetailOpen(true)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ─── Header Navigation ────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-brand-dark">
                LINZMEIER
              </span>
              <Badge className="bg-warm text-brand-dark text-[10px] font-semibold px-1.5 py-0 rounded-sm border-none">
                SK
              </Badge>
            </Link>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-brand-dark/30 text-brand-dark text-xs font-medium px-3 py-1"
              >
                <Handshake className="size-3.5 mr-1.5" />
                Partner Portal
              </Badge>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Hero Banner ──────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/partner-banner.png"
            alt="LINZMEIER Partner Portal"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/95 via-brand-dark/80 to-brand-dark/60" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl">
            <Badge className="bg-warm text-brand-dark mb-4 border-none text-xs font-semibold px-3 py-1">
              <Handshake className="size-3.5 mr-1.5" />
              Partner Portal
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
              Technické dokumenty
              <br />
              <span className="text-warm">bez prihlásenia</span>
            </h1>
            <p className="text-lg text-white/70 mb-8 max-w-xl">
              Stiahnite si technické dokumentácie, produktové informácie a
              certifikáty. Všetko, čo potrebujete pre váš projekt — na jednom
              mieste.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="bg-warm text-brand-dark hover:bg-warm-dark shadow-lg shadow-warm/20"
              >
                <Link href="#produkty" className="gap-2">
                  Zobraziť produkty
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="border-white/20 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="#dokumenty" className="gap-2">
                  <Download className="size-4" />
                  Stiahnuť dokumenty
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/10">
            {[
              { value: '40+', label: 'Rokov skúseností', icon: Clock },
              { value: '5 000+', label: 'Realizácií', icon: Building2 },
              { value: 'ISO 9001', label: 'Certifikovaný', icon: Award },
              { value: 'DE+SK', label: 'Trhy', icon: Globe },
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

      {/* ─── Main Content ─────────────────────────────────── */}
      <section className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <Tabs defaultValue="produkty" className="w-full">
            <TabsList className="w-full justify-start bg-muted/50 p-1 h-auto mb-8 flex-wrap gap-1">
              <TabsTrigger
                value="produkty"
                className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm"
              >
                <Package className="size-4" />
                Produkty
              </TabsTrigger>
              <TabsTrigger
                value="dokumenty"
                className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm"
              >
                <FileText className="size-4" />
                Technické dokumenty
              </TabsTrigger>
              <TabsTrigger
                value="o-systeme"
                className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm"
              >
                <Info className="size-4" />
                O systéme
              </TabsTrigger>
            </TabsList>

            {/* ══════ Produkty Tab ══════ */}
            <TabsContent value="produkty" id="produkty">
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Naše produkty
                </h2>
                <p className="text-muted-foreground max-w-2xl">
                  Prehľadávajte našu ponuku izolačných panelov, fasádnych
                  systémov a príslušenstva. Kliknutím na produkt zobrazíte
                  detailné informácie.
                </p>
              </div>

              {/* Category filters */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Button
                  variant={filterCategory === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterCategory(null)}
                  className={
                    filterCategory === null
                      ? 'bg-brand-dark text-white hover:bg-brand-dark/90'
                      : ''
                  }
                >
                  Všetky
                </Button>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <Button
                    key={key}
                    variant={filterCategory === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterCategory(key)}
                    className={
                      filterCategory === key
                        ? 'bg-brand-dark text-white hover:bg-brand-dark/90'
                        : ''
                    }
                  >
                    {label}
                  </Button>
                ))}
              </div>

              {/* Products grid */}
              {loadingProducts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-40 w-full" />
                      <CardHeader className="pb-2">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <Card className="p-12 text-center">
                  <Package className="size-12 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Žiadne produkty
                  </h3>
                  <p className="text-muted-foreground">
                    Momentálne nie sú k dispozícii žiadne publikované produkty.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {products.map((product) => (
                    <Card
                      key={product.id}
                      className="group overflow-hidden border-border/40 hover:border-brand-dark/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
                      onClick={() => handleProductClick(product)}
                    >
                      {product.imageUrl && (
                        <div className="relative h-44 overflow-hidden bg-muted">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                      )}
                      {!product.imageUrl && (
                        <div className="h-44 bg-gradient-to-br from-brand-dark/5 to-brand-dark/10 flex items-center justify-center">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
                            {CATEGORY_ICONS[product.category] || (
                              <Package className="size-10" />
                            )}
                            <span className="text-xs">Bez obrázku</span>
                          </div>
                        </div>
                      )}
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base font-semibold line-clamp-2 group-hover:text-brand-dark transition-colors">
                            {product.name}
                          </CardTitle>
                          <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-brand-dark shrink-0 mt-0.5 transition-colors" />
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-[11px] font-medium bg-brand-dark/5 text-brand-dark border-0 w-fit"
                        >
                          {CATEGORY_LABELS[product.category] ||
                            product.category}
                        </Badge>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <CardDescription className="text-sm line-clamp-3">
                          {product.shortDesc || product.description}
                        </CardDescription>
                        {product.suitableFor && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {parseSuitableFor(product.suitableFor).slice(0, 3).map((tag: string) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-[10px] border-border/50 text-muted-foreground"
                              >
                                {tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ══════ Dokumenty Tab ══════ */}
            <TabsContent value="dokumenty" id="dokumenty">
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Technické dokumenty
                </h2>
                <p className="text-muted-foreground max-w-2xl">
                  Stiahnite si technické listy, BIM podklady, montážne návody a
                  certifikáty pre naše produkty.
                </p>
              </div>

              {loadingDocs ? (
                <div className="space-y-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i}>
                      <Skeleton className="h-6 w-40 mb-4" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Array.from({ length: 2 }).map((_, j) => (
                          <Skeleton key={j} className="h-16 w-full" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : Object.keys(docsByCategory).length === 0 ? (
                <Card className="p-12 text-center">
                  <FileText className="size-12 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Žiadne dokumenty
                  </h3>
                  <p className="text-muted-foreground">
                    Momentálne nie sú k dispozícii žiadne verejné dokumenty.
                  </p>
                </Card>
              ) : (
                <div className="space-y-8">
                  {Object.entries(docsByCategory).map(([category, docs]) => (
                    <div key={category}>
                      <div className="flex items-center gap-2 mb-4">
                        <FolderIcon category={category} />
                        <h3 className="text-lg font-semibold text-foreground">
                          {DOC_CATEGORY_LABELS[category] || category}
                        </h3>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-muted text-muted-foreground"
                        >
                          {docs.length} {docs.length === 1 ? 'dokument' : docs.length < 5 ? 'dokumenty' : 'dokumentov'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {docs.map((doc) => (
                          <a
                            key={doc.id}
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 p-4 rounded-lg border border-border/40 hover:border-brand-dark/30 hover:shadow-sm transition-all duration-200 bg-white"
                          >
                            <div className="flex items-center justify-center size-10 rounded-lg bg-brand-dark/5 text-brand-dark shrink-0">
                              <FileText className="size-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate group-hover:text-brand-dark transition-colors">
                                {doc.title}
                              </p>
                              {doc.description && (
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                  {doc.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[11px] text-muted-foreground/70 uppercase font-medium">
                                  {doc.fileType}
                                </span>
                                {doc.fileSize && (
                                  <>
                                    <span className="text-[11px] text-muted-foreground/30">
                                      ·
                                    </span>
                                    <span className="text-[11px] text-muted-foreground/70">
                                      {formatFileSize(doc.fileSize)}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <Download className="size-4 text-muted-foreground/40 group-hover:text-warm-dark shrink-0 transition-colors" />
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ══════ O systéme Tab ══════ */}
            <TabsContent value="o-systeme">
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  O systéme LINZMEIER
                </h2>
                <p className="text-muted-foreground max-w-2xl">
                  Nemecká kvalita, overená technológia a dlhoročné skúsenosti v
                  oblasti fasádnych systémov a tepelnej izolácie.
                </p>
              </div>

              {/* Key benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
                {[
                  {
                    icon: Factory,
                    title: 'Výhoda v Nemecku',
                    description:
                      'Výrobný závod v Nemecku zaručuje najvyššiu kvalitu a presnosť. Každý produkt prechádza prísnou kontrolou podľa nemeckých noriem.',
                    accent: 'bg-warm/10 text-warm-dark',
                  },
                  {
                    icon: Clock,
                    title: '40+ rokov skúseností',
                    description:
                      'Od roku 1980 prinášame inovácie v oblasti fasádnych systémov. Naše dlhoročné skúsenosti sú zárukou spoľahlivosti.',
                    accent: 'bg-brand/10 text-brand',
                  },
                  {
                    icon: Building2,
                    title: '5 000+ realizácií',
                    description:
                      'Viac ako 5 000 úspešných projektov po celej Európe. Od rodinných domov cez bytové domy až po priemyselné objekty.',
                    accent: 'bg-eco/10 text-eco',
                  },
                  {
                    icon: Shield,
                    title: 'Certifikované podľa STN',
                    description:
                      'Všetky produkty spĺňajú príslušné STN, DIN a EN normy. Certifikáty ISO 9001 a CE zaručujú bezpečnosť.',
                    accent: 'bg-warm/10 text-warm-dark',
                  },
                  {
                    icon: TrendingUp,
                    title: 'Energetická efektívnosť',
                    description:
                      'Naše systémy dosahujú vynikajúce tepelno-izolačné parametre. Prispievajú k zníženiu energetickej náročnosti budov.',
                    accent: 'bg-eco/10 text-eco',
                  },
                  {
                    icon: Globe,
                    title: 'Podpora BIM',
                    description:
                      'Poskytujeme BIM modely a technické podklady pre architektov a projektantov pre rýchlejšie plánovanie.',
                    accent: 'bg-brand/10 text-brand',
                  },
                ].map((item) => (
                  <Card
                    key={item.title}
                    className="border-border/40 hover:border-border/80 hover:shadow-md transition-all duration-300"
                  >
                    <CardHeader className="pb-3">
                      <div
                        className={`flex items-center justify-center size-10 rounded-lg ${item.accent} mb-2`}
                      >
                        <item.icon className="size-5" />
                      </div>
                      <CardTitle className="text-base font-semibold">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator className="mb-12" />

              {/* About the company */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    Tradícia a inovácia od roku 1980
                  </h3>
                  <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
                    <p>
                      Spoločnosť LINZMEIER bola založená v roku 1980 v Nemecku s
                      víziou priniesť na trh inovatívne riešenia v oblasti
                      fasádnych systémov a tepelnej izolácie. Počas viac ako 40
                      rokov existencie sa stala jedným z vedúcich výrobcov v
                      strednej Európe.
                    </p>
                    <p>
                      Náš výrobný závod v Nemecku využíva najmodernejšie
                      technológie a prísnu kontrolu kvality. Všetky produkty
                      spĺňajú najvyššie európske normy a sú certifikované podľa
                      STN EN, DIN a ISO štandardov.
                    </p>
                    <p>
                      Od roku 2020 pôsobíme aj na slovenskom trhu, kde ponúkame
                      kompletnú podporu pre architektov, projektantov a
                      stavebné firmy — vrátane BIM modelov, technických podkladov
                      a odborného poradenstva.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    Prečo sa stať partnerom?
                  </h3>
                  <div className="space-y-3">
                    {[
                      'Prednostný prístup k technickým dokumentom a BIM podkladom',
                      'Exkluzívne ceny a obchodné podmienky pre partnerov',
                      'Odborné školenia a semináre pre vašich zamestnancov',
                      'Marketingová podpora a vzorky zdarma',
                      'Prioritná technická podpora pri realizácii projektov',
                      'Prístup k partner administrácii pre sledovanie objednávok',
                    ].map((benefit) => (
                      <div
                        key={benefit}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <CheckCircle2 className="size-5 text-warm-dark shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Separator className="mb-12" />

              {/* CTA section */}
              <Card className="bg-brand-dark text-white border-0 overflow-hidden relative">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
                <CardContent className="relative p-8 sm:p-10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                      <h3 className="text-xl font-bold mb-2">
                        Máte záujem o spoluprácu?
                      </h3>
                      <p className="text-white/60 text-sm max-w-md">
                        Kontaktujte nás a dozviete sa viac o partnerstve s
                        LINZMEIER. Poskytneme vám všetky potrebné informácie a
                        podklady.
                      </p>
                    </div>
                    <Button
                      asChild
                      className="bg-warm text-brand-dark hover:bg-warm-dark shadow-lg shadow-warm/20 shrink-0"
                    >
                      <Link href="/" className="gap-2">
                        <Mail className="size-4" />
                        Kontaktovať
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────── */}
      <footer className="bg-brand-dark text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="mb-3">
                <Image
                  src="/logo.png"
                  alt="LINZMEIER Slovakia"
                  width={120}
                  height={36}
                  className="h-8 w-auto brightness-0 invert"
                />
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                Nemecká kvalita izolačných panelov a fasádnych systémov pre
                slovenský trh.
              </p>
            </div>

            {/* Partner Portal links */}
            <div>
              <h4 className="text-sm font-semibold text-white/80 mb-3">
                Partner Portal
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/partner"
                    className="text-sm text-white/50 hover:text-warm transition-colors"
                  >
                    Produkty
                  </Link>
                </li>
                <li>
                  <Link
                    href="/partner"
                    className="text-sm text-white/50 hover:text-warm transition-colors"
                  >
                    Technické dokumenty
                  </Link>
                </li>
                <li>
                  <Link
                    href="/partner"
                    className="text-sm text-white/50 hover:text-warm transition-colors"
                  >
                    O systéme
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-white/80 mb-3">
                Spoločnosť
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-sm text-white/50 hover:text-warm transition-colors"
                  >
                    Hlavná stránka
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-sm text-white/50 hover:text-warm transition-colors"
                  >
                    O spoločnosti
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-sm text-white/50 hover:text-warm transition-colors"
                  >
                    Referencie
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-white/80 mb-3">
                Kontakt
              </h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-white/50">
                  <Phone className="size-3.5 text-warm" />
                  +421 2 XXX XXX XX
                </li>
                <li className="flex items-center gap-2 text-sm text-white/50">
                  <Mail className="size-3.5 text-warm" />
                  info@linzmeier.sk
                </li>
                <li className="flex items-center gap-2 text-sm text-white/50">
                  <MapPin className="size-3.5 text-warm" />
                  Bratislava, Slovensko
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8 bg-white/10" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
            <p>© {new Date().getFullYear()} LINZMEIER.SK. Všetky práva vyhradené.</p>
            <div className="flex items-center gap-4">
              <Link href="/" className="hover:text-white/60 transition-colors">
                Ochrana osobných údajov
              </Link>
              <Link href="/" className="hover:text-white/60 transition-colors">
                Obchodné podmienky
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── Product Detail Dialog ──────────────────────────── */}
      <Dialog
        open={productDetailOpen}
        onOpenChange={setProductDetailOpen}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="secondary"
                className="text-[11px] font-medium bg-brand-dark/5 text-brand-dark border-0"
              >
                {CATEGORY_LABELS[selectedProduct?.category || ''] ||
                  selectedProduct?.category}
              </Badge>
            </div>
            <DialogTitle className="text-xl font-bold">
              {selectedProduct?.name}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Detail produktu {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedProduct?.imageUrl && (
            <div className="relative rounded-lg overflow-hidden -mx-6 -mt-2">
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.name}
                className="w-full h-56 object-cover"
              />
            </div>
          )}

          <div className="space-y-5 mt-2">
            {/* Description */}
            {selectedProduct?.description && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  Popis
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {selectedProduct.description}
                </p>
              </div>
            )}

            {/* Suitable for */}
            {selectedProduct?.suitableFor && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  Vhodné pre
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {parseSuitableFor(selectedProduct.suitableFor).map((tag: string) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs border-border/60"
                    >
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Specs */}
            {selectedProduct?.specs && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  Technické špecifikácie
                </h4>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {selectedProduct.specs}
                  </p>
                </div>
              </div>
            )}

            {/* Benefits */}
            {selectedProduct?.benefits && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  Výhody
                </h4>
                <div className="space-y-2">
                  {selectedProduct.benefits.split('\n').map(
                    (benefit) =>
                      benefit.trim() && (
                        <div
                          key={benefit}
                          className="flex items-start gap-2"
                        >
                          <CheckCircle2 className="size-4 text-warm-dark shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">
                            {benefit.trim()}
                          </span>
                        </div>
                      )
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setProductDetailOpen(false)}
            >
              Zavrieť
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Folder Icon Helper ─────────────────────────────────────────────
function FolderIcon({ category }: { category: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    TECHNICAL: <FileText className="size-4" />,
    BIM: <Layers className="size-4" />,
    MANUAL: <Package className="size-4" />,
    CERTIFICATE: <Award className="size-4" />,
    CATALOG: <ExternalLink className="size-4" />,
    OTHER: <FileText className="size-4" />,
  }
  return (
    <div className="flex items-center justify-center size-8 rounded-md bg-brand-dark/5 text-brand-dark">
      {iconMap[category] || <FileText className="size-4" />}
    </div>
  )
}
