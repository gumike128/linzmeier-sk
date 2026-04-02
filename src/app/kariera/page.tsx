import Link from 'next/link'
import { Header } from '@/components/linzmeier/Header'
import { Footer } from '@/components/linzmeier/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  TrendingUp,
  ShieldCheck,
  Users,
  GraduationCap,
  Mail,
  Briefcase,
  HeartHandshake,
} from 'lucide-react'

const benefits = [
  {
    icon: TrendingUp,
    title: 'Kariérny rast',
    description:
      'Podporujeme osobný a profesionálny rozvoj našich zamestnancov. Ponúkame jasné kariérne cesty a príležitosti na postup.',
    accent: 'bg-warm/10 text-warm-dark',
  },
  {
    icon: ShieldCheck,
    title: 'Stabilita a istota',
    description:
      'Viac ako 40 rokov na trhu zaručuje dlhodobú stabilitu. Sme spoľahlivý zamestnávateľ s transparentným prístupom.',
    accent: 'bg-brand/10 text-brand',
  },
  {
    icon: Users,
    title: 'Tímová spolupráca',
    description:
      'Práca v medzinárodnom prostredí s kolegami z Nemecka a strednej Európy. Budujeme kultúru otvorenej komunikácie.',
    accent: 'bg-eco/10 text-eco',
  },
  {
    icon: GraduationCap,
    title: 'Školenia a vzdelávanie',
    description:
      'Pravidelné odborné školenia, jazykové kurzy a prístup k najnovším technológiám v oblasti fasádnych systémov.',
    accent: 'bg-warm/10 text-warm-dark',
  },
]

export default function KarieraPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* ─── Hero Section ──────────────────────────────────── */}
        <section className="relative overflow-hidden bg-brand-dark">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-8">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="text-white/60 hover:text-white">
                      Domov
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/40" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white">Kariéra</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <Badge className="bg-warm text-brand-dark border-none text-xs font-semibold px-3 py-1 mb-4">
              <Briefcase className="size-3.5 mr-1.5" />
              Kariéra
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
              Kariéra v{' '}
              <span className="text-warm">LINZMEIER</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl">
              Staňte sa súčasťou nášho tímu a podieľajte sa na budovaní
              energeticky efektívnych budov. Hľadáme motivovaných ľudí, ktorí
              chcú rásť spolu s nami.
            </p>
          </div>
        </section>

        {/* ─── Benefits Grid ──────────────────────────────────── */}
        <section className="bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Prečo pracovať u nás?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Ponúkame viac než len zamestnanie — ponúkame prostredie, v
                ktorom môžete objaviť svoj potenciál.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit) => (
                <Card
                  key={benefit.title}
                  className="border-border/40 hover:border-brand-dark/30 hover:shadow-lg transition-all duration-300 text-center"
                >
                  <CardContent className="pt-6 pb-6 px-6">
                    <div
                      className={`flex items-center justify-center size-12 rounded-xl ${benefit.accent} mb-4 mx-auto`}
                    >
                      <benefit.icon className="size-6" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Open Positions ─────────────────────────────────── */}
        <section>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Otvorené pozície
              </h2>
            </div>

            <Card className="border-border/40 max-w-2xl mx-auto">
              <CardContent className="p-8 sm:p-10 text-center">
                <div className="flex items-center justify-center size-14 rounded-full bg-muted/50 text-muted-foreground/50 mb-5 mx-auto">
                  <Briefcase className="size-7" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Momentálne nemáme otvorené pozície
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-md mx-auto">
                  Zaslaním životopisu na{' '}
                  <a
                    href="mailto:info@linzmeier.sk"
                    className="text-brand-dark font-medium hover:text-warm-dark transition-colors underline underline-offset-2"
                  >
                    info@linzmeier.sk
                  </a>{' '}
                  sa môžete uchádzať o budúce pozície. Budeme vás kontaktovať,
                  až sa otvorí vhodná príležitosť.
                </p>
                <Button
                  asChild
                  className="bg-warm text-brand-dark hover:bg-warm-dark shadow-lg shadow-warm/20"
                >
                  <a href="mailto:info@linzmeier.sk" className="gap-2">
                    <Mail className="size-4" />
                    Poslať životopis
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ─── CTA Section ────────────────────────────────────── */}
        <section className="bg-brand-dark">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="max-w-2xl mx-auto text-center">
              <HeartHandshake className="size-10 text-warm mx-auto mb-5" />
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Máte otázky?
              </h2>
              <p className="text-white/60 mb-8">
                Radi odpovieme na vaše otázky týkajúce sa práce v LINZMEIER.
                Neváhajte nás kontaktovať.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-warm text-brand-dark hover:bg-warm-dark shadow-lg shadow-warm/20"
              >
                <Link href="/#kontakt" className="gap-2">
                  <Mail className="size-4" />
                  Kontaktujte nás
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
