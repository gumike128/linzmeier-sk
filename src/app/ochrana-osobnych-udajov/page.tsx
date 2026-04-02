import Link from 'next/link'
import { Header } from '@/components/linzmeier/Header'
import { Footer } from '@/components/linzmeier/Footer'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ShieldCheck } from 'lucide-react'

export default function OchranaOsobnychUdajovPage() {
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
                    Ochrana osobných údajov
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center size-10 rounded-lg bg-warm/20 text-warm-dark">
                <ShieldCheck className="size-5" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Ochrana osobných údajov
              </h1>
            </div>
            <p className="text-white/60 max-w-2xl">
              Informácie o spracúvaní osobných údajov v súlade s Nariadením
              Európskeho parlamentu a Rady (EÚ) 2016/679 (GDPR).
            </p>
          </div>
        </section>

        {/* ─── Content ────────────────────────────────────────── */}
        <section>
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="space-y-10 text-sm text-muted-foreground leading-relaxed">
              {/* 1. Správca údajov */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  1. Správca osobných údajov
                </h2>
                <p>
                  Správcom vašich osobných údajov je:
                </p>
                <div className="bg-muted/30 rounded-lg p-5 mt-3 space-y-1">
                  <p className="font-medium text-foreground">
                    LINZMEIER Slovakia s.r.o.
                  </p>
                  <p>Sídlo: Hlavná 123, 811 01 Bratislava, Slovenská republika</p>
                  <p>IČO: 12 345 678</p>
                  <p>DIČ: 2012345678</p>
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
                </div>
              </div>

              <Separator />

              {/* 2. Zbierané údaje */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  2. Zbierané osobné údaje
                </h2>
                <p className="mb-3">
                  V závislosti od povahy nášho vzťahu môžeme spracúvať nasledujúce
                  kategórie osobných údajov:
                </p>
                <ul className="list-disc list-inside space-y-1.5 ml-2">
                  <li>Základné identifikačné údaje (meno, priezvisko, adresa)</li>
                  <li>Kontaktné údaje (e-mail, telefónne číslo)</li>
                  <li>Údaje o podnikateľskej činnosti (názov spoločnosti, IČO, DIČ)</li>
                  <li>Projektové údaje (typ projektu, rozloha, lokalita)</li>
                  <li>Technické údaje (IP adresa, typ prehliadača, cookies)</li>
                  <li>Údaje z komunikácie (obsah e-mailov, záznamy hovorov)</li>
                </ul>
              </div>

              <Separator />

              {/* 3. Účel spracúvania */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  3. Účel spracúvania osobných údajov
                </h2>
                <p className="mb-3">
                  Vaše osobné údaje spracúvame na nasledujúce účely:
                </p>
                <ul className="list-disc list-inside space-y-1.5 ml-2">
                  <li>Spracovanie a vybavenie vašich požiadaviek a cenových ponúk</li>
                  <li>Plnenie zmluvných záväzkov a obchodnej komunikácie</li>
                  <li>Poskytnutie technickej podpory a konzultácií</li>
                  <li>Marketingové účely (s vašim súhlasom)</li>
                  <li>Analýza a zlepšovanie našich služieb</li>
                  <li>Plnenie právnych povinností</li>
                </ul>
              </div>

              <Separator />

              {/* 4. Právny základ */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  4. Právny základ spracúvania
                </h2>
                <p className="mb-3">
                  Osobné údaje spracúvame na nasledujúcich právnych základoch:
                </p>
                <ul className="list-disc list-inside space-y-1.5 ml-2">
                  <li>
                    <strong className="text-foreground">§ 6 ods. 1 písm. b) GDPR</strong> —
                    spracúvanie je nevyhnutné na plnenie zmluvy
                  </li>
                  <li>
                    <strong className="text-foreground">§ 6 ods. 1 písm. c) GDPR</strong> —
                    spracúvanie je nevyhnutné na splnenie právnej povinnosti
                  </li>
                  <li>
                    <strong className="text-foreground">§ 6 ods. 1 písm. f) GDPR</strong> —
                    spracúvanie na základe oprávneného záujmu správcu
                  </li>
                  <li>
                    <strong className="text-foreground">§ 6 ods. 1 písm. a) GDPR</strong> —
                    spracúvanie na základe vášho súhlasu
                  </li>
                </ul>
              </div>

              <Separator />

              {/* 5. Doba uchovávania */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  5. Doba uchovávania údajov
                </h2>
                <p className="mb-3">
                  Osobné údaje uchovávame len počas doby nevyhnutnej na dosiahnutie
                  účelu spracúvania:
                </p>
                <ul className="list-disc list-inside space-y-1.5 ml-2">
                  <li>Zmluvné údaje — po dobu trvania zmluvného vzťahu a 10 rokov po jeho skončení</li>
                  <li>Údaje z cenových ponúk — 3 roky od posledného kontaktu</li>
                  <li>Marketingové údaje — do odvolania súhlasu</li>
                  <li>Údaje z cookies — podľa nastavenia vášho prehliadača</li>
                  <li>Údaje pre plnenie právnych povinností — podľa príslušných predpisov</li>
                </ul>
              </div>

              <Separator />

              {/* 6. Práva subjektu */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  6. Vaše práva
                </h2>
                <p className="mb-3">
                  V súlade s GDPR máte nasledujúce práva:
                </p>
                <ul className="list-disc list-inside space-y-1.5 ml-2">
                  <li><strong className="text-foreground">Právo na prístup</strong> — právo získať informácie o spracúvaní vašich údajov</li>
                  <li><strong className="text-foreground">Právo na opravu</strong> — právo na opravu nepresných osobných údajov</li>
                  <li><strong className="text-foreground">Právo na výmaz</strong> — právo na vymazanie údajov („právo byť zabudnutý&quot;)</li>
                  <li><strong className="text-foreground">Právo na obmedzenie spracúvania</strong> — právo obmedziť rozsah spracúvania</li>
                  <li><strong className="text-foreground">Právo na prenosnosť</strong> — právo získať údaje v štruktúrovanom formáte</li>
                  <li><strong className="text-foreground">Právo namietať</strong> — právo namietať proti spracúvaniu na základe oprávneného záujmu</li>
                  <li><strong className="text-foreground">Právo odvolať súhlas</strong> — právo kedykoľvek odvolať udelený súhlas</li>
                  <li><strong className="text-foreground">Právo podať sťažnosť</strong> — právo podať sťažnosť u dozorného orgánu (Úrad na ochranu osobných údajov SR)</li>
                </ul>
              </div>

              <Separator />

              {/* 7. Prijímateľia */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  7. Prijímatelia údajov
                </h2>
                <p>
                  Vaše osobné údaje môžu byť sprístupnené tretím stranám len v
                  nezbytnom rozsahu: dodávateľom IT služieb, účtovným a právnym
                  poradcom, prepravným spoločnostiam a orgánom verejnej moci na
                  základe právnych predpisov. Údaje nebudú prenesené do tretích
                  krajín mimo EHP bez vášho výslovného súhlasu.
                </p>
              </div>

              <Separator />

              {/* 8. Kontaktné údaje */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  8. Kontakt
                </h2>
                <p className="mb-3">
                  Pre akékoľvek otázky týkajúce sa ochrany vašich osobných údajov
                  nás môžete kontaktovať:
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
