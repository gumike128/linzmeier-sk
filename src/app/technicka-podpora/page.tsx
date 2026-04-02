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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Download,
  FileText,
  Mail,
  Phone,
  ArrowRight,
  HelpCircle,
  Wrench,
  Shield,
  Clock,
} from 'lucide-react'

// ─── Category labels (Slovak) ─────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  TECHNICAL: 'Technické listy',
  BIM: 'BIM / CAD podklady',
  MANUAL: 'Montážne návody',
  CERTIFICATE: 'Certifikáty',
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  TECHNICAL: FileText,
  BIM: Wrench,
  MANUAL: Wrench,
  CERTIFICATE: Shield,
}

const CATEGORY_ORDER: string[] = ['TECHNICAL', 'BIM', 'MANUAL', 'CERTIFICATE']

// ─── FAQ data ─────────────────────────────────────────────────────────
const faqs = [
  {
    question: 'Aká je životnosť fasádnych systémov LINZMEIER?',
    answer:
      'Naše fasádne systémy majú životnosť viac ako 50 rokov pri dodržaní montážnych predpisov a pravidelnej údržbe. Používame vysokokvalitné materiály vyrábané v Nemecku, ktoré sú odolné voči poveternostným vplyvom a UV žiareniu.',
  },
  {
    question: 'Čo znamená montáž bez mokrých procesov?',
    answer:
      'Montáž bez mokrých procesov znamená, že inštalácia prebieha suchou cestou – bez malty, omietky a čakania na vyschnutie. Výrazne to skracuje dobu realizácie, znižuje náklady na stavebné práce a minimalizuje riziko vlhkosti.',
  },
  {
    question: 'Splňujú vaše produkty slovenské a európske normy?',
    answer:
      'Áno, všetky naše produkty sú certifikované podľa platných slovenských a európskych noriem (STN, EN, CE). Máme k dispozícii všetky potrebné certifikáty a deklarácie vlastností, ktoré si môžete stiahnuť v sekcii dokumentov.',
  },
  {
    question: 'Aká je štandardná dodacia lehota produktov?',
    answer:
      'Štandardná dodacia lehota je 2–4 týždne podľa typu a množstva produktov. Pre väčšie projekty je možná individuálna dohoda o dodacích termínoch. V prípade núdzových objednávok nás kontaktujte priamo.',
  },
  {
    question: 'Ponúkate technickú podporu pri montáži?',
    answer:
      'Áno, poskytujeme kompletnú technickú podporu vrátane odborného poradenstva, montážnych návodov a možnosti dohľadu pri realizácii. Náš technický tím je k dispozícii telefonicky aj na mieste stavby.',
  },
  {
    question: 'Aké sú dostupné dekóry a farby fasádnych dosiek?',
    answer:
      'Ponúkame širokú škálu dekórov – od prírodných imitácií dreva a kamene až po moderné jednofarebné prevedenia. Katalóg farieb a dekórov je k dispozícii na stiahnutie v sekcii dokumentov alebo ho môžete získať na vyžiadanie.',
  },
  {
    question: 'Ako správne pripraviť podklad pred montážou?',
    answer:
      'Podklad musí byť čistý, suchý, nosný a s rovným povrchom. Odporúčame maximálnu nerovnosť podkladu do 5 mm na 2 m. Podrobné požiadavky na podklad sú uvedené v montážnych návodoch pre konkrétny systém, ktoré nájdete v sekcii dokumentov.',
  },
  {
    question: 'Sú vaše izolačné panely vhodné pre pasívne domy?',
    answer:
      'Áno, naše izolačné panely LINZMEIER Thermowand sú certifikované pre použitie v pasívnych domoch. Dosahujú vynikajúce tepelno-izolačné parametre (U-hodnoty pod 0,15 W/m²K) a spĺňajú najprísnejšie požiadavky na energetickej hospodárnosť.',
  },
] as const

// ─── Helper functions ─────────────────────────────────────────────────
function formatFileSize(bytes?: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Page ─────────────────────────────────────────────────────────────
export default async function TechnickaPodporaPage() {
  const documents = await db.document.findMany({
    where: { isPublic: true },
    orderBy: { sortOrder: 'asc' },
  })

  // Group documents by category
  const groupedByCategory = documents.reduce(
    (acc, doc) => {
      const cat = doc.category
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(doc)
      return acc
    },
    {} as Record<string, typeof documents>
  )

  // Sort categories by predefined order
  const sortedCategories = CATEGORY_ORDER.filter(
    (cat) => groupedByCategory[cat] && groupedByCategory[cat].length > 0
  )
  // Include any categories not in predefined order
  for (const cat of Object.keys(groupedByCategory)) {
    if (!sortedCategories.includes(cat)) {
      sortedCategories.push(cat)
    }
  }

  const totalDocuments = documents.length

  return (
    <>
      <Header />

      <main className="flex-1">
        {/* ── Hero Section ────────────────────────────────────────── */}
        <section className="relative bg-brand-dark overflow-hidden">
          {/* Grid pattern overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            {/* Breadcrumb */}
            <nav className="mb-8" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-sm text-white/60">
                <li>
                  <Link
                    href="/"
                    className="hover:text-warm transition-colors"
                  >
                    Domov
                  </Link>
                </li>
                <li aria-hidden="true">
                  <span className="text-white/30">/</span>
                </li>
                <li className="text-white font-medium">Technická podpora</li>
              </ol>
            </nav>

            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl mb-4">
                Technická podpora
              </h1>
              <p className="text-lg text-white/70 leading-relaxed max-w-2xl">
                Odborná pomoc, technická dokumentácia a odpovede na časté
                otázky. Všetko, čo potrebujete pre váš projekt s produktmi
                LINZMEIER.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-white/50">
                <span className="flex items-center gap-2">
                  <FileText className="size-4 text-warm" />
                  {totalDocuments} dostupných dokumentov
                </span>
                <span className="flex items-center gap-2">
                  <HelpCircle className="size-4 text-warm" />
                  {faqs.length} častých otázok
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="size-4 text-warm" />
                  Odpovieme do 24 hodín
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Documents Section ───────────────────────────────────── */}
        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="mb-12 md:mb-16">
              <h2 className="text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl mb-3">
                Dokumenty na stiahnutie
              </h2>
              <p className="text-neutral-500 max-w-2xl">
                Prehľadajte a stiahnite si technické dokumentácie, BIM/CAD
                podklady, montážne návody a certifikáty pre produkty LINZMEIER.
              </p>
              {/* Amber divider */}
              <div className="mt-4 h-1 w-20 rounded-full bg-warm" />
            </div>

            {/* Documents by category */}
            {sortedCategories.length === 0 ? (
              <Card className="border-dashed border-neutral-300 bg-muted/30">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <FileText className="size-12 text-neutral-300 mb-4" />
                  <h3 className="text-lg font-medium text-neutral-600 mb-1">
                    Žiadne dokumenty k dispozícii
                  </h3>
                  <p className="text-sm text-neutral-400">
                    Momentálne nie sú nahrané žiadne verejné dokumenty.
                    Skúste to neskôr alebo nás kontaktujte.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-12">
                {sortedCategories.map((category) => {
                  const docs = groupedByCategory[category]
                  const Icon = CATEGORY_ICONS[category] || FileText
                  const label =
                    CATEGORY_LABELS[category] || category

                  return (
                    <div key={category}>
                      {/* Category header */}
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warm/10 text-warm-dark">
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-brand-dark">
                            {label}
                          </h3>
                          <p className="text-xs text-neutral-400">
                            {docs.length}{' '}
                            {docs.length === 1
                              ? 'dokument'
                              : docs.length < 5
                                ? 'dokumenty'
                                : 'dokumentov'}
                          </p>
                        </div>
                      </div>

                      {/* Documents grid */}
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {docs.map((doc) => (
                          <Card
                            key={doc.id}
                            className="group border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-warm/30"
                          >
                            <CardContent className="p-5">
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 group-hover:bg-warm/10 group-hover:text-warm transition-colors">
                                    <FileText className="size-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-sm font-medium text-neutral-900 truncate">
                                      {doc.title}
                                    </h4>
                                    {doc.description && (
                                      <p className="text-xs text-neutral-400 mt-0.5 line-clamp-2">
                                        {doc.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Meta row */}
                              <div className="flex items-center gap-2 mb-4">
                                <Badge
                                  variant="secondary"
                                  className="bg-neutral-100 text-neutral-600 text-[10px] font-semibold px-2 py-0.5"
                                >
                                  {doc.fileType.toUpperCase()}
                                </Badge>
                                {doc.fileSize && (
                                  <span className="text-xs text-neutral-400">
                                    {formatFileSize(doc.fileSize)}
                                  </span>
                                )}
                              </div>

                              {/* Download link */}
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-medium text-brand-dark hover:text-warm-dark transition-colors duration-200"
                              >
                                <Download className="size-4" />
                                Stiahnuť
                                <ArrowRight className="size-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                              </a>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── FAQ Section ─────────────────────────────────────────── */}
        <section className="bg-muted/30 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="mb-12 md:mb-16">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warm/10 text-warm-dark">
                  <HelpCircle className="size-5" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
                  Často kladené otázky
                </h2>
              </div>
              <p className="text-neutral-500 max-w-2xl">
                Odpovede na najčastejšie otázky o produktoch LINZMEIER,
                inštalácii, certifikáciách a technickej podpore.
              </p>
              <div className="mt-4 h-1 w-20 rounded-full bg-warm" />
            </div>

            {/* Accordion */}
            <div className="mx-auto max-w-3xl">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`faq-${index}`}
                    className="border-neutral-200 bg-white rounded-lg px-4 mb-3 shadow-sm last:mb-0"
                  >
                    <AccordionTrigger className="group/trigger text-left text-base font-medium text-neutral-900 hover:no-underline data-[state=open]:text-warm-dark transition-colors duration-200 py-5">
                      <span className="flex items-start gap-4">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warm/10 text-sm font-bold text-warm-dark group-data-[state=open]/trigger:bg-warm group-data-[state=open]/trigger:text-white transition-colors duration-200">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="pt-0.5">{faq.question}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pl-12 text-sm leading-relaxed text-neutral-600 pb-5">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* ── Contact Section ─────────────────────────────────────── */}
        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-brand-dark overflow-hidden">
              <div className="grid md:grid-cols-2">
                {/* Left: Content */}
                <div className="p-8 md:p-12 lg:p-16">
                  <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl mb-4">
                    Potrebujete odbornú pomoc?
                  </h2>
                  <p className="text-white/60 leading-relaxed mb-8">
                    Náš technický tím je vám k dispozícii. Okrem dostupných
                    dokumentov vám radi poskytneme odborné poradenstvo,
                    pripravíme cenovú ponuku alebo zariadíme dohľad nad
                    montážou.
                  </p>

                  <div className="space-y-4">
                    <a
                      href="tel:+4212XXXXXXX"
                      className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 text-white hover:border-warm/30 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-warm/20 text-warm-dark">
                        <Phone className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-wider font-medium">
                          Telefón
                        </p>
                        <p className="text-white font-medium">
                          +421 2 XXX XXX XX
                        </p>
                      </div>
                    </a>

                    <a
                      href="mailto:info@linzmeier.sk"
                      className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 text-white hover:border-warm/30 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-warm/20 text-warm-dark">
                        <Mail className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-wider font-medium">
                          E-mail
                        </p>
                        <p className="text-white font-medium">
                          info@linzmeier.sk
                        </p>
                      </div>
                    </a>
                  </div>

                  <div className="mt-8">
                    <Button
                      asChild
                      size="lg"
                      className="bg-warm text-brand-dark hover:bg-warm-dark font-medium"
                    >
                      <Link href="/#kontakt">
                        <span className="flex items-center gap-2">
                          Nezáväzná konzultácia
                          <ArrowRight className="size-4" />
                        </span>
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Right: Quick info */}
                <div className="bg-white/5 border-l border-white/10 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                  <div className="space-y-8">
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warm/15 text-warm-dark">
                        <Shield className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-1">
                          Certifikované produkty
                        </h3>
                        <p className="text-xs text-white/50 leading-relaxed">
                          Všetky produkty spĺňajú slovenské a európske normy
                          (STN, EN, CE) s dokumentáciou na stiahnutie.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warm/15 text-warm-dark">
                        <Wrench className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-1">
                          Technická podpora
                        </h3>
                        <p className="text-xs text-white/50 leading-relaxed">
                          Odborné poradenstvo, montážne návody a možnosť
                          dohľadu nad realizáciou projektu.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warm/15 text-warm-dark">
                        <Clock className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-1">
                          Rýchla odpoveď
                        </h3>
                        <p className="text-xs text-white/50 leading-relaxed">
                          Odpovieme na vašu otázku do 24 hodín. Pre urgentné
                          prípady nás kontaktujte telefonicky.
                        </p>
                      </div>
                    </div>
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
