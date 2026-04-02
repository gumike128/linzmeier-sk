import Link from 'next/link'
import { Header } from '@/components/linzmeier/Header'
import { Footer } from '@/components/linzmeier/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Cookie, Info, Settings, BarChart3, Lock, ExternalLink } from 'lucide-react'

const cookieTypes = [
  {
    type: 'Nevyhnutné cookies',
    icon: Lock,
    description:
      'Tieto cookies sú nevyhnutné pre fungovanie webovej stránky a nie je možné ich vypnúť. Umožňujú základné funkcie ako navigácia a prístup do chránených častí stránky.',
    examples: 'session_id, csrf_token, cookie_consent',
    required: true,
  },
  {
    type: 'Analytické cookies',
    icon: BarChart3,
    description:
      'Tieto cookies nám pomáhajú pochopiť, ako návštevníci používajú webovú stránku. Zhromažďujú anonymizované informácie a pomáhajú nám zlepšovať používateľský zážitok.',
    examples: '_ga, _gid, _gat',
    required: false,
  },
  {
    type: 'Funkčné cookies',
    icon: Settings,
    description:
      'Funkčné cookies umožňujú webovej stránke zapamätať si vaše voľby (napr. jazyk, región) a poskytnúť vylepšené, personalizované funkcie.',
    examples: 'lang, region, theme',
    required: false,
  },
  {
    type: 'Marketingové cookies',
    icon: Info,
    description:
      'Marketingové cookies sa používajú na sledovanie návštevníkov na webových stránkach. Ich cieľom je zobraziť relevantnú a prispôsobenú reklamu pre jednotlivých používateľov.',
    examples: '_fbp, _gcl_au, ads_prefs',
    required: false,
  },
]

export default function CookiesPage() {
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
                  <BreadcrumbPage className="text-white">Cookies</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center size-10 rounded-lg bg-warm/20 text-warm-dark">
                <Cookie className="size-5" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Cookies
              </h1>
            </div>
            <p className="text-white/60 max-w-2xl">
              Informácie o používaní cookies na webovej stránke linzmeier.sk
              a o tom, ako môžete spravovať svoje preferencie.
            </p>
          </div>
        </section>

        {/* ─── Content ────────────────────────────────────────── */}
        <section>
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="space-y-10 text-sm text-muted-foreground leading-relaxed">
              {/* 1. Čo sú cookies */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  1. Čo sú cookies?
                </h2>
                <div className="space-y-2">
                  <p>
                    Cookies sú malé textové súbory, ktoré sa ukladajú do vášho
                    prehliadača pri návšteve webovej stránky. Slúžia na to, aby
                    webová stránka rozpoznala váš zariadenie a zapamätala si
                    informácie o vašich preferenciách alebo predchádzajúcich
                    návštevách.
                  </p>
                  <p>
                    Cookies môžu byť first-party (vlastné — nastavené doménou
                    linzmeier.sk) alebo third-party (tretích strán — nastavené
                    externými službami, napr. analytické alebo marketingové
                    nástroje).
                  </p>
                </div>
              </div>

              <Separator />

              {/* 2. Druhy cookies */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  2. Aké cookies používame?
                </h2>
                <p className="mb-5">
                  Na webovej stránke linzmeier.sk používame nasledujúce typy cookies:
                </p>

                <div className="grid grid-cols-1 gap-4">
                  {cookieTypes.map((cookie) => (
                    <Card
                      key={cookie.type}
                      className="border-border/40 hover:border-brand-dark/20 transition-colors"
                    >
                      <CardContent className="p-5 sm:p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex items-center justify-center size-10 rounded-lg bg-muted/50 text-muted-foreground shrink-0">
                            <cookie.icon className="size-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <h3 className="text-base font-semibold text-foreground">
                                {cookie.type}
                              </h3>
                              {cookie.required ? (
                                <Badge
                                  variant="secondary"
                                  className="text-[11px] font-medium bg-warm/10 text-warm-dark border-0"
                                >
                                  Vždy aktívne
                                </Badge>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="text-[11px] font-medium bg-muted text-muted-foreground border-0"
                                >
                                  Voliteľné
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                              {cookie.description}
                            </p>
                            <p className="text-xs text-muted-foreground/60">
                              Príklady: <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs">{cookie.examples}</code>
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              {/* 3. Účel */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  3. Na aký účel používame cookies?
                </h2>
                <ul className="list-disc list-inside space-y-1.5 ml-2">
                  <li>Na zabezpečenie základného fungovania webovej stránky</li>
                  <li>Na zapamätanie si vášho súhlasu s cookies</li>
                  <li>Na analyzovanie návštevnosti a správania návštevníkov</li>
                  <li>Na zlepšovanie výkonu a používateľského zážitku</li>
                  <li>Na prispôsobenie obsahu a reklamy</li>
                  <li>Na integráciu služieb tretích strán (mapy, videá, sociálne siete)</li>
                </ul>
              </div>

              <Separator />

              {/* 4. Správa cookies */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  4. Ako spravovať cookies?
                </h2>
                <div className="space-y-3">
                  <p>
                    Pri prvej návšteve našej webovej stránky sa zobrazí banner
                    s výzvou na prijatie cookies. Môžete si vybrať, ktoré
                    typy cookies chcete povoliť.
                  </p>
                  <p>
                    Svoje rozhodnutie môžete kedykoľvek zmeniť v nastaveniach
                    cookies, ktoré nájdete v pätičke webovej stránky.
                  </p>
                  <p>
                    Cookies môžete tiež spravovať priamo v nastaveniach vášho
                    prehliadača. Viac informácií nájdete na stránkach
                    jednotlivých prehliadačov:
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[
                      { name: 'Google Chrome', url: 'https://support.google.com/chrome' },
                      { name: 'Mozilla Firefox', url: 'https://support.mozilla.org' },
                      { name: 'Safari', url: 'https://support.apple.com/safari' },
                      { name: 'Microsoft Edge', url: 'https://support.microsoft.com/edge' },
                    ].map((browser) => (
                      <a
                        key={browser.name}
                        href={browser.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-brand-dark hover:text-warm-dark transition-colors underline underline-offset-2"
                      >
                        {browser.name}
                        <ExternalLink className="size-3" />
                      </a>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    Upozornenie: Vypnutie niektorých cookies môže ovplyvniť
                    funkčnosť webovej stránky.
                  </p>
                </div>
              </div>

              <Separator />

              {/* 5. Platnosť cookies */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  5. Doba platnosti cookies
                </h2>
                <ul className="list-disc list-inside space-y-1.5 ml-2">
                  <li>
                    <strong className="text-foreground">Session cookies</strong> —
                    platia len počas trvania jednej návštevy a vymažú sa po
                    zatvorení prehliadača
                  </li>
                  <li>
                    <strong className="text-foreground">Trvalé cookies</strong> —
                    zostávajú uložené v prehliadači až do ich expirácie alebo
                    manuálneho vymazania (spravidla od 1 mesiaca do 2 rokov)
                  </li>
                </ul>
              </div>

              <Separator />

              {/* 6. Zmeny */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  6. Zmeny v politike cookies
                </h2>
                <p>
                  Môžeme občas aktualizovať túto politiku cookies, aby sme
                  odrážali zmeny v cookies, ktoré používame, alebo z iných
                  prevádzkových, právnych alebo regulačných dôvodov. Odporúčame
                  vám pravidelne si túto stránku prezerávať, aby ste boli
                  informovaní o našom používaní cookies.
                </p>
              </div>

              <Separator />

              {/* 7. Kontakt */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  7. Kontakt
                </h2>
                <p className="mb-3">
                  Ak máte akékoľvek otázky týkajúce sa nášho používania cookies,
                  kontaktujte nás:
                </p>
                <div className="bg-muted/30 rounded-lg p-5 space-y-1">
                  <p className="font-medium text-foreground">
                    LINZMEIER Slovakia s.r.o.
                  </p>
                  <p>
                    E-mail:{' '}
                    <a
                      href="mailto:info@linzmeier.sk"
                      className="text-brand-dark hover:text-warm-dark transition-colors underline underline-offset-2"
                    >
                      info@linzmeier.sk
                    </a>
                  </p>
                  <p>Telefón: +421 2 XXX XXX XX</p>
                  <p>Adresa: Hlavná 123, 811 01 Bratislava</p>
                </div>
                <p className="mt-4 text-xs text-muted-foreground/60">
                  Tento dokument bol naposledy aktualizovaný: 1. január 2025
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
