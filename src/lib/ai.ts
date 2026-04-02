import ZAI from 'z-ai-web-dev-sdk'
import { db } from './db'

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getZai() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

// ─── Knowledge base for fallback ───────────────────────────────────────
const KNOWLEDGE: Record<string, string[]> = {
  produkty: [
    'Ponúkame päť hlavných produktových kategórií LINITHERM: šikmá strecha, plochá strecha, izolácia stropu, prevetrávaná fasáda, podlaha.',
  ],
  linitherm: [
    'LINITHERM je značka prémiových polyuretánových izolačných systémov od Linzmeier Bauelemente GmbH. Výroba v Nemecku od roku 1946, 75+ rokov skúseností, certifikát pure life.',
  ],
  strecha: [
    'LINITHERM systémy pre strechy: šikmá strecha (PAL N+F, PAL SIL T, PGV T), plochá strecha (PAL 2U, PAL FD, PAL Gefälle). Polyuretánová izolácia s vynikajúcimi tepelnými vlastnosťami.',
  ],
  fasada: [
    'Prevetrávaná fasáda LINITHERM — systémové riešenie s prevetrávacou medzerou pre optimálnu vlhkosťovú reguláciu a energetickú efektívnosť.',
  ],
  strop: [
    'Izolácia stropu LINITHERM: PAL GK (s gipsokartónovou doskou), PAL W (s nadstropným panelom). Vynikajúce tepelno-izolačné parametre a akustická izolácia.',
  ],
  podlaha: [
    'Izolácia podlahy LINITHERM: PHW (podlahový panel s vysokou nosnosťou), PMV (panel pre medzipodlahové konštrukcie). Vysoká tepelná odolnosť.',
  ],
  material: [
    'Produkty LINITHERM sú vyrábané z vysokokvalitného polyuretánu (PUR/PIR). Certifikát pure life, bez CFC/HCFC, dlhá životnosť 50+ rokov.',
  ],
  pure_life: [
    'Certifikát pure life potvrdzuje ekologickú nezávadnosť produktov LINITHERM. Bez škodlivých látok, testované nezávislými laboratóriami.',
  ],
  cena: [
    'Cenová ponuka individuálne. Kontakt: marian.melis@linzmeier.sk alebo +421 903 664 079.',
  ],
  montaz: [
    'Suchá montáž bez mokrých procesov s detailnými montážnymi návodmi a technickou podporou pre všetky LINITHERM systémy.',
  ],
}

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase()
  for (const [keywords, responses] of Object.entries(KNOWLEDGE)) {
    for (const kw of keywords.split(',')) {
      if (lower.includes(kw.trim())) {
        return responses[0]
      }
    }
  }
  return 'Pre presnejšie informácie kontaktujte našich odborníkov na marian.melis@linzmeier.sk alebo +421 903 664 079.'
}

// ─── Public chatbot query ────────────────────────────────────────────────
export async function chatbotQuery(message: string): Promise<string> {
  const startTime = Date.now()

  try {
    const zai = await getZai()

    const products = await db.product.findMany({
      where: { status: 'PUBLISHED' },
      select: { name: true, shortDesc: true, category: true, specs: true },
    })

    const context = `Produkty:\n${JSON.stringify(products)}`

    const systemPrompt = [
      'Si odborny asistent spolocnosti Linzmeier Bauelemente GmbH. Odpovedaj vzdy po slovensky. Bud strucny, presny a profesionalny.',
      '',
      'O spolocnosti:',
      '- Linzmeier Bauelemente GmbH, zalozena 1946 v Nemecku',
      '- Rodinna firma vedena tretou generaciou',
      '- 75+ rokov skusenosti, 5000+ projektov',
      '- Dva moderne zavody v Nemecku',
      '- Certifikat pure life pre ekologicku nezavadnost',
      '',
      'Tvoje znalosti o produktoch LINITHERM:',
      '- Strecha (sikma): PAL N+F, PAL SIL T, PGV T',
      '- Strecha (plocha): PAL 2U, PAL FD, PAL Gefalle',
      '- Strop: PAL GK, PAL W',
      '- Fasada: prevetravana fasada',
      '- Podlaha: PHW, PMV',
      '- Material: polyuretan (PUR/PIR), certifikat pure life',
      '',
      'Kontakt: marian.melis@linzmeier.sk, +421 903 664 079, www.linzmeier.de',
      '',
      'Pravidla:',
      '- Ak nevidies odpoved, navrhni kontakt: marian.melis@linzmeier.sk alebo +421 903 664 079',
      '- Nikdy nevymyslaj technicke parametre, ktore nemas v datach',
      '- Pri cenovych otazkach odkaz na formular pre cenovu ponuku',
    ].join('\n')

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt + '\n\n' + context },
        { role: 'user', content: message },
      ],
      thinking: { type: 'disabled' },
    })

    const response = completion.choices[0]?.message?.content ?? ''
    const durationMs = Date.now() - startTime

    if (response.trim().length > 0) {
      await db.aIInteraction.create({
        data: {
          type: 'chatbot',
          input: message,
          output: response,
          model: 'z-ai-chat',
          userId: 'anonymous',
          durationMs,
        },
      }).catch(() => {})

      return response
    }

    // AI returned empty — use fallback
    console.error('[AI] chatbotQuery: AI returned empty response, using fallback')
    await db.aIInteraction.create({
      data: {
        type: 'chatbot_fallback',
        input: message,
        output: null,
        model: 'z-ai-chat',
        userId: 'anonymous',
        durationMs,
      },
    }).catch(() => {})

    return getFallbackResponse(message)
  } catch (err) {
    console.error('[AI] chatbotQuery error:', err instanceof Error ? err.message : String(err))
    const durationMs = Date.now() - startTime

    await db.aIInteraction.create({
      data: {
        type: 'chatbot_error',
        input: message,
        output: null,
        model: 'z-ai-chat',
        userId: 'anonymous',
        durationMs,
      },
    }).catch(() => {})

    return getFallbackResponse(message)
  }
}

// ─── Admin: suggest reply for lead ──────────────────────────────────────
export async function suggestReply(leadData: {
  name: string
  customerType: string
  projectType: string | null
  message: string
  notes: string[]
}): Promise<string> {
  const zai = await getZai()

  const notesPart = leadData.notes.length > 0
    ? `Predchadzajuce poznamky: ${leadData.notes.join('; ')}`
    : ''

  const prompt = [
    'Navrhni profesionalnu odpoved na dopyt zakaznika.',
    '',
    `Zakaznik: ${leadData.name}`,
    `Typ: ${leadData.customerType}`,
    `Projekt: ${leadData.projectType ?? 'nevedeny'}`,
    `Sprava: ${leadData.message}`,
    notesPart,
    '',
    'Odpovedaj po slovensky, strucne, s produktovym odporucanim LINITHERM a vyzvou na dalsi krok.',
  ].join('\n')

  try {
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: 'Si obchodny asistent Linzmeier Bauelemente GmbH.' },
        { role: 'user', content: prompt },
      ],
      thinking: { type: 'disabled' },
    })

    return completion.choices[0]?.message?.content ?? 'Nepodarilo sa vygenerovat navrh odpovede. Navrhnite odpoved manualne na zaklade informacii o produktovom portfoliu LINITHERM.'
  } catch (err) {
    console.error('[AI] suggestReply error:', err instanceof Error ? err.message : String(err))
    return 'AI sluzba momentalne nie je dostupna. Navrhnite odpoved manualne na zaklade informacii o produktoch a sluzbach Linzmeier Bauelemente GmbH.'
  }
}

// ─── Admin: generate content ────────────────────────────────────────────
export async function generateContent(type: 'blog' | 'product' | 'seo' | 'faq', topic: string, tone: string = 'profesionalny'): Promise<string> {
  const zai = await getZai()

  const prompts: Record<string, string> = {
    blog: `Napis blog clanok na temu: "${topic}". Ton: ${tone}. V slovencine. Obsahuje: titulok, perex, 3-5 odsekov, zaver. Zmien produkty LINITHERM kde je to relevantne.`,
    product: `Napis popis produktu pre B2B stavbny sektor: "${topic}". Ton: ${tone}. Slovenčina. Obsahuje: nazov, kratky popis, 5 benefitov s odrážkami, technické výhody. Zmien LINITHERM system.`,
    seo: `Napis SEO meta udaje pre stranku o: "${topic}". Slovenčina. Vrat: meta title (max 60 znakov), meta description (max 160 znakov), 5 klucovych slov. Zahrn "LINITHERM", "polyuretanova izolacia", "LINZMEIER".`,
    faq: `Vytvor 5 castych otazok a odpovedi na temu: "${topic}" pre B2B stavbny sektor. Slovenčina. Odpovede stručné a faktické. Zahrň informácie o produktoch LINITHERM.`,
  }

  try {
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: 'Si obsahovy marketer pre Linzmeier Bauelemente GmbH. Pisies v slovencine. Zameriavaj sa na produkty LINITHERM a polyuretanovu izolaciu.' },
        { role: 'user', content: prompts[type] ?? prompts.blog },
      ],
      thinking: { type: 'disabled' },
    })

    return completion.choices[0]?.message?.content ?? 'Nepodarilo sa vygenerovat obsah. Skuste to prosim neskor.'
  } catch (err) {
    console.error('[AI] generateContent error:', err instanceof Error ? err.message : String(err))
    const typeLabel = type === 'blog' ? 'blog clanok' : 'obsah'
    return `Nepodarilo sa vygenerovat ${typeLabel} cez AI. Skuste to prosim neskor alebo napiste obsah manualne.`
  }
}
