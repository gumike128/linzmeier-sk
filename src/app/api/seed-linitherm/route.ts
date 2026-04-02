import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // 1. Delete all existing products
    await db.product.deleteMany()
    console.log('[seed-linitherm] Deleted all existing products')

    // 2. Create category-level products
    const categories = [
      {
        slug: 'sikma-strecha',
        name: 'Šikmá strecha',
        category: 'sikma-strecha',
        shortDesc: 'Kompletný systém tepelnej izolácie pre šikmé strechy – od nadkrokových panelov až po panely s integrovanou hydroizoláciou.',
        description: 'LINITHERM systém pre šikmé strechy ponúka univerzálne riešenia pre novostavby aj rekonštrukcie. Naše panely zabezpečujú vynikajúcu tepelnú izoláciu, jednoduchú montáž a dlhú životnosť. Sú vhodné pre rodinné domy, bytové domy aj priemyselné objekty. Všetky produkty spĺňajú prísne európske normy a sú certifikované pre použitie v Slovenskej republike.',
        benefits: JSON.stringify([
          'Vynikajúce tepelnoizolačné vlastnosti',
          'Rýchla a jednoduchá montáž',
          'Certifikované podľa európskych noriem',
          'Vhodné pre novostavby aj rekonštrukcie',
        ]),
        sortOrder: 1,
      },
      {
        slug: 'plocha-strecha',
        name: 'Plochá strecha',
        category: 'plocha-strecha',
        shortDesc: 'Izolačné dosky a spádové panely pre nevetrané ploché strechy s optimálnym odvodnením.',
        description: 'Systém LINITHERM pre ploché strechy zahŕňa odosky a spádové dosky navrhnuté pre efektívne riešenie tepelnej izolácie nevetraných plochých striech. Panely umožňujú rýchlu montáž a zabezpečujú trvalú ochranu proti úniku tepla a vlhkosti. Ideálne pre komerčné budovy, bytové domy aj priemyselné haly.',
        benefits: JSON.stringify([
          'Efektívne odvodnenie vďaka spádovým doskám',
          'Vysoká odolnosť proti vlhkosti',
          'Rýchla montáž bez potreby zložitého lesenia',
          'Spĺňa požiadavky na ploché strechy podľa STN EN',
        ]),
        sortOrder: 2,
      },
      {
        slug: 'izolacia-stropu',
        name: 'Izolácia stropu',
        category: 'izolacia-stropu',
        shortDesc: 'Panely so sadrokartónom pre tepelnú izoláciu stropov garáži, pivníc a nevykurovaných priestorov.',
        description: 'Izolačné panely LINITHERM pre stropy sú určené pre tepelnú izoláciu nevykurovaných priestorov pod obytnými miestnosťami. Sú ideálne pre garáže, pivnice, podkrovia a iné technické priestory. Panel s integrovaným sadrokartónom umožňuje okamžitú aplikáciu omietky alebo maľby, čo výrazne skracuje dobu výstavby.',
        benefits: JSON.stringify([
          'Integrovaný sadrokartón pre okamžitú povrchovú úpravu',
          'Vysoký tepelný odpor pre úsporu energie',
          'Jednoduchá rezba a montáž',
          'Ideálne pre garáže a pivnice',
        ]),
        sortOrder: 3,
      },
      {
        slug: 'prevetravana-fasada',
        name: 'Prevzrávaná fasáda',
        category: 'prevetravana-fasada',
        shortDesc: 'Panely s obojstrannou hliníkovou fóliou pre tepelnú izoláciu prevzrávaných fasádnych systémov.',
        description: 'LINITHERM systém pre prevzrávané fasády poskytuje efektívne riešenie tepelnej ochrany obvodových plášťov budov. Panely s obojstrannou hliníkovou fóliou zabraňujú prenikaniu vlhkosti a zabezpečujú stabilnú tepelnú izoláciu po celý rok. Sú kompatibilné s väčšinou bežných fasádnych systémov na slovenskom trhu.',
        benefits: JSON.stringify([
          'Obojstranná hliníková fólia proti vlhkosti',
          'Kompatibilná s väčšinou fasádnych systémov',
          'Dlhá životnosť a odolnosť voči povetrnostným vplyvom',
        ]),
        sortOrder: 4,
      },
      {
        slug: 'podlaha',
        name: 'Podlaha',
        category: 'podlaha',
        shortDesc: 'Pochôdzne izolačné prvky a panely pre tepelnú izoláciu podláh a stropov nevykurovaných priestorov.',
        description: 'LINITHERM systém pre podlahy ponúka riešenia pre tepelnú izoláciu podláh v novostavbách aj rekonštrukciách. Naše pochôdzne panely sú vhodné pre podlahové konštrukcie na nevykurovanom podkroví, zatiaľ čo panely PMV sú navrhnuté pre izoláciu pod cementové a anhydritové potery. Všetky produkty zabezpečujú vysokú nosnosť a vynikajúce tepelnoizolačné vlastnosti.',
        benefits: JSON.stringify([
          'Vysoká nosnosť pre bezpečný prechod',
          'Kompatibilné s cementovými a anhydritovými potermi',
          'Rýchla a suchá montáž bez mokrých procesov',
        ]),
        sortOrder: 5,
      },
    ]

    for (const cat of categories) {
      await db.product.create({
        data: {
          ...cat,
          status: 'PUBLISHED',
          metaTitle: `LINITHERM ${cat.name} | LINZMEIER SK`,
          metaDescription: cat.shortDesc,
          specs: null,
          imageUrl: null,
        },
      })
    }
    console.log('[seed-linitherm] Created 5 category products')

    // 3. Create specific products
    const products = [
      // ── Šikmá strecha ──────────────────────────────────────────
      {
        slug: 'liniherm-pal-nf',
        name: 'LINITHERM PAL N+F',
        category: 'sikma-strecha',
        shortDesc: 'Univerzálny nadkrokový panel s vynikajúcimi tepelnými vlastnosťami pre šikmé strechy rodinných domov a bytových budov.',
        description: `LINITHERM PAL N+F je univerzálny nadkrokový panel navrhnutý pre efektívne riešenie tepelnej izolácie šikmých striech. Vďaka vysokému tepelnému odporu minimalizuje tepelné straty v zime a chráni pred prehrievaním v lete. Panel je vhodný pre novostavby aj rekonštrukcie rodinných domov, bytových budov a komerčných objektov.

Jedinečná konštrukcia panela kombinuje polyuretán/polyizokyanurátovou (PIR/PUR) penou s obojstrannou úpravou, čo zabezpečuje dlhú životnosť a stabilné tepelnoizolačné vlastnosti počas celej životnosti budovy. Montáž je rýchla a jednoduchá, panel je ľahký a ľahko sa reže na požadovaný rozmer.

Produkt spĺňa všetky platné európske normy pre požiarnu bezpečnosť a je certifikovaný pre použitie v Slovenskej republike. Ideálny pre projektantov a stavebníkov, ktorí hľadajú spoľahlivé a cenovo dostupné riešenie pre izoláciu šikmých striech.`,
        specs: JSON.stringify({
          tepelnyOdpor: '5,50 (m²·K)/W',
          hrubka: '200 mm',
          rozmerPanelu: '1200 × 2500 mm',
          hmotnost: 'približne 28 kg/m²',
          material: 'PIR/PUR pena s hliníkovou fóliou',
          triedaPoziarnejOdpornosti: 'C-s3, d0',
          lambda: '0,024 W/(m·K)',
        }),
        benefits: JSON.stringify([
          'Vysoký tepelný odpor 5,50 (m²·K)/W',
          'Univerzálne použitie pre novostavby aj rekonštrukcie',
          'Ľahká a rýchla montáž',
          'Nízka tepelná vodivosť λ = 0,024 W/(m·K)',
          'Spĺňa požiadavky na nízkoenergetické budovy',
          'Certifikovaný podľa STN EN 14509',
        ]),
        metaTitle: 'LINITHERM PAL N+F – Nadkrokový panel pre šikmú strechu | LINZMEIER SK',
        metaDescription: 'LINITHERM PAL N+F je univerzálny nadkrokový panel s tepelným odporom 5,50 (m²·K)/W. Ideálne pre izoláciu šikmých striech rodinných domov a bytových budov.',
        suitableFor: JSON.stringify([
          'Rodinné domy',
          'Bytové domy',
          'Komerčné budovy',
          'Rekonštrukcie striech',
          'Nízkoenergetické domy',
        ]),
        sortOrder: 1,
      },
      {
        slug: 'liniherm-pal-sil-t',
        name: 'LINITHERM PAL SIL T',
        category: 'sikma-strecha',
        shortDesc: 'Panel s protihlukovou vrstvou pre rekonštrukcie – znižuje prenos hluku a zároveň zabezpečuje vynikajúcu tepelnú izoláciu.',
        description: `LINITHERM PAL SIL T je špeciálny nadkrokový panel vybavený integrovanou protihlukovou vrstvou. Je určený predovšetkým pre rekonštrukcie existujúcich budov, kde je okrem tepelnej izolácie potrebné aj zlepšenie akustického komfortu. Panel účinne tlmi nárazový aj preletový hluk z dažďa, krupobitia a iných vonkajších zdrojov.

Vďaka kombinácii tepelnej a zvukovej izolácie v jednom paneli sa výrazne skracuje čas montáže a znižujú celkové náklady na rekonštrukciu. Panel je možné použiť pri rekonštrukciách historických budov, pri zmene využitia podkrovných priestorov na obytné miestnosti alebo pri modernizácii starších bytových domov.

LINITHERM PAL SIL T je certifikovaný podľa európskych noriem a spĺňa požiadavky na akustickú ochranu podľa STN. Je ideálnou voľbou pre projektantov a stavebníkov, ktorí potrebujú vyriešiť tepelnú aj zvukovú izoláciu v jednom kroku.`,
        specs: JSON.stringify({
          tepelnyOdpor: '5,00 (m²·K)/W',
          hrubka: '200 mm',
          rozmerPanelu: '1200 × 2500 mm',
          hmotnost: 'približne 32 kg/m²',
          material: 'PIR/PUR pena s protihlukovou vrstvou',
          zvukovaIzolacia: 'Rw ≤ 33 dB',
          triedaPoziarnejOdpornosti: 'C-s3, d0',
          lambda: '0,025 W/(m·K)',
        }),
        benefits: JSON.stringify([
          'Integrovaná protihluková vrstva Rw ≤ 33 dB',
          'Dvojité riešenie tepelnej a zvukovej izolácie',
          'Ideálny pre rekonštrukcie podkrovných priestorov',
          'Znižuje nárazový hluk z dažďa a krupobitia',
          'Rýchla montáž – jeden panel rieši obe funkcie',
          'Certifikovaný podľa STN pre akustickú ochranu',
        ]),
        metaTitle: 'LINITHERM PAL SIL T – Panel s protihlukovou vrstvou | LINZMEIER SK',
        metaDescription: 'LINITHERM PAL SIL T je nadkrokový panel s protihlukovou vrstvou pre rekonštrukcie. Znižuje hluk a zabezpečuje tepelnú izoláciu v jednom kroku.',
        suitableFor: JSON.stringify([
          'Rekonštrukcie rodinných domov',
          'Rekonštrukcie bytových domov',
          'Adaptácia podkrovia na obytné priestory',
          'Historické budovy',
          'Budovy pri rušných komunikáciách',
        ]),
        sortOrder: 2,
      },
      {
        slug: 'liniherm-pgv-t',
        name: 'LINITHERM PGV T',
        category: 'sikma-strecha',
        shortDesc: 'Panel s integrovanou hydroizoláciou pre rýchlu montáž šikmých striech bez potreby ďalších hydroizolačných vrstiev.',
        description: `LINITHERM PGV T je inovatívny panel pre šikmé strechy, ktorý integruje tepelnú izoláciu a hydroizoláciu do jedného kompaktného prvku. Vďaka tomu sa výrazne zjednodušuje a urýchľuje montáž strešného plášťa – nie je potrebné aplikovať samostatnú hydroizolačnú vrstvu.

Panel je vybavený podšmykovej úpravou vrstvou z hliníkovej fólie a bitúmenových pásov, ktoré zabezpečujú spoľahlivú ochranu proti prenikaniu vody. Je ideálny pre novostavby s nárokom na rýchlu realizáciu strešnej konštrukcie a minimalizáciu počtu montážnych krokov.

LINITHERM PGV T je vhodný pre šikmé strechy s minimálnym sklonom 15° a je kompatibilný s väčšinou bežných strešných krytín. Systémová certifikácia zabezpečuje bezpečnosť a spoľahlivosť celej strešnej konštrukcie.`,
        specs: JSON.stringify({
          tepelnyOdpor: '4,80 (m²·K)/W',
          hrubka: '180 mm',
          rozmerPanelu: '1200 × 2500 mm',
          hmotnost: 'približne 26 kg/m²',
          material: 'PIR/PUR pena s integrovanou hydroizoláciou',
          minimalnySklonStrechy: '15°',
          triedaPoziarnejOdpornosti: 'B-s2, d0',
          lambda: '0,024 W/(m·K)',
        }),
        benefits: JSON.stringify([
          'Integrovaná hydroizolácia – žiadna ďalšia vrstva',
          'Rýchla montáž – minimalizácia montážnych krokov',
          'Spoľahlivá ochrana proti vlhkosti',
          'Vhodný pre sklon strechy od 15°',
          'Kompatibilný s bežnými strešnými krytinami',
          'Systémová certifikácia',
        ]),
        metaTitle: 'LINITHERM PGV T – Panel s hydroizoláciou pre šikmú strechu | LINZMEIER SK',
        metaDescription: 'LINITHERM PGV T je panel s integrovanou hydroizoláciou pre rýchlu montáž šikmých striech. Všetko v jednom paneli – tepelná izolácia aj hydroizolácia.',
        suitableFor: JSON.stringify([
          'Novostavby rodinných domov',
          'Bytové domy',
          'Komerčné budovy',
          'Strechy s krytinou z plechu alebo škridly',
          'Stavby s nárokom na rýchlu realizáciu',
        ]),
        sortOrder: 3,
      },
      {
        slug: 'liniherm-pal-2u',
        name: 'LINITHERM PAL 2U',
        category: 'sikma-strecha',
        shortDesc: 'Flexibilný panel pre kombinované použitie na šikmých strechách a stenách s možnosťou obojstrannej montáže.',
        description: `LINITHERM PAL 2U je flexibilný izolačný panel navrhnutý pre kombinované použitie na šikmých strechách a vertikálnych pláštoch budov. Vďaka obojstrannej úprave môže byť namontovaný z oboch strán, čo poskytuje maximálnu flexibilitu pri návrhu a realizácii stavebných projektov.

Panel je obzvlášť vhodný pre projekty s neštandardnými strešnými tvarmi, kde je potrebná prispôsobivosť materiálu. Je možné ho použiť ako súčasť komplexného systému tepelnej ochrany budovy, kde izoluje strešnú aj stennú konštrukciu jedným typom panela.

LINITHERM PAL 2U spĺňa prísne požiadavky na tepelnú izoláciu a je vhodný pre nízkoenergetické a pasívne domy. Jeho univerzálnosť znižuje potrebu skladovania rôznych typov panelov a zjednodušuje logistiku na stavenisku.`,
        specs: JSON.stringify({
          tepelnyOdpor: '5,20 (m²·K)/W',
          hrubka: '190 mm',
          rozmerPanelu: '1200 × 2500 mm',
          hmotnost: 'približne 27 kg/m²',
          material: 'PIR/PUR pena s obojstrannou hliníkovou fóliou',
          triedaPoziarnejOdpornosti: 'C-s3, d0',
          lambda: '0,024 W/(m·K)',
          montaz: 'Obojstranná',
        }),
        benefits: JSON.stringify([
          'Obojstranná montáž pre maximálnu flexibilitu',
          'Univerzálne použitie strecha aj stena',
          'Vhodný pre neštandardné strešné tvary',
          'Zjednodušená logistika na stavenisku',
          'Spĺňa požiadavky na pasívne domy',
          'Certifikovaný podľa STN EN 14509',
        ]),
        metaTitle: 'LINITHERM PAL 2U – Flexibilný panel pre strechu aj stenu | LINZMEIER SK',
        metaDescription: 'LINITHERM PAL 2U je flexibilný izolačný panel pre kombinované použitie na šikmých strechách a stenách. Obojstranná montáž pre maximálnu flexibilitu.',
        suitableFor: JSON.stringify([
          'Rodinné domy',
          'Bytové domy',
          'Nízkoenergetické domy',
          'Pasívne domy',
          'Budovy s neštandardnou strešnou konštrukciou',
        ]),
        sortOrder: 4,
      },

      // ── Plochá strecha ──────────────────────────────────────────
      {
        slug: 'liniherm-pal-fd',
        name: 'LINITHERM PAL FD / UNIVERSAL',
        category: 'plocha-strecha',
        shortDesc: 'Odosky pre nevetrané ploché strechy s vynikajúcimi tepelnými vlastnosťami a vysokou odolnosťou proti vlhkosti.',
        description: `LINITHERM PAL FD / UNIVERSAL sú odosky navrhnuté pre tepelnú izoláciu nevetraných plochých striech. Sú určené pre montáž priamo pod strešnú hydroizoláciu a zabezpečujú spoľahlivú tepelnú ochranu budovy po celý rok. Vďaka vysokému tepelnému odporu výrazne znižujú energetické náklady na kúrenie a klimatizáciu.

Panely sú vyrobené z polyizokyanurátovej (PIR) peny s obojstrannou úpravou z hliníkovo-sklenených fólií, čo zabezpečuje vysokú mechanickú odolnosť a odolnosť proti vlhkosti. Sú vhodné pre komerčné budovy, bytové domy, priemyselné haly aj administratívne objekty.

LINITHERM PAL FD / UNIVERSAL spĺňa prísne požiadavky európskych noriem pre ploché strechy a je certifikovaný pre použitie v Slovenskej republike. Je kompatibilný so všetkými bežnými typmi strešných hydroizolácií.`,
        specs: JSON.stringify({
          tepelnyOdpor: '5,00 (m²·K)/W',
          hrubka: '180 mm',
          rozmerPanelu: '1200 × 2400 mm',
          hmotnost: 'približne 22 kg/m²',
          material: 'PIR pena s hliníkovo-sklenenou fóliou',
          tlakovaPevnost: '≥ 150 kPa',
          triedaPoziarnejOdpornosti: 'D-s2, d0',
          lambda: '0,023 W/(m·K)',
        }),
        benefits: JSON.stringify([
          'Vysoký tepelný odpor 5,00 (m²·K)/W',
          'Vysoká odolnosť proti vlhkosti',
          'Nízka hmotnosť – nezaťažuje strešnú konštrukciu',
          'Kompatibilný so všetkými typmi hydroizolácie',
          'Vhodný pre zelené strechy a strechy s extenzívnou vegetáciou',
          'Spĺňa požiadavky na komerčné budovy',
        ]),
        metaTitle: 'LINITHERM PAL FD / UNIVERSAL – Odosky pre plochú strechu | LINZMEIER SK',
        metaDescription: 'LINITHERM PAL FD / UNIVERSAL sú odosky pre nevetrané ploché strechy s tepelným odporom 5,00 (m²·K)/W. Ideálne pre komerčné a bytové budovy.',
        suitableFor: JSON.stringify([
          'Komerčné budovy',
          'Bytové domy',
          'Priemyselné haly',
          'Administratívne objekty',
          'Zelené strechy',
          'Strechy so solárnymi panelmi',
        ]),
        sortOrder: 5,
      },
      {
        slug: 'liniherm-pal-gefälle',
        name: 'LINITHERM PAL Gefälle',
        category: 'plocha-strecha',
        shortDesc: 'Spádové dosky pre odvodnenie plochých striech s integrovaným spádom pre bezpečný odtok dažďovej vody.',
        description: `LINITHERM PAL Gefälle sú spádové dosky navrhnuté pre vytvorenie potrebného spádu na plochých striechách. Vďaka integrovanému spádu zabezpečujú bezpečné a efektívne odvodnenie dažďovej vody, čo predlžuje životnosť strešnej konštrukcie a hydroizolácie.

Spádové dosky kombinujú funkciu tepelnej izolácie a tvorbu spádu v jednom produkte. Sú dostupné v rôznych spádových profiloch a hrúbkach, čo umožňuje optimálne prispôsobenie každej strešnej konštrukcii. Sú ideálne pre rekonštrukcie existujúcich plochých striech bez potreby zmeny existujúcej nosnej konštrukcie.

LINITHERM PAL Gefälle je certifikovaný podľa európskych noriem a spĺňa požiadavky na odvodnenie plochých striech podľa STN. Je kompatibilný so všetkými bežnými typmi strešných hydroizolácií a atikami.`,
        specs: JSON.stringify({
          tepelnyOdpor: '4,00 (m²·K)/W',
          hrubka: '160–220 mm',
          rozmerPanelu: '1200 × 2400 mm',
          hmotnost: 'približne 20–28 kg/m²',
          material: 'PIR pena s hliníkovo-sklenenou fóliou',
          spad: '2 % (voliteľný)',
          tlakovaPevnost: '≥ 120 kPa',
          lambda: '0,024 W/(m·K)',
        }),
        benefits: JSON.stringify([
          'Integrovaný spád 2 % pre bezpečné odvodnenie',
          'Kombinácia izolácie a spádu v jednom produkte',
          'Ideálny pre rekonštrukcie bez zmeny nosnej konštrukcie',
          'Rôzne spádové profily na mieru',
          'Kompatibilný so všetkými hydroizoláciami',
          'Znižuje riziko stojacej vody na streche',
        ]),
        metaTitle: 'LINITHERM PAL Gefälle – Spádové dosky pre plochú strechu | LINZMEIER SK',
        metaDescription: 'LINITHERM PAL Gefälle sú spádové dosky pre ploché strechy s integrovaným spádom. Tepelná izolácia a odvodnenie v jednom produkte.',
        suitableFor: JSON.stringify([
          'Komerčné budovy',
          'Bytové domy',
          'Rekonštrukcie plochých striech',
          'Strechy s atikami',
          'Priemyselné objekty',
        ]),
        sortOrder: 6,
      },

      // ── Izolácia stropu ──────────────────────────────────────────
      {
        slug: 'liniherm-pal-gk',
        name: 'LINITHERM PAL GK',
        category: 'izolacia-stropu',
        shortDesc: 'Panel so sadrokartónom pre stropy garáži, pivníc a nevykurovaných priestorov – okamžite pripravený na omietku alebo maľbu.',
        description: `LINITHERM PAL GK je tepelnoizolačný panel vybavený integrovanou sadrokartónovou doskou. Je určený pre tepelnú izoláciu stropov nevykurovaných priestorov – garáži, pivníc, sklepení a podkrovných priestorov pod obytnými miestnosťami. Vďaka sadrokartónu je strop okamžite pripravený na aplikáciu omietky alebo maľby bez potreby ďalších povrchových úprav.

Panel poskytuje vynikajúcu tepelnú izoláciu a výrazne znižuje tepelné straty cez strop do nevykurovaných priestorov. Je obzvlášť dôležitý v rodinných domoch, kde garáž alebo pivnica priamo susedí s obytnými miestnosťami. Zabezpečuje príjemnú teplotu v obytných priestoroch a znižuje náklady na kúrenie.

LINITHERM PAL GK je ľahký, ľahko sa reže a montuje sa jednoduchým lepením alebo mechanickým upevnením. Je ideálny pre rekonštrukcie aj novostavby a spĺňa všetky platné normy pre požiarnu bezpečnosť a hygienu obytného prostredia.`,
        specs: JSON.stringify({
          tepelnyOdpor: '4,50 (m²·K)/W',
          hrubka: '160 mm',
          rozmerPanelu: '1200 × 2500 mm',
          hmotnost: 'približne 32 kg/m²',
          material: 'PIR pena so sadrokartónom 12,5 mm',
          sadrokartonovaDoska: '12,5 mm typu A (DIN 18180)',
          triedaPoziarnejOdpornosti: 'D-s2, d0',
          lambda: '0,024 W/(m·K)',
        }),
        benefits: JSON.stringify([
          'Sadrokartón pre okamžitú povrchovú úpravu',
          'Vysoký tepelný odpor 4,50 (m²·K)/W',
          'Ideálny pre garáže a pivnice pod obytnými miestnosťami',
          'Jednoduchá montáž lepením alebo mechanicky',
          'Spĺňa normy pre hygienu obytného prostredia',
          'Znižuje riziko kondenzácie a plesní',
        ]),
        metaTitle: 'LINITHERM PAL GK – Panel so sadrokartónom pre strop | LINZMEIER SK',
        metaDescription: 'LINITHERM PAL GK je panel so sadrokartónom pre tepelnú izoláciu stropov garáži a pivníc. Okamžite pripravený na omietku alebo maľbu.',
        suitableFor: JSON.stringify([
          'Garáže rodinných domov',
          'Pivnice a sklepné priestory',
          'Podkrovné priestory pod obytnými miestnosťami',
          'Technické priestory',
          'Rekonštrukcie nevykurovaných priestorov',
        ]),
        sortOrder: 7,
      },

      // ── Prevzrávaná fasáda ──────────────────────────────────────
      {
        slug: 'liniherm-pal-w',
        name: 'LINITHERM PAL W',
        category: 'prevetravana-fasada',
        shortDesc: 'Panel s obojstrannou hliníkovou fóliou pre tepelnú izoláciu prevzrávaných fasádnych systémov.',
        description: `LINITHERM PAL W je tepelnoizolačný panel vybavený obojstrannou hliníkovou fóliou, navrhnutý špeciálne pre prevzrávané fasádne systémy. Obojstranná hliníková fólia účinne bráni prenikaniu vlhkosti z interiéru aj exteriéru, čo zabezpečuje stabilné tepelnoizolačné vlastnosti po celý rok.

Panel je ideálny ako súčasť prevzrávanej fasády, kde tvorí prvú vrstvu tepelnej ochrany obvodového plášťa budovy. V kombinácii s ventilačnou medzerou a vonkajšou fasádnou doskou vytvára efektívny systém, ktorý chráni budovu pred stratou tepla a zároveň umožňuje difúziu vodnej pary.

LINITHERM PAL W je kompatibilný s väčšinou bežných fasádnych systémov používaných na slovenskom trhu, vrátane drevených, kovových a vláknocementových fasádnych dosiek. Je certifikovaný podľa európskych noriem a spĺňa prísne požiadavky na tepelnú ochranu budov.`,
        specs: JSON.stringify({
          tepelnyOdpor: '4,80 (m²·K)/W',
          hrubka: '180 mm',
          rozmerPanelu: '1200 × 2500 mm',
          hmotnost: 'približne 25 kg/m²',
          material: 'PIR pena s obojstrannou hliníkovou fóliou',
          paroprepustnost: 'SD ≤ 5 m',
          triedaPoziarnejOdpornosti: 'C-s3, d0',
          lambda: '0,024 W/(m·K)',
        }),
        benefits: JSON.stringify([
          'Obojstranná hliníková fólia proti vlhkosti',
          'Kompatibilný s väčšinou fasádnych systémov',
          'Dlhá životnosť a odolnosť',
          'Stabilné tepelnoizolačné vlastnosti',
          'Umožňuje efektívne prevzrávanie obvodového plášťa',
          'Certifikovaný podľa STN EN 14509',
        ]),
        metaTitle: 'LINITHERM PAL W – Panel pre prevzrávanú fasádu | LINZMEIER SK',
        metaDescription: 'LINITHERM PAL W je panel s obojstrannou hliníkovou fóliou pre tepelnú izoláciu prevzrávaných fasád. Kompatibilný s väčšinou fasádnych systémov.',
        suitableFor: JSON.stringify([
          'Rodinné domy',
          'Bytové domy',
          'Komerčné budovy',
          'Administratívne objekty',
          'Rekonštrukcie fasád',
          'Drevené a kovové fasády',
        ]),
        sortOrder: 8,
      },

      // ── Podlaha ──────────────────────────────────────────────────
      {
        slug: 'liniherm-phw',
        name: 'LINITHERM PHW',
        category: 'podlaha',
        shortDesc: 'Pochôdzny izolačný prvok pre podlahy nevykurovaného podkrovia s vysokou nosnosťou a ľahkou montážou.',
        description: `LINITHERM PHW je pochôdzny izolačný prvok navrhnutý pre tepelnú izoláciu podláh na nevykurovanom podkroví. Vďaka vysokému tepelnému odporu zabezpečuje efektívne oddelenie obytných priestorov od nevykurovaného podkrovia a výrazne znižuje tepelné straty cez strop.

Panel je vybavený ochrannou vrstvou na hornej strane, ktorá umožňuje bezpečný prechod a manipuláciu s uloženými predmetmi. Je ideálny pre rodinné domy s nevykurovaným podkrovím využívaným ako skladovací priestor. Vysoká nosnosť panela zabezpečuje bezpečné použitie aj pri bežnom zaťažení.

Montáž LINITHERM PHW je jednoduchá a rýchla – panely sa jednoducho pokladajú na existujúcu podlahovú konštrukciu a vzájomne spojujú. Nepotrebujú žiadne špeciálne náradie ani mokré procesy, čo umožňuje dokončenie izolácie za jedný deň.`,
        specs: JSON.stringify({
          tepelnyOdpor: '4,20 (m²·K)/W',
          hrubka: '150 mm',
          rozmerPanelu: '1200 × 2500 mm',
          hmotnost: 'približne 24 kg/m²',
          material: 'PIR pena s ochrannou vrstvou',
          nosnost: '≥ 200 kg/m²',
          triedaPoziarnejOdpornosti: 'C-s3, d0',
          lambda: '0,024 W/(m·K)',
        }),
        benefits: JSON.stringify([
          'Pochôdzna vrstva pre bezpečný prechod',
          'Vysoká nosnosť ≥ 200 kg/m²',
          'Rýchla suchá montáž bez mokrých procesov',
          'Ideálny pre skladovacie priestory na podkroví',
          'Výrazne znižuje tepelné straty cez strop',
          'Jednoduchá pokládka a spojenie panelov',
        ]),
        metaTitle: 'LINITHERM PHW – Pochôdzny izolačný prvok pre podlahu | LINZMEIER SK',
        metaDescription: 'LINITHERM PHW je pochôdzny izolačný prvok pre podlahy nevykurovaného podkrovia. Vysoká nosnosť a ľahká montáž pre komfortnú izoláciu.',
        suitableFor: JSON.stringify([
          'Nevykurované podkrovia rodinných domov',
          'Skladovacie priestory',
          'Podlahy nad garážami',
          'Rekonštrukcie podláh',
          'Stropy medzi obytnými a neobývanými priestormi',
        ]),
        sortOrder: 9,
      },
      {
        slug: 'liniherm-pmv',
        name: 'LINITHERM PMV',
        category: 'podlaha',
        shortDesc: 'Panel pre tepelnú izoláciu pod cementové a anhydritové potery – vysoká odolnosť a dlhodobá stabilita.',
        description: `LINITHERM PMV je tepelnoizolačný panel určený pre montáž pod cementové a anhydritové potery v podlahových konštrukciách. Vďaka vysokému tlakovému odporu znesie zaťaženie potery a nábytku bez trvalej deformácie, čo zabezpečuje dlhodobú stabilitu tepelnej izolácie podlahy.

Panel je ideálny pre novostavby rodinných domov, bytových domov a komerčných budov, kde sa vyžaduje vynikajúca tepelná izolácia podlahy v spojení s vysokou mechanickou odolnosťou. Je vhodný aj pre podlahové kúrenie, kde zabezpečuje rovnomerné rozloženie tepla a minimalizuje tepelné straty smerom dole.

Montáž LINITHERM PMV je jednoduchá – panely sa pokladajú na rovnú podložku, vzájomne spoja a následne sa na ne naleje poter. Sú kompatibilné s bežnými systémami podlahového kúrenia a s rôznymi typmi nášľapných vrstiev. Spĺňajú prísne európske normy pre podlahové konštrukcie.`,
        specs: JSON.stringify({
          tepelnyOdpor: '3,80 (m²·K)/W',
          hrubka: '140 mm',
          rozmerPanelu: '1200 × 2500 mm',
          hmotnost: 'približne 22 kg/m²',
          material: 'PIR pena s obojstrannou úpravou',
          tlakovaPevnost: '≥ 300 kPa',
          triedaPoziarnejOdpornosti: 'D-s2, d0',
          lambda: '0,023 W/(m·K)',
          kompatibilita: 'Cementové a anhydritové potery',
        }),
        benefits: JSON.stringify([
          'Vysoká tlaková pevnosť ≥ 300 kPa',
          'Kompatibilný s cementovými a anhydritovými potermi',
          'Ideálny pre podlahové kúrenie',
          'Dlhodobá stabilita bez trvalej deformácie',
          'Minimalizuje tepelné straty smerom dole',
          'Spĺňa európske normy pre podlahové konštrukcie',
        ]),
        metaTitle: 'LINITHERM PMV – Panel pod poter pre podlahu | LINZMEIER SK',
        metaDescription: 'LINITHERM PMV je panel pre tepelnú izoláciu pod cementové a anhydritové potery. Vysoká odolnosť, ideálny pre podlahové kúrenie.',
        suitableFor: JSON.stringify([
          'Novostavby rodinných domov',
          'Bytové domy',
          'Komerčné budovy',
          'Podlahy s podlahovým kúrením',
          'Priemyselné objekty s vysokým zaťažením',
        ]),
        sortOrder: 10,
      },
    ]

    for (const product of products) {
      await db.product.create({
        data: {
          ...product,
          status: 'PUBLISHED',
          imageUrl: null,
        },
      })
    }
    console.log(`[seed-linitherm] Created ${products.length} specific products`)

    const totalCreated = categories.length + products.length
    console.log(`[seed-linitherm] Done – ${totalCreated} products total`)

    return NextResponse.json({
      success: true,
      message: `Seed completed: ${categories.length} categories + ${products.length} products created`,
      categories: categories.length,
      products: products.length,
      total: totalCreated,
    })
  } catch (error) {
    console.error('[seed-linitherm] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Seed failed – see server logs' },
      { status: 500 },
    )
  }
}
