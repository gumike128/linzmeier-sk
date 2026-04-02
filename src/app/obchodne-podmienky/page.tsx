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
import { FileText } from 'lucide-react'

export default function ObchodnePodmienkyPage() {
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
                    Obchodné podmienky
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center size-10 rounded-lg bg-warm/20 text-warm-dark">
                <FileText className="size-5" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Obchodné podmienky
              </h1>
            </div>
            <p className="text-white/60 max-w-2xl">
              Tieto obchodné podmienky upravujú vzťah medzi spoločnosťou
              LINZMEIER Slovakia s.r.o. a jej obchodnými partnermi a zákazníkmi.
            </p>
          </div>
        </section>

        {/* ─── Content ────────────────────────────────────────── */}
        <section>
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="space-y-10 text-sm text-muted-foreground leading-relaxed">
              {/* 1. Všeobecné ustanovenia */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  1. Všeobecné ustanovenia
                </h2>
                <div className="space-y-2">
                  <p>
                    1.1 Tieto obchodné podmienky (ďalej len &quot;Obchodné podmienky&quot;)
                    upravujú právne vzťahy medzi spoločnosťou LINZMEIER Slovakia
                    s.r.o., so sídlom Hlavná 123, 811 01 Bratislava, IČO:
                    12 345 678, zapísanou v obchodnom registri Okresného súdu
                    Bratislava I, oddiel: Sro, vložka č.: 12345/B (ďalej len
                    &quot;Predávajúci&quot;) a kupujúcim (ďalej len &quot;Kupujúci&quot;).
                  </p>
                  <p>
                    1.2 Predmetom činnosti Predávajúceho je predaj, dodávka a
                    montáž izolačných panelov, fasádnych systémov, priečelových
                    dosiek a príslušenstva.
                  </p>
                  <p>
                    1.3 Kúpna zmluva medzi Predávajúcim a Kupujúcim sa uzatvára
                    v slovenskom jazyku.
                  </p>
                  <p>
                    1.4 Kupujúcim môže byť fyzická osoba — podnikateľ alebo
                    právnická osoba. Predávajúci nenadväzuje obchodný vzťah s
                    spotrebiteľmi v zmysle § 2 písm. a) Zákona č. 250/2007 Z. z.
                    o ochrane spotrebiteľa.
                  </p>
                </div>
              </div>

              <Separator />

              {/* 2. Ceny a platba */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  2. Ceny a platobné podmienky
                </h2>
                <div className="space-y-2">
                  <p>
                    2.1 Všetky ceny uvádzané Predávajúcim sú v eurách (€) a
                    sú uvedené bez DPH, pokiaľ nie je uvedené inak.
                  </p>
                  <p>
                    2.2 Ceny platia pre dodávky na území Slovenskej republiky.
                    Pre dodávky do zahraničia sú ceny určené individuálne na
                    základe cenovej ponuky.
                  </p>
                  <p>
                    2.3 Predávajúci si vyhradzuje právo zmeniť ceny tovaru bez
                    predchádzajúceho upozornenia. Zmena cien sa netýka už
                    potvrdených objednávok.
                  </p>
                  <p>
                    2.4 Faktúrna lehota splatnosti je 14 kalendárnych dní od
                    dátumu vystavenia faktúry, pokiaľ nie je dohodnuté inak v
                    kúpnej zmluve.
                  </p>
                  <p>
                    2.5 Platbu je možné uskutočniť bankovým prevodom na účet
                    Predávajúceho alebo v hotovosti pri prevzatí tovaru.
                  </p>
                  <p>
                    2.6 V prípade omeškania platby je Kupujúci povinný uhradiť
                    Predávajúcemu zmluvnú pokutu vo výške 0,05 % z omeškanej
                    sumy za každý deň omeškania.
                  </p>
                </div>
              </div>

              <Separator />

              {/* 3. Dodanie tovaru */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  3. Dodanie tovaru
                </h2>
                <div className="space-y-2">
                  <p>
                    3.1 Dodacia lehota je určená v kúpnej zmluve alebo v
                    potvrdení objednávky. Bežná dodacia lehota je 2 až 4 týždne
                    od potvrdenia objednávky.
                  </p>
                  <p>
                    3.2 Predávajúci si vyhradzuje právo predĺžiť dodaciu lehotu
                    v prípade vyššej moci, poruchy dodávateľského reťazca alebo
                    iných neočakávaných okolností.
                  </p>
                  <p>
                    3.3 Tovar sa doručuje na adresu určenú Kupujúcim.
                    Dopravné náklady sú určené podľa veľkosti objednávky a
                    miesta dodania.
                  </p>
                  <p>
                    3.4 Riziko prechodu škody na tovari prechádza na Kupujúceho
                    momentom prevzatia tovaru.
                  </p>
                  <p>
                    3.5 Kupujúci je povinný skontrolovať tovar pri prevzatí a
                    písomne potvrdiť jeho preberanie. Reklamácie týkajúce sa
                    množstva a poškodenia pri preprave musia byť uplatnené
                    najneskôr do 24 hodín od prevzatia tovaru.
                  </p>
                </div>
              </div>

              <Separator />

              {/* 4. Záruka a reklamácie */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  4. Záruka a reklamácie
                </h2>
                <div className="space-y-2">
                  <p>
                    4.1 Predávajúci poskytuje na dodávaný tovar záručnú dobu
                    24 mesiacov od dátumu prevzatia tovaru, pokiaľ nie je
                    uvedené inak.
                  </p>
                  <p>
                    4.2 Záruka sa vzťahuje na výrobné vady materiálu a
                    chyby vzniknuté pri výrobe. Záruka sa nevzťahuje na
                    poškodenia vzniknuté nesprávnym používaním, mechanickým
                    poškodením alebo nedodržaním montážnych predpisov.
                  </p>
                  <p>
                    4.3 Reklamáciu je potrebné uplatniť písomne na adrese
                    Predávajúceho alebo e-mailom na info@linzmeier.sk.
                  </p>
                  <p>
                    4.4 Predávajúci je povinný vybaviť reklamáciu bez
                    zbytočného odkladu, najneskôr do 30 kalendárnych dní od
                    jej doručenia.
                  </p>
                </div>
              </div>

              <Separator />

              {/* 5. Odpovednosť */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  5. Odpovednosť
                </h2>
                <div className="space-y-2">
                  <p>
                    5.1 Predávajúci zodpovedá za vady tovaru v súlade s
                    ustanoveniami Občianskeho zákonníka a týchto Obchodných
                    podmienok.
                  </p>
                  <p>
                    5.2 Predávajúci neprenáša na Kupujúceho žiadne
                    skryté vady.
                  </p>
                  <p>
                    5.3 Predávajúci nezodpovedá za škody vzniknuté
                    nesprávnym použitím tovaru, porušením montážnych
                    predpisov alebo zásahom tretích osôb.
                  </p>
                  <p>
                    5.4 Celková zmluvná pokuta za porušenie zmluvných
                    záväzkov zo strany Predávajúceho je obmedzená na
                    výšku 10 % z hodnoty celej objednávky.
                  </p>
                </div>
              </div>

              <Separator />

              {/* 6. Riešenie sporov */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  6. Riešenie sporov
                </h2>
                <div className="space-y-2">
                  <p>
                    6.1 Všetky spory vzniknuté z týchto Obchodných podmienok
                    alebo v súvislosti s nimi budú riešené predovšetkým
                    dohodnú cestou medzi zmluvnými stranami.
                  </p>
                  <p>
                    6.2 Ak sa zmluvným stranám nepodarí spor vyriešiť
                    dohodnú cestou, príslušným súdom na riešenie sporu je
                    okresný súd Bratislava I.
                  </p>
                  <p>
                    6.3 Tieto Obchodné podmienky sa riadia právom
                    Slovenskej republiky.
                  </p>
                </div>
              </div>

              <Separator />

              {/* 7. Záverečné ustanovenia */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  7. Záverečné ustanovenia
                </h2>
                <div className="space-y-2">
                  <p>
                    7.1 Predávajúci si vyhradzuje právo zmeniť tieto Obchodné
                    podmienky. Zmenené podmienky nadobúdajú platnosť dňom
                    ich uverejnenia na webovej stránke www.linzmeier.sk.
                  </p>
                  <p>
                    7.2 Zmluvné vzťahy uzavreté pred zmenou Obchodných
                    podmienok sa riadia predchádzajúcim znením.
                  </p>
                  <p>
                    7.3 Ak sa niektoré ustanovenie týchto Obchodných podmienok
                    stane neplatným, neplatnosť tohto ustanovenia nemá vplyv
                    na platnosť ostatných ustanovení.
                  </p>
                  <p>
                    7.4 Kúpna zmluva má prednosť pred týmito Obchodnými
                    podmienkami, pokiaľ kúpna zmluva neustanovuje inak.
                  </p>
                </div>
              </div>

              <Separator />

              {/* 8. Kontaktné údaje */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  8. Kontaktné údaje
                </h2>
                <div className="bg-muted/30 rounded-lg p-5 space-y-1">
                  <p className="font-medium text-foreground">
                    LINZMEIER Slovakia s.r.o.
                  </p>
                  <p>Sídlo: Hlavná 123, 811 01 Bratislava</p>
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
