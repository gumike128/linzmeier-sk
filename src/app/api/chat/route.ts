import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const chatSchema = z.object({
  message: z
    .string()
    .min(1, 'Správa nesmie byť prázdna')
    .max(1000, 'Správa nesmie presiahnuť 1000 znakov'),
})

// ─── Knowledge base for fallback responses ────────────────────────────
const KNOWLEDGE: Record<string, string[]> = {
  produkty: [
    'Ponúkame päť hlavných produktových kategórií LINITHERM:\n\n- **Šikmá strecha** — polyuretánové izolačné systémy pre šikmé strechy (PAL N+F, PAL SIL T, PGV T)\n- **Plochá strecha** — systémy pre ploché strechy (PAL 2U, PAL FD, PAL Gefälle)\n- **Izolácia stropu** — stropné izolačné systémy (PAL GK, PAL W)\n- **Prevetrávaná fasáda** — fasádne systémy s prevetrávanou medzerou\n- **Podlaha** — podlahové izolačné systémy (PHW, PMV)',
  ],
  linitherm: [
    'LINITHERM je značka prémiových polyuretánových izolačných systémov od spoločnosti Linzmeier Bauelemente GmbH.\n\n- Výroba v Nemecku od roku 1946\n- 75+ rokov skúseností\n- Rodinná firma vedená treťou generáciou\n- Certifikát pure life pre ekologickú nezávadnosť\n- Dva moderné závody v Nemecku\n- Systémy pokrývajú: strecha, strop, fasáda, podlaha',
  ],
  strecha: [
    'Izolácia strechy LINITHERM — polyuretánové panely pre šikmé aj ploché strechy.\n\n**Šikmá strecha:**\n- PAL N+F — podhľadový panel s foliou\n- PAL SIL T — panel s sklom\n- PGV T — plný panel s minerálnou vatou\n\n**Plochá strecha:**\n- PAL 2U — obústranný panel\n- PAL FD — panel pre plochú strechu\n- PAL Gefälle — panel so sklonom\n\nVšetky systémy ponúkajú vynikajúce tepelno-izolačné vlastnosti a rýchlu montáž bez mokrých procesov.',
  ],
  fasada: [
    'Prevetrávaná fasáda LINITHERM — systémové riešenie pre energo-efektívne fasády.\n\n- S prevetrávacou medzerou pre optimálnu vlhkosťovou reguláciu\n- Polyuretánová izolácia s vynikajúcimi tepelnými vlastnosťami\n- Certifikované podľa európskych noriem\n- Rýchla montáž bez mokrých procesov\n- Dlhá životnosť 50+ rokov',
  ],
  strop: [
    'Izolácia stropu LINITHERM — polyuretánové panely pre stropné konštrukcie.\n\n- **PAL GK** — stropný panel s gipsokartónovou doskou\n- **PAL W** — stropný panel s nadstropným panelom\n\nVýhody: vynikajúce tepelno-izolačné parametre, rýchla montáž, akustická izolácia.',
  ],
  podlaha: [
    'Izolácia podlahy LINITHERM — polyuretánové panely pre podlahové konštrukcie.\n\n- **PHW** — podlahový panel s vysokou nosnosťou\n- **PMV** — panel pre medzipodlahové konštrukcie\n\nVýhody: vysoká tepelná odolnosť, nosnosť, odolnosť voči vlhkosti.',
  ],
  material: [
    'Produkty LINITHERM sú vyrábané z vysokokvalitného polyuretánu (PUR/PIR).\n\n- Vynikajúce tepelno-izolačné vlastnosti (nízky lambda koeficient)\n- Odolnosť voči vlhkosti a biologickým vplyvom\n- Certifikát pure life pre ekologickú nezávadnosť\n- Bez obsahu CFC/HCFC\n- Dlhá životnosť 50+ rokov\n- Výroba v Nemecku s prísnou kontrolou kvality',
  ],
  pure_life: [
    'Certifikát pure life je najvyšší ekologický certifikát pre stavebné materiály.\n\n- Potvrdzuje ekologickú nezávadnosť produktov\n- Bez škodlivých látok a emisií\n- Bez obsahu CFC/HCFC\n- Testované nezávislými laboratóriami\n- Všetky produkty LINITHERM sú certifikované pure life',
  ],
  cena: [
    'Cenová ponuka sa spravuje **individuálne** na základe vášho projektu.\n\nVplyvajú na ňu:\n- typ produktu LINITHERM\n- plocha objektu\n- komplexnosť montáže\n- množstvo materiálu\n\nPre presnú cenovú ponuku nás prosím kontaktujte:\n- E-mail: marian.melis@linzmeier.sk\n- Telefón: +421 903 664 079\n- Alebo vyplňte kontaktný formulár na našej webovej stránke.',
  ],
  montaz: [
    'Ponúkame **suchú montáž** — bez mokrých procesov na stavbe.\n\n- Prefabrikované systémy LINITHERM umožňujú rýchlu inštaláciu\n- Poskytujeme detailné montážne návody pre každý produkt\n- K dispozícii je technická podpora počas celej realizácie\n- Všetky naše systémy sú navrhnuté pre jednoduchú inštaláciu',
  ],
  certifikacie: [
    'Naše produkty LINITHERM sú certifikované podľa najprísnejších európskych noriem:\n\n- **Certifikát pure life** — ekologická nezávadnosť\n- **STN EN 13501-1** — klasifikácia požiarnej odolnosti\n- **CE značka** — zhoda s európskymi smernicami\n- **ISO 9001** — systém manažérstva kvality\n- Všetky technické parametre sú overené a dokumentované',
  ],
  kontakt: [
    'Kontaktujte nás:\n\n- E-mail: marian.melis@linzmeier.sk\n- Telefón: +421 903 664 079\n- Materský web: www.linzmeier.de\n\nAlebo vyplňte kontaktný formulár na našej stránke v sekcii **„Požiadajte o cenovú ponuku"**.',
  ],
  firma: [
    'Linzmeier Bauelemente GmbH je rodinná firma vedená treťou generáciou s **75+ ročnou tradíciou**.\n\n- Založená v roku 1946 v Nemecku\n- Viac ako 5 000 realizovaných projektov\n- Dva moderné závody v Nemecku s prísnou kontrolou kvality\n- Certifikát pure life pre ekologickú nezávadnosť\n- Výroba prémiových polyuretánových izolačných systémov LINITHERM\n- Vstup na slovenský trh v roku 2020',
  ],
  garantia: [
    'Naše produkty LINITHERM ponúkajú dlhú životnosť a spoľahlivosť:\n\n- **50+ rokov** životnosti polyuretánových izolačných panelov\n- Certifikát pure life pre ekologickú nezávadnosť\n- Záruka na štruktúrne prvky systému\n- Certifikované materiály s overenými technickými parametrami\n- Pravidelná technická podpora a konzultácie',
  ],
}

// ─── Simple keyword matching for fallback ──────────────────────────────
function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase()

  // Direct keyword matches
  for (const [keywords, responses] of Object.entries(KNOWLEDGE)) {
    for (const kw of keywords.split(',')) {
      if (lower.includes(kw.trim())) {
        return responses.join('\n')
      }
    }
  }

  // Greeting patterns
  if (/^(ahoj|dobrý|čau|hello|hi|good morning|dobrý deň|vitaj)/i.test(lower)) {
    return 'Dobrý deň! Vitajte na LINZMEIER. Som tu, aby som vám pomohol s informáciami o produktoch LINITHERM. Môžete sa ma opýtať na:\n\n- **Produkty** — strecha, strop, fasáda, podlaha\n- **Cenové ponuky** — individuálne kalkulácie pre váš projekt\n- **Technické parametre** — certifikácie, montážne postupy\n- **Kontakt** — marian.melis@linzmeier.sk alebo +421 903 664 079\n\nČo vás zaujíma?'
  }

  // Thank you
  if (/^(ďakujem|ďakujem|vďaka|thanks|thx)/i.test(lower)) {
    return 'Nemáte za čo! Ak by ste mali ďalšie otázky, som tu pre vás. Neváhajte sa opýtať.'
  }

  // Availability/request
  if (/chcem|potrebujem|mám záujem|chcel by som|hľadám/i.test(lower)) {
    return 'Radi vám pomôžeme! Pre lepšie vybavenie vašej požiadavky nás prosím kontaktujte:\n\n- E-mail: marian.melis@linzmeier.sk\n- Telefón: +421 903 664 079\n- Alebo vyplňte formulár na našej stránke v sekcii **„Požiadajte o cenovú ponuku"**\n\nNaši odborníci odpovú zvyčajne do 24 hodín.'
  }

  // Default fallback
  return 'Ďakujem za vašu otázku. Aby som vám mohol poskytnúť čo najpresnejšiu odpoveď, odporúčam kontaktovať našich odborníkov priamo:\n\n- **E-mail:** marian.melis@linzmeier.sk\n- **Telefón:** +421 903 664 079\n- **Kontaktný formulár:** vyplňte ho na našej stránke v sekcii „Požiadajte o cenovú ponuku"\n\nOdpovieme zvyčajne do 24 hodín. Môžete sa ma tiež opýtať na konkrétne produkty LINITHERM, technické parametre alebo certifikácie.'
}

// ─── Try AI with fallback ────────────────────────────────────────────────
async function getAIResponse(message: string): Promise<string> {
  try {
    // Dynamic import to handle missing SDK gracefully
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()

    // Fetch product context from DB
    const products = await db.product.findMany({
      where: { status: 'PUBLISHED' },
      select: { name: true, shortDesc: true, category: true },
    })

    const context = products.map(p => `- ${p.name}: ${p.shortDesc || 'Žiadny popis'} (kategória: ${p.category})`).join('\n')

    const systemPrompt = `Si odborný asistent spoločnosti Linzmeier Bauelemente GmbH. Odpovedaj vždy po slovensky. Buď stručný, presný a profesionálny.

O spoločnosti:
- Linzmeier Bauelemente GmbH, založená 1946 v Nemecku
- Rodinná firma vedená treťou generáciou
- 75+ rokov skúseností, 5000+ projektov
- Dva moderné závody v Nemecku
- Certifikát pure life pre ekologickú nezávadnosť

Produkty LINITHERM:
${context}

Päť hlavných kategórií:
1. Šikmá strecha: PAL N+F, PAL SIL T, PGV T
2. Plochá strecha: PAL 2U, PAL FD, PAL Gefälle
3. Izolácia stropu: PAL GK, PAL W
4. Prevetrávaná fasáda
5. Podlaha: PHW, PMV

Kontakt: marian.melis@linzmeier.sk, +421 903 664 079, www.linzmeier.de

Pravidlá:
- Ak nevieš odpoveď, navrhni kontakt: marian.melis@linzmeier.sk alebo +421 903 664 079
- Nikdy nevymýšľaj technické parametre, ktoré nemáš v dátach
- Pri cenových otázkach odkaz na formulár pre cenovú ponuku
- Používaj Markdown formátovanie pre prehľadnosť (tučné **text**, zoznamy s -)
- Odpovedaj stručne, max 3-4 vety`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: message },
      ],
      thinking: { type: 'disabled' },
    })

    const response = completion.choices[0]?.message?.content
    if (response && response.trim().length > 0) {
      // Log successful AI interaction
      await db.aIInteraction.create({
        data: {
          type: 'chatbot',
          input: message,
          output: response,
          model: 'z-ai-chat',
          userId: 'anonymous',
          durationMs: 0,
        },
      }).catch(() => {})
      return response
    }
  } catch (err) {
    console.error('[Chat API] AI service unavailable, using fallback:', err instanceof Error ? err.message : String(err))
  }

  // Fallback to local knowledge base
  return getFallbackResponse(message)
}

// ─── Route handler ─────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = chatSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Neplatné údaje', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { message } = parsed.data
    const response = await getAIResponse(message)

    return NextResponse.json({ response })
  } catch (error) {
    console.error('[Chat API] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri spracovaní vašej správy. Skúste to prosím neskôr.' },
      { status: 500 },
    )
  }
}
