import Link from 'next/link'
import type { Metadata } from 'next'
import { Header } from '@/components/linzmeier/Header'
import { Footer } from '@/components/linzmeier/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  FileDown,
  FileText,
  Shield,
  Wrench,
  ArrowRight,
  ExternalLink,
  Download,
} from 'lucide-react'

// ─── Metadata ──────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Technické dokumenty na stiahnutie | LINZMEIER.SK',
  description:
    'Stiahnite si technické listy, montážne návody, certifikáty a katalógy pre systémy LINITHERM. Kompletná technická dokumentácia pre projektantov, architektov a inštalatérov.',
  openGraph: {
    title: 'Technické dokumenty na stiahnutie | LINZMEIER.SK',
    description:
      'Technické listy, montážne návody, certifikáty a katalógy pre systémy LINITHERM.',
  },
}

// ─── Types ─────────────────────────────────────────────────────────
interface Document {
  title: string
  description: string
  fileType: string
  href: string
}

// ─── Static document data ──────────────────────────────────────────
const TECHNICAL_SHEETS: Document[] = [
  {
    title: 'LINITHERM PAL N+F',
    description:
      'Izolačný panel s nosnou vrstvou – technický list s detailnými parametrami, hrúbkami a schváleniami.',
    fileType: 'PDF',
    href: '#',
  },
  {
    title: 'LINITHERM PAL SIL T',
    description:
      'Panel s integrovanou protihlukovou vrstvou – technické údaje o akustických a tepelných vlastnostiach.',
    fileType: 'PDF',
    href: '#',
  },
  {
    title: 'LINITHERM PGV T',
    description:
      'Priečelová doska s tepelnou izoláciou – technický list s deklaráciou vlastností.',
    fileType: 'PDF',
    href: '#',
  },
  {
    title: 'LINITHERM PAL 2U',
    description:
      'Dvojplášťový izolačný panel – technické parametre pre priemyselné a komerčné objekty.',
    fileType: 'PDF',
    href: '#',
  },
  {
    title: 'LINITHERM PAL FD / UNIVERSAL',
    description:
      'Univerzálny fasádny panel – technický list s prehľadom aplikácií a montážnych variantov.',
    fileType: 'PDF',
    href: '#',
  },
  {
    title: 'LINITHERM PAL Gefälle',
    description:
      'Šikmý panel pre strešné konštrukcie – technický list so sklonovými variantmi.',
    fileType: 'PDF',
    href: '#',
  },
  {
    title: 'LINITHERM PAL GK',
    description:
      'Izolačný panel s povrchovou úpravou – technické informácie o materiáloch a hrúbkach.',
    fileType: 'PDF',
    href: '#',
  },
  {
    title: 'LINITHERM PAL W',
    description:
      'Priemyselný panel pre steny – technický list s nosnosťou a tepelnými vlastnosťami.',
    fileType: 'PDF',
    href: '#',
  },
  {
    title: 'LINITHERM PHW',
    description:
      'Stropný panel – technický list so statickými údajmi a schváleniami.',
    fileType: 'PDF',
    href: '#',
  },
  {
    title: 'LINITHERM PMV',
    description:
      'Podlahový izolačný panel – technické parametre pre podlahové systémy.',
    fileType: 'PDF',
    href: '#',
  },
]

const MANUALS: Document[] = [
  {
    title: 'Všeobecný montážny návod LINITHERM',
    description:
      'Komplexný montážny návod obsahujúci všeobecné princípy, bezpečnostné pokyny a postupy inštalácie.',
    fileType: 'PDF',
    href: '#',
  },
  {
    title: 'Montážny návod pre šikmé strechy',
    description:
      'Podrobný postup montáže LINITHERM systémov na šikmých strešných konštrukciách.',
    fileType: 'PDF',
    href: '#',
  },
  {
    title: 'Montážny návod pre ploché strechy',
    description:
      'Špecifický montážny postup pre ploché strechy vrátane odvodnenia a pripevnenia panelov.',
    fileType: 'PDF',
    href: '#',
  },
]

const CERTIFICATES: Document[] = [
  {
    title: 'Certifikát pure life – environmentálna pečať',
    description:
      'Potvrdenie environmentálnej hodnoty produktov LINITHERM – nízka emisia VOC, recyklovateľnosť a udržateľnosť.',
    fileType: 'PDF',
    href: '#',
  },
  {
    title: 'Certifikát CE – zhoda s európskymi smernicami',
    description:
      'Deklarácia zhody s európskymi smernicami (CPR) a platnými normami pre stavebné produkty.',
    fileType: 'PDF',
    href: '#',
  },
]

const CATALOGUES: Document[] = [
  {
    title: 'Produktový katalóg LINITHERM 2026',
    description:
      'Kompletný prehľad produktového portfólia LINITHERM s technickými parametrami, dekórmi a referenciami.',
    fileType: 'PDF',
    href: '#',
  },
]

// ─── Document card component ───────────────────────────────────────
function DocumentCard({ doc, icon: Icon }: { doc: Document; icon: React.ElementType }) {
  return (
    <Card className="group border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-warm/30">
      <CardContent className="p-5 flex flex-col h-full">
        {/* Icon + title */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 group-hover:bg-warm/10 group-hover:text-warm-dark transition-colors">
            <Icon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-neutral-900 leading-snug">
              {doc.title}
            </h4>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2 mb-4 flex-1">
          {doc.description}
        </p>

        {/* Bottom row: badge + download */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-neutral-100">
          <Badge
            variant="secondary"
            className="bg-neutral-100 text-neutral-600 text-[10px] font-semibold px-2 py-0.5"
          >
            {doc.fileType}
          </Badge>
          <a
            href={doc.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-dark hover:text-warm-dark transition-colors duration-200"
          >
            <Download className="size-3.5" />
            Stiahnuť
          </a>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Page ──────────────────────────────────────────────────────────
export default function StiahnutiePage() {
  const totalDocs =
    TECHNICAL_SHEETS.length +
    MANUALS.length +
    CERTIFICATES.length +
    CATALOGUES.length

  return (
    <>
      <Header />

      <main className="flex flex-col min-h-screen">
        {/* ── Breadcrumb ─────────────────────────────────────── */}
        <section className="bg-muted/40 border-b border-border/50">
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
                  <BreadcrumbPage>Na stiahnutie</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </section>

        {/* ── Hero Section ───────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-dark/90 via-brand/80 to-brand/70 text-white">
          {/* Decorative grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
          {/* Decorative orb */}
          <div className="absolute -top-32 -right-32 size-96 rounded-full bg-warm/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 size-72 rounded-full bg-eco/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <div className="max-w-3xl">
              <Badge className="bg-warm/20 text-warm-dark border-warm/30 mb-6 hover:bg-warm/30">
                Dokumenty
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Technické dokumenty na stiahnutie
              </h1>
              <p className="text-lg sm:text-xl text-white/80 leading-relaxed max-w-2xl mb-8">
                Technické listy, montážne návody, certifikáty a katalógy pre
                systémy LINITHERM
              </p>
              <div className="flex flex-wrap items-center gap-6 text-sm text-white/50">
                <span className="flex items-center gap-2">
                  <FileDown className="size-4 text-warm" />
                  {totalDocs} dokumentov k dispozícii
                </span>
                <span className="flex items-center gap-2">
                  <FileText className="size-4 text-warm" />
                  Formát PDF
                </span>
                <span className="flex items-center gap-2">
                  <Shield className="size-4 text-warm" />
                  Certifikované podklady
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Documents Section ──────────────────────────────── */}
        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="mb-10 md:mb-14">
              <h2 className="text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl mb-3">
                Prehľad dokumentov
              </h2>
              <p className="text-neutral-500 max-w-2xl">
                Vyberte si kategóriu a stiahnite si potrebné technické podklady.
                Všetky dokumenty sú vo formáte PDF a pripravené na tlač.
              </p>
              <div className="mt-4 h-1 w-20 rounded-full bg-warm" />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="technical-sheets" className="w-full">
              <TabsList className="mb-8 flex-wrap gap-1">
                <TabsTrigger value="technical-sheets" className="gap-1.5">
                  <FileText className="size-4" />
                  Technické listy
                </TabsTrigger>
                <TabsTrigger value="manuals" className="gap-1.5">
                  <Wrench className="size-4" />
                  Montážne návody
                </TabsTrigger>
                <TabsTrigger value="certificates" className="gap-1.5">
                  <Shield className="size-4" />
                  Certifikáty
                </TabsTrigger>
                <TabsTrigger value="catalogues" className="gap-1.5">
                  <FileDown className="size-4" />
                  Katalógy
                </TabsTrigger>
              </TabsList>

              {/* Technical Sheets Tab */}
              <TabsContent value="technical-sheets">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warm/10 text-warm-dark">
                      <FileText className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-dark">
                        Technické listy
                      </h3>
                      <p className="text-xs text-neutral-400">
                        {TECHNICAL_SHEETS.length} produktov
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {TECHNICAL_SHEETS.map((doc) => (
                      <DocumentCard
                        key={doc.title}
                        doc={doc}
                        icon={FileText}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Manuals Tab */}
              <TabsContent value="manuals">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warm/10 text-warm-dark">
                      <Wrench className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-dark">
                        Montážne návody
                      </h3>
                      <p className="text-xs text-neutral-400">
                        {MANUALS.length} dokumentov
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {MANUALS.map((doc) => (
                      <DocumentCard
                        key={doc.title}
                        doc={doc}
                        icon={Wrench}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Certificates Tab */}
              <TabsContent value="certificates">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warm/10 text-warm-dark">
                      <Shield className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-dark">
                        Certifikáty
                      </h3>
                      <p className="text-xs text-neutral-400">
                        {CERTIFICATES.length} certifikátov
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {CERTIFICATES.map((doc) => (
                      <DocumentCard
                        key={doc.title}
                        doc={doc}
                        icon={Shield}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Catalogues Tab */}
              <TabsContent value="catalogues">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warm/10 text-warm-dark">
                      <FileDown className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-dark">
                        Katalógy
                      </h3>
                      <p className="text-xs text-neutral-400">
                        {CATALOGUES.length} katalógov
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {CATALOGUES.map((doc) => (
                      <DocumentCard
                        key={doc.title}
                        doc={doc}
                        icon={FileDown}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* ── CTA Section ────────────────────────────────────── */}
        <section className="bg-brand-dark text-white py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Potrebujete konzultáciu?
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              Náš technický tím vám rád pomôže s výberom správnych produktov,
              pripraví cenovú ponuku alebo poskytne odborné poradenstvo k
              vášmu projektu.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="bg-warm text-brand-dark hover:bg-warm-dark shadow-lg hover:shadow-xl transition-all gap-2"
              >
                <Link href="/#kontakt">
                  <span className="flex items-center gap-2">
                    Kontaktujte nás
                    <ArrowRight className="size-4" />
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
