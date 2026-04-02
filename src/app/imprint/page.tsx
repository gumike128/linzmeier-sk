import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/linzmeier/Header'
import { Footer } from '@/components/linzmeier/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Building2,
  Mail,
  Phone,
  Clock,
  Globe,
  Shield,
  Scale,
  ArrowRight,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Imprint | LINZMEIER.SK',
  description:
    'Právne informácie o spoločnosti Linzmeier Bauelemente GmbH – imprint s kontaktnými údajmi, identifikáciou prevádzkovateľa a odkazmi na právne dokumenty.',
}

export default function ImprintPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* ─── Hero Section ──────────────────────────────────── */}
        <section className="bg-brand-dark">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
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
                  <BreadcrumbPage className="text-white">
                    Imprint
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center size-10 rounded-lg bg-warm/20 text-warm-dark">
                <Scale className="size-5" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Imprint
              </h1>
            </div>
            <p className="text-white/60 max-w-2xl">
              Právne informácie o spoločnosti
            </p>
          </div>
        </section>

        {/* ─── Content ────────────────────────────────────────── */}
        <section>
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="space-y-8">
              {/* ── Company Info ──────────────────────────────── */}
              <Card className="border-border/40">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center size-10 rounded-lg bg-brand-dark/10 text-brand-dark">
                      <Building2 className="size-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Informácie o spoločnosti
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Názov spoločnosti
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        Linzmeier Bauelemente GmbH
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Sídlo
                      </p>
                      <p className="text-sm text-foreground">Nemecko</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Založená
                      </p>
                      <p className="text-sm text-foreground">1946</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Zastupca pre SR/ČR
                      </p>
                      <p className="text-sm text-foreground">Marian Meliš</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        E-mail
                      </p>
                      <a
                        href="mailto:marian.melis@linzmeier.sk"
                        className="text-sm text-brand-dark hover:text-warm-dark transition-colors underline underline-offset-2"
                      >
                        marian.melis@linzmeier.sk
                      </a>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Telefón
                      </p>
                      <a
                        href="tel:+421903664079"
                        className="text-sm text-brand-dark hover:text-warm-dark transition-colors"
                      >
                        +421 903 664 079
                      </a>
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Pracovný čas
                      </p>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Clock className="size-4 text-muted-foreground" />
                        Po – Pia: 8:00 – 17:00
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ── Web Information ───────────────────────────── */}
              <Card className="border-border/40">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center size-10 rounded-lg bg-brand-dark/10 text-brand-dark">
                      <Globe className="size-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Webová stránka
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        URL
                      </p>
                      <a
                        href="https://linzmeier.sk/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brand-dark hover:text-warm-dark transition-colors underline underline-offset-2"
                      >
                        https://linzmeier.sk/
                      </a>
                    </div>

                    <Separator />

                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Prevádzkovateľ a technické riešenia
                      </p>
                      <p className="text-sm text-foreground">
                        Linzmeier Bauelemente GmbH, Nemecko
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ── Legal Information ─────────────────────────── */}
              <Card className="border-border/40">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center size-10 rounded-lg bg-brand-dark/10 text-brand-dark">
                      <Shield className="size-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Právne informácie
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      <h3 className="font-medium text-foreground mb-2">
                        Uvedenie o odpovednosti za obsah
                      </h3>
                      <p>
                        Obsah tejto webovej stránky bol s najväčšou starosťou
                        pripravený a kontrolovaný. Predmetné informácie
                        slúžia iba na všeobecné informačné účely. Preto
                        nemožno zaručiť, že všetky informácie sú úplné,
                        správne a aktuálne v každom okamihu. Prevádzkovateľ
                        nepreberá žiadnu zodpovednosť za škody, ktoré vzniknú
                        v dôsledku použitia informácií uvedených na tejto
                        webovej stránke.
                      </p>
                    </div>

                    <Separator />

                    <nav aria-label="Právne dokumenty">
                      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                        Ďalšie právne dokumenty
                      </h3>
                      <ul className="space-y-0">
                        {[
                          {
                            label: 'Ochrana osobných údajov',
                            href: '/ochrana-osobnych-udajov',
                            icon: Shield,
                          },
                          {
                            label: 'Obchodné podmienky',
                            href: '/obchodne-podmienky',
                            icon: Scale,
                          },
                          {
                            label: 'Cookies',
                            href: '/cookies',
                            icon: Globe,
                          },
                        ].map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className="group flex items-center justify-between py-3 text-sm text-foreground hover:text-brand-dark transition-colors"
                            >
                              <span className="flex items-center gap-3">
                                <item.icon className="size-4 text-muted-foreground group-hover:text-brand-dark transition-colors" />
                                {item.label}
                              </span>
                              <ArrowRight className="size-4 text-muted-foreground group-hover:text-warm-dark group-hover:translate-x-0.5 transition-all" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ─── Copyright ─────────────────────────────────── */}
            <div className="mt-12 pt-8 border-t border-border/40 text-center">
              <p className="text-xs text-muted-foreground">
                © 2026 Linzmeier Bauelemente GmbH | Všetky práva vyhradené
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
