import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Header } from '@/components/linzmeier/Header'
import { Footer } from '@/components/linzmeier/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Home,
  Building2,
  Factory,
  Shield,
  Zap,
  Clock,
  Thermometer,
  Leaf,
  ArrowRight,
  CheckCircle2,
  Layers,
  Volume2,
  Hammer,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────
interface Benefit {
  icon: React.ElementType
  title: string
  description: string
}

interface TechSpec {
  label: string
  value: string
}

interface SolutionData {
  slug: string
  title: string
  subtitle: string
  heroIcon: React.ElementType
  heroGradient: string
  metaTitle: string
  metaDescription: string
  intro: string
  benefits: Benefit[]
  techSpecs: TechSpec[]
  checklist: string[]
}

// ─── Solutions data ────────────────────────────────────────────────
const SOLUTIONS: Record<string, SolutionData> = {
  'rodinne-domy': {
    slug: 'rodinne-domy',
    title: 'Rodinné domy',
    subtitle: 'Polyuretánové izolačné systémy LINITHERM pre novostavby aj rekonštrukcie rodinných domov',
    heroIcon: Home,
    heroGradient: 'from-brand-dark/90 via-brand/80 to-eco/70',
    metaTitle: 'Izolácia rodinných domov | LINITHERM LINZMEIER.SK',
    metaDescription:
      'Polyuretánové izolačné systémy LINITHERM pre rodinné domy – úspora energie až 40 %, rýchla montáž, nemecká kvalita. Vhodné pre novostavby aj rekonštrukcie.',
    intro:
      'Polyuretánové izolačné systémy LINITHERM sú ideálnym riešením pre zateplenie rodinných domov. Náš systém kombinuje vysokú tepelnú izoláciu s jednoduchou a rýchlou montážou, čo vám umožní znížiť energetické náklady až o 40 % a zároveň zvýšiť komfort bývania. Panely LINITHERM sú vhodné pre novostavby aj rekonštrukcie a spĺňajú najprísnejšie európske normy.',
    benefits: [
      {
        icon: Thermometer,
        title: 'Úspora energie až 40 %',
        description:
          'Vysoká tepelná odolnosť polyuretánových panelov LINITHERM výrazne znižuje náklady na kúrenie a chladenie po celý rok.',
      },
      {
        icon: Clock,
        title: 'Rýchla montáž',
        description:
          'Hotový izolačný systém LINITHERM s integrovanými spojmi umožňuje montáž fasády až 3× rýchlejšie ako pri tradičných systémoch.',
      },
      {
        icon: Shield,
        title: 'Životnosť 50+ rokov',
        description:
          'Polyuretánové panely LINITHERM sú odolné voči poveternostným vplyvom, vlhkosti a biologickému poškodeniu bez potreby údržby.',
      },
      {
        icon: Leaf,
        title: 'Ekologické materiály',
        description:
          'Výrobky LINITHERM neobsahujú žiadne škodlivé látky, sú plne recyklovateľné a spĺňajú certifikácie pre zelenú výstavbu.',
      },
    ],
    techSpecs: [
      { label: 'Tepelná vodivosť (λ)', value: '0,022 – 0,035 W/(m·K)' },
      { label: 'Hrúbka panela', value: '80 – 200 mm' },
      { label: 'Povrchová úprava', value: 'Silikátová alebo akrylová omietka' },
      { label: 'Požiarna odolnosť', value: 'B-s1, d0' },
      { label: 'Trieda hygroscopicity', value: 'WS 80 D' },
      { label: 'Záruka', value: '10 rokov na systém' },
    ],
    checklist: [
      'Certifikované podľa STN EN 13163 a STN EN 13501-1',
      'Vhodné pre zdene aj drevené konštrukcie',
      'Možnosť integrácie farebných a dekoračných prvkov',
      'Systémové riešenie LINITHERM vrátane spojov a príslušenstva',
      'K dispozícii BIM modely pre projektantov',
      'Možnosť dodávky s montážou aj bez montáže',
    ],
  },
  'bytove-domy': {
    slug: 'bytove-domy',
    title: 'Bytové domy',
    subtitle: 'Polyuretánové izolačné systémy LINITHERM pre bytové domy – tepelná izolácia, ochrana hluku a požiarna bezpečnosť',
    heroIcon: Building2,
    heroGradient: 'from-brand/90 via-brand-dark/80 to-brand/70',
    metaTitle: 'Fasádne systémy pre bytové domy | LINITHERM LINZMEIER.SK',
    metaDescription:
      'Polyuretánové izolačné systémy LINITHERM pre bytové domy – zateplenie, protihluková ochrana, požiarna odolnosť. Certifikované riešenia pre developerské projekty.',
    intro:
      'Komplexný fasádny systém LINITHERM pre bytové domy rieši tri kľúčové problémy moderného bývania: tepelnú izoláciu, ochranu proti hluku a požiarnu bezpečnosť. Naše polyuretánové panely sú certifikované pre viacpodlažné budovy a sú navrhnuté tak, aby spĺňali najprísnejšie požiadavky na bezpečnosť a trvanlivosť. Systém je ideálny pre developerské projekty aj rekonštrukciu existujúcich bytových domov.',
    benefits: [
      {
        icon: Layers,
        title: 'Komplexný fasádny systém',
        description:
          'Kompletné riešenie od tepelnej izolácie cez povrchové úpravy až po spájacie prvky – všetko z jedného zdroja.',
      },
      {
        icon: Shield,
        title: 'Protihluková ochrana',
        description:
          'Polyuretánové panely LINITHERM výrazne znižujú prenikanie vonkajšieho hluku do bytových priestorov až o 10 dB.',
      },
      {
        icon: Zap,
        title: 'Požiarna bezpečnosť',
        description:
          'Panely spĺňajú triedu reakcie na oheň A2-s1, d0 a sú certifikované pre výškové budovy.',
      },
      {
        icon: CheckCircle2,
        title: 'Certifikované pre developerské projekty',
        description:
          'Systém LINITHERM má všetky potrebné certifikácie pre schválenie stavebným úradom na Slovensku.',
      },
    ],
    techSpecs: [
      { label: 'Tepelná vodivosť (λ)', value: '0,022 – 0,040 W/(m·K)' },
      { label: 'Hrúbka panela', value: '100 – 240 mm' },
      { label: 'Akustická izolácia', value: 'Rw ≥ 38 dB' },
      { label: 'Trieda reakcie na oheň', value: 'A2-s1, d0' },
      { label: 'Odolnosť voči nárazu', value: 'IK 10' },
      { label: 'Max. výška budovy', value: 'Až 25 m' },
    ],
    checklist: [
      'Certifikované podľa STN EN 13501-1 a STN 73 0540',
      'Vhodné pre novostavby aj kompletné rekonštrukcie',
      'Systémové riešenie vrátane parozábrany a dilatacie',
      'Možnosť volieb farieb a textúr povrchov',
      'Certifikované pre ETICS kontaktný zatepľovací systém',
      'Referencie na desiatkach bytových domov na Slovensku',
    ],
  },
  priemysel: {
    slug: 'priemysel',
    title: 'Priemysel',
    subtitle: 'Veľkoplošné polyuretánové izolačné systémy LINITHERM pre priemyselné stavby a haly',
    heroIcon: Factory,
    heroGradient: 'from-brand-dark/90 via-brand-dark/70 to-eco/60',
    metaTitle: 'Priemyselná izolácia | LINITHERM LINZMEIER.SK',
    metaDescription:
      'Priemyselné polyuretánové izolačné systémy LINITHERM – veľkoplošné panely, riešenie tepelných mostov, certifikované systémy pre haly a výrobné objekty.',
    intro:
      'Priemyselné polyuretánové izolačné systémy LINITHERM sú navrhnuté pre náročné podmienky veľkoplošných stavieb – výrobných hál, skladov, logistických centier a poľnohospodárskych objektov. Naše panely ponúkajú maximálnu tepelnú izoláciu pri minimálnej hrúbke, čím výrazne znižujú prevádzkové náklady. Systém LINITHERM je certifikovaný pre priemyselné využitie a rieši aj problém tepelných mostov na spojoch panelov.',
    benefits: [
      {
        icon: Layers,
        title: 'Veľkoplošné panely',
        description:
          'Panely v štandardných šírkach až 1 200 mm a dĺžkach až 12 m umožňujú rýchlu montáž veľkých plôch.',
      },
      {
        icon: Zap,
        title: 'Riešenie tepelných mostov',
        description:
          'Integrovaný systém spojov s tepelnou izoláciou eliminuje tepelné mosty na styčných bodoch panelov.',
      },
      {
        icon: CheckCircle2,
        title: 'Certifikované systémy',
        description:
          'Všetky systémy sú certifikované pre priemyselné využitie a spĺňajú normy pre nepožiarnych aj požiarnych priestorov.',
      },
      {
        icon: Clock,
        title: 'Rýchla inštalácia',
        description:
          'Mechanické spájanie panelov umožňuje montáž až 500 m² fasády za jeden deň s minimálnym počtom pracovníkov.',
      },
    ],
    techSpecs: [
      { label: 'Tepelná vodivosť (λ)', value: '0,020 – 0,032 W/(m·K)' },
      { label: 'Hrúbka panela', value: '80 – 250 mm' },
      { label: 'Šírka panela', value: '600 – 1 200 mm' },
      { label: 'Dĺžka panela', value: 'Až 12 000 mm' },
      { label: 'Nosnosť', value: 'Až 3,5 kN/m²' },
      { label: 'Trieda reakcie na oheň', value: 'B-s2, d0 alebo A2-s1, d0' },
    ],
    checklist: [
      'Certifikované podľa STN EN 14509 pre sendvičové panely',
      'Vhodné pre chladiarenské a mraziarenské haly',
      'Možnosť dodávky s perforovanou vnútornou výstelkou',
      'Systémová dilatácia a odvodnenie kondenzátu',
      'Certifikované pre potravinárske prostredie',
      'Technická podpora a konzultácie pre investorov',
    ],
  },
  'rekonstrukcie': {
    slug: 'rekonstrukcie',
    title: 'Rekonštrukcie budov',
    subtitle: 'Polyuretánové izolačné systémy LINITHERM pre rýchlu a čistú izoláciu pri rekonštrukciách',
    heroIcon: Hammer,
    heroGradient: 'from-warm-dark/90 via-warm/80 to-brand/70',
    metaTitle: 'Izolácia pri rekonštrukciách budov | LINITHERM LINZMEIER.SK',
    metaDescription:
      'Polyuretánové izolačné systémy LINITHERM pre rekonštrukcie – bez mokrých procesov, rýchla montáž, zníženie energetickej náročnosti a protihluková ochrana.',
    intro:
      'Polyuretánové izolačné systémy LINITHERM sú ideálnym riešením pre zateplenie pri rekonštrukciách budov. Vďaka suchému procesu montáže bez potreby mokrých prác sa minimalizuje porušenie existujúcej štruktúry budovy a znížuje sa čas realizácie. Systém LINITHERM PAL SIL T s integrovanou protihlukovou vrstvou ponúka okrem tepelnej izolácie aj účinnú ochranu proti hluku, čo je obzvlášť dôležité pri rekonštrukciách bytových domov a panelových konštrukcií.',
    benefits: [
      {
        icon: Zap,
        title: 'Bez mokrých procesov',
        description:
          'Suchá montáž polyuretánových panelov LINITHERM nevyžaduje omietky ani iné mokré procesy, čo urýchľuje realizáciu a minimalizuje neporiadok.',
      },
      {
        icon: Clock,
        title: 'Rýchla montáž',
        description:
          'Prefabrikované panely LINITHERM umožňujú rýchlu inštaláciu, ktorá minimalizuje čas prerušenia prevádzky alebo bývania počas rekonštrukcie.',
      },
      {
        icon: Thermometer,
        title: 'Zníženie energetickej náročnosti',
        description:
          'Aplikáciou LINITHERM panelov pri rekonštrukcii dosiahnete zníženie energetickej náročnosti budovy o 30–50 % a výrazne znížite náklady na kúrenie.',
      },
      {
        icon: Volume2,
        title: 'Protihluková ochrana',
        description:
          'Systém LINITHERM PAL SIL T s integrovanou akustickou vrstvou účinne redukuje prenikanie hluku, ideálne pre rekonštrukcie pri rušných komunikáciách.',
      },
    ],
    techSpecs: [
      { label: 'Tepelná vodivosť (λ)', value: '0,022 – 0,035 W/(m·K)' },
      { label: 'Hrúbka panela', value: '80 – 200 mm' },
      { label: 'Akustická izolácia', value: 'Rw ≥ 38 dB (PAL SIL T)' },
      { label: 'Požiarna odolnosť', value: 'B-s1, d0' },
      { label: 'Montážny systém', value: 'Suchá montáž bez mokrých procesov' },
      { label: 'Záruka', value: '10 rokov na systém' },
    ],
    checklist: [
      'Certifikované podľa STN EN 13163 a STN EN 13501-1',
      'Vhodné pre existujúce obytné budovy',
      'LINITHERM PAL SIL T s integrovanou protihlukovou vrstvou',
      'Možnosť montáže počas celého roka',
      'Minimálny vplyv na obyvateľov budovy počas prác',
      'K dispozícii BIM modely pre projektantov',
    ],
  },
  'ochrana-proti-hluku': {
    slug: 'ochrana-proti-hluku',
    title: 'Ochrana proti hluku',
    subtitle: 'Účinná protihluková izolácia s polyuretánovými systémami LINITHERM',
    heroIcon: Volume2,
    heroGradient: 'from-brand/90 via-brand-dark/80 to-warm/70',
    metaTitle: 'Protihluková izolácia | LINITHERM PAL SIL T LINZMEIER.SK',
    metaDescription:
      'Protihluková izolácia LINITHERM PAL SIL T – až 50 dB zníženie hluku, integrovaná akustická vrstva, vylepšený tepelný komfort a rýchla inštalácia.',
    intro:
      'Polyuretánové izolačné systémy LINITHERM PAL SIL T s integrovanou protihlukovou vrstvou ponúkajú účinné riešenie proti hluku pre budovy situované v hlučnom prostredí. PU pena s vysokou hustotou účinne absorbuje zvukové vlny a výrazne znižuje prenikanie hluku z vonkajšieho prostredia. Systém je ideálny pre bytové domy pri rušných cestách, rekonštrukcie panelákových domov a objekty v priemyselných zónach. Dosahuje až 50 dB zníženie hluku pri zachovaní vynikajúcich tepelno-izolačných vlastností.',
    benefits: [
      {
        icon: Volume2,
        title: 'Až 50 dB zníženie hluku',
        description:
          'Integrovaná akustická vrstva LINITHERM PAL SIL T dosahuje až 50 dB zníženie prenikania hluku, čo výrazne zvyšuje komfort bývania.',
      },
      {
        icon: Layers,
        title: 'Integrovaná protihluková vrstva',
        description:
          'Multifunkčný panel kombinuje tepelnú izoláciu a protihlukovú ochranu v jednom systéme, bez potreby dodatočných vrstiev.',
      },
      {
        icon: Thermometer,
        title: 'Vylepšený tepelný komfort',
        description:
          'Okrem protihlukovej funkcie ponúka LINITHERM PAL SIL T aj vynikajúce tepelno-izolačné parametre s λ od 0,022 W/(m·K).',
      },
      {
        icon: Clock,
        title: 'Rýchla inštalácia',
        description:
          'Kompletný systém s integrovanou akustickou vrstvou sa inštaluje v jednom kroku, čo urýchľuje realizáciu projektu.',
      },
    ],
    techSpecs: [
      { label: 'Zníženie hluku', value: 'Až 50 dB (Rw)' },
      { label: 'Tepelná vodivosť (λ)', value: '0,022 – 0,035 W/(m·K)' },
      { label: 'Hrúbka panela', value: '100 – 200 mm' },
      { label: 'Akustická vrstva', value: 'Integrovaná PU pena' },
      { label: 'Trieda reakcie na oheň', value: 'B-s1, d0' },
      { label: 'Vhodnosť', value: 'Bytové domy, priemyselné zóny' },
    ],
    checklist: [
      'Ideálne pre bytové domy pri rušných cestách',
      'Certifikované akustické parametre (Rw ≥ 38–50 dB)',
      'Vhodné pre rekonštrukcie panelákových domov',
      'Aplikácia v hlučných priemyselných zónach',
      'Kombinácia tepelnej a akustickej izolácie',
      'Systémové riešenie LINITHERM vrátane príslušenstva',
    ],
  },
}

// ─── Metadata generation ───────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const solution = SOLUTIONS[slug]
  if (!solution) {
    return { title: 'Riešenie nenájdené | LINZMEIER.SK' }
  }
  return {
    title: `${solution.metaTitle} | LINZMEIER.SK`,
    description: solution.metaDescription,
    openGraph: {
      title: solution.title,
      description: solution.metaDescription,
    },
  }
}

// ─── Page ──────────────────────────────────────────────────────────
export default async function SolutionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const solution = SOLUTIONS[slug]

  if (!solution) {
    notFound()
  }

  const HeroIcon = solution.heroIcon

  return (
    <>
      <Header />
      <main className="flex flex-col min-h-screen">
        {/* ── Breadcrumb ─────────────────────────────────── */}
        <section className="bg-muted/40 border-b border-border/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">
                      <Home className="size-3.5 mr-1 inline" />
                      Domov
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/#solutions">Riešenia</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{solution.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </section>

        {/* ── Hero ───────────────────────────────────────── */}
        <section
          className={`relative overflow-hidden bg-gradient-to-br ${solution.heroGradient} text-white`}
        >
          {/* Decorative grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
          {/* Decorative orb */}
          <div className="absolute -top-32 -right-32 size-96 rounded-full bg-warm/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <div className="max-w-3xl">
              <Badge className="bg-warm/20 text-warm-dark border-warm/30 mb-6 hover:bg-warm/30">
                Riešenie
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                {solution.title}
              </h1>
              <p className="text-lg sm:text-xl text-white/80 leading-relaxed max-w-2xl mb-8">
                {solution.subtitle}
              </p>
              <Button
                size="lg"
                asChild
                className="bg-warm text-brand-dark hover:bg-warm-dark shadow-lg hover:shadow-xl transition-all gap-2"
              >
                <Link href="/#kontakt">
                  Požiadať o cenovú ponuku
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Intro ──────────────────────────────────────── */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="size-12 rounded-xl bg-brand/10 flex items-center justify-center">
                  <HeroIcon className="size-6 text-brand-dark" />
                </div>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {solution.intro}
              </p>
            </div>
          </div>
        </section>

        {/* ── Benefits Grid ──────────────────────────────── */}
        <section className="pb-16 lg:pb-20 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-dark mb-4">
                Výhody pre vás
              </h2>
              <div className="w-16 h-1 bg-warm mx-auto rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {solution.benefits.map((benefit) => {
                const Icon = benefit.icon
                return (
                  <Card
                    key={benefit.title}
                    className="border-border/40 bg-background hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <CardContent className="p-6">
                      <div className="size-12 rounded-xl bg-brand/10 flex items-center justify-center mb-4 group-hover:bg-warm/15 transition-colors">
                        <Icon className="size-6 text-brand-dark group-hover:text-warm-dark transition-colors" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {benefit.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Technical Specifications ────────────────────── */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-dark mb-4">
                Technické parametre
              </h2>
              <div className="w-16 h-1 bg-warm mx-auto rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {solution.techSpecs.map((spec) => (
                <Card
                  key={spec.label}
                  className="border-border/40 bg-background"
                >
                  <CardContent className="p-5 flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {spec.label}
                    </span>
                    <span className="text-lg font-semibold text-brand-dark">
                      {spec.value}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Checklist ──────────────────────────────────── */}
        <section className="py-16 lg:py-20 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-dark mb-4">
                  Prečo si vybrať LINZMEIER?
                </h2>
                <div className="w-16 h-1 bg-warm mb-6 rounded-full" />
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Naše polyuretánové izolačné systémy LINITHERM spĺňajú najprísnejšie európske normy a sú
                  certifikované pre použitie na Slovensku. Ponúkame komplexné
                  riešenie od konzultácie cez projektovanie až po dodávku a montáž.
                </p>
                <Button
                  size="lg"
                  asChild
                  className="bg-warm text-brand-dark hover:bg-warm-dark shadow-lg hover:shadow-xl transition-all gap-2"
                >
                  <Link href="/#kontakt">
                    Kontaktujte nás
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
              <Card className="border-border/40 bg-background shadow-sm">
                <CardContent className="p-6 lg:p-8">
                  <ul className="space-y-4">
                    {solution.checklist.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <div className="mt-0.5 size-5 rounded-full bg-eco/15 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="size-3.5 text-eco" />
                        </div>
                        <span className="text-sm text-muted-foreground leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ── CTA Banner ─────────────────────────────────── */}
        <section className="bg-brand-dark text-white py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Pripravení začať váš projekt?
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              Kontaktujte našich odborníkov a získajte bezplatnú konzultáciu a
              cenovú ponuku prispôsobenú vašim potrebám.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="bg-warm text-brand-dark hover:bg-warm-dark shadow-lg hover:shadow-xl transition-all gap-2"
              >
                <Link href="/#kontakt">
                  Nezáväzná konzultácia
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/20 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/#podklady">
                  Stiahnuť technické podklady
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
