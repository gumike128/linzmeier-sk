**GROQ AI**

**INTEGRÁCNY PROMPT**

\+ UPRAVUJÚCI PROMPT + GITHUB TRANSFER NÁVOD

──────────────────────────────────────────────────

Kompletné prompty pre vytvorenie, úpravu AI nástrojov s GROQ,

prípravu na nasadenie na Vercel a prenos projektu z chat.z.ai na GitHub

*Na základe dokumentácie Vercel Groq Integration, AI SDK 6.x,*

*GitHub Docs a chat.z.ai platformy*

Verzia 3.0 --- Marec 2026

A. Analýza dokumentácie a zdrojov 1

B. Integrácny prompt --- Vytvorenie AI nástrojov s GROQ 2

> B.1 Základná konfigurácia 2
>
> B.2 Chat nástroj 2
>
> B.3 Audio, Vízia, Search, Text nástroje 3

C. Upravujúci prompt --- Finalná úprava a nasadenie na Vercel 3

> C.1 Fáza 1--2: Audit a migrácia na Groq 3
>
> C.2 Fáza 3--5: Vercel konfigurácia, test, nasadenie 4

D. Návod na prenos aplikácie z chat.z.ai na GitHub 4

> D.1 Krok 1 --- Inštalácia a konfigurácia Git a GitHub CLI 5
>
> D.2 Krok 2 --- Inventarizácia a príprava súborov projektu 5
>
> D.3 Krok 3 --- Vytvorenie .gitignore súboru 6
>
> D.4 Krok 4 --- Inicializácia Git repozitára a prvý commit 7
>
> D.5 Krok 5 --- Vytvorenie GitHub repozitára a push 7
>
> D.6 Krok 6 --- Kontrola a verifikácia repozitára 8
>
> D.7 Krok 7 --- Zabezpečenie citlivých údajov 9
>
> D.8 Krok 8 --- .env.example ako šablóna pre deployment 10
>
> D.9 Krok 9 --- Pripojenie na Vercel a nasadenie z GitHub 10

E. Referenčné tabuľky 11

> E.1 Kompletná referencia Groq modelov na Vercel 11
>
> E.2 Groq provider options (AI SDK 6.x) 11

F. Kompletný kontrolný zoznam 12

> F.1 GitHub transfer 12
>
> F.2 Vercel nasadenie s Groq AI 12

*Poznámka: Pre aktualizáciu čísel strán kliknite pravým tlačidlom na
obsah a vyberte „Aktualizovať poľe".*

A. Analýza dokumentácie a zdrojov

Tento dokument vznikol na základe komplexnej analýzy nasledujúcich
zdrojov z dokumentácie Vercel, AI SDK 6.x a GitHub: (a) Vercel Groq
Integration docs --- pôvodná dokumentácia pre pripojenie Groq
poskytovateľa, (b) AI SDK 6.x Groq Provider docs --- referenčná
dokumentácia \@ai-sdk/groq s provider options (reasoningFormat,
serviceTier, structuredOutputs), (c) GitHub Docs --- Adding locally
hosted code to GitHub, Creating a new repository, GitHub CLI, Set up
Git, (d) chat.z.ai --- Z.ai AI chat a agent platforma pre vývoj
aplikácií.

Kľúčové závery: Groq poskytuje cez Vercel plne podporovaný ekosystém AI
modelov s vysokou rýchosťou. Aplikácie vyvinuté prostredníctvom
chat.z.ai je možné preniesť na GitHub pomocou lokálneho Git repozitára a
GitHub CLI (gh) alebo cez GitHub web UI. Pre bezpečný a úplný transfer
je kľúčité zachovať štruktúru projektu, .gitignore, všetky asset-y
(obrázky, fonty, config súbori) a citlivo nastavené súbori (.env, API
keys).

B. Integrácny prompt --- Vytvorenie AI nástrojov s GROQ

B.1 Základná konfigurácia

**┌── PROMPT: ZÁKLADNÁ KONFIGURÁCIA ──**

> Chcem vytvoriť a upraviť všetky AI nástroje v mojej aplikácii tak, aby
> používali GROQ AI infraštruktúru. Aplikácia je Next.js (App Router) s
> TypeScript. Postupuj presne podľa nasledujúcich požiadaviek:
>
> **Inštalácia:** Nainštaluj \@ai-sdk/groq a ai (verzia 6.x+) ako
> produkčné závislosti.
>
> **Auth:** Nastav GROQ_API_KEY v .env.local. Získaš z Vercel Dashboard
> \> AI \> Groq alebo console.groq.com.
>
> **Central config:** Vytvor lib/groq-config.ts s createGroq()
> inštanciou, definíciou modelov a helper funkciami.
>
> **Server-only:** Všetky AI operácie BEŽIA na server-side (API routes /
> Server Actions).

**└── KONIEC PROMPTU ──**

B.2 Chat nástroj

**┌── PROMPT: CHAT NÁSTROJ ──**

> **Endpoint:** app/api/chat/route.ts s streamText(). maxDuration = 30.
>
> **Modely:** llama-3.3-70b-versatile (komplexné) / llama-3.1-8b-instant
> (rýchle).
>
> **Options:** providerOptions: { groq: { reasoningEffort: \'default\',
> parallelToolCalls: true, serviceTier: \'auto\' } }
>
> **Funkcie:** System prompt, konverzačná pamäť (128K), tool calling.

**└── KONIEC PROMPTU ──**

B.3 Audio, Vízia, Search, Text nástroje

**┌── PROMPT: OSTATNÉ AI NÁSTROJE ──**

> **Audio (ASR):** app/api/transcribe/route.ts ---
> whisper-large-v3-turbo, FormData, 99 jazykov, real-time streaming.
>
> **Vízia:** app/api/vision/route.ts ---
> meta-llama/llama-4-scout-17b-16e-instruct (natívne multimodálny,
> text+obrázok).
>
> **Web Search:** app/api/search/route.ts --- RAG vzor s tool calling,
> citácie zdrojov.
>
> **Text gen:** app/api/generate/route.ts --- generateText(),
> summarize=llama-3.3-70b, simple=llama-3.1-8b, reasoning=qwen-qwq-32b,
> Zod structured outputs.
>
> **Error handling:** Fallback chain, rate limiting, caching (Vercel KV
> / Redis), monitoring, graceful degradation.

**└── KONIEC PROMPTU ──**

C. Upravujúci prompt --- Finalná úprava a nasadenie na Vercel

C.1 Fáza 1--2: Audit a migrácia na Groq

**┌── PROMPT: AUDIT A MIGRÁCIA NA GROQ ──**

> Prehľadaj celú kódovú bázu a identifikuj VŠETKY AI/LLM komunikácie.
> Zamením importy a modely podľa nasledujúcej mapy:

-   openai (GPT-4o) → groq(\'llama-3.3-70b-versatile\')

-   openai (GPT-4o-mini) → groq(\'llama-3.1-8b-instant\')

-   anthropic (Claude) → groq(\'qwen-qwq-32b\') alebo
    groq(\'llama-3.3-70b-versatile\')

-   o1/o3 reasoning → groq(\'qwen-qwq-32b\') /
    groq(\'deepseek-r1-distill-llama-70b\')

-   GPT-4 Vision / Claude Vision →
    groq(\'meta-llama/llama-4-scout-17b-16e-instruct\')

-   OpenAI Whisper → groq(\'whisper-large-v3-turbo\')

> Pridaj providerOptions: { groq: { reasoningEffort, structuredOutputs,
> strictJsonSchema, parallelToolCalls, serviceTier: \'auto\' } } podľa
> Sekcie E.

**└── KONIEC PROMPTU ──**

C.2 Fáza 3--5: Vercel konfigurácia, test, nasadenie

**┌── PROMPT: VERCEL NASADENIE ──**

> **Env vars:** GROQ_API_KEY v .env.local LOKÁLNE + na Vercel Dashboard
> (Production). Označ ako Sensitive.
>
> **maxDuration:** export const maxDuration = 30 na každom API route s
> Groq volaním.
>
> **Build:** Ubezpeč, že žiadne client-side AI importy niesú v bundle.
> Build nesmie obsahovať API keys.
>
> **Preview:** Nasaď na Vercel (git push). Otestuj VŠETKY AI nástroje v
> Preview prostredí.
>
> **Production:** Promote do Production. Aktivuj monitoring a alert-y
> pre AI error rates \> 5%.

**└── KONIEC PROMPTU ──**

D. Návod na prenos aplikácie z chat.z.ai na GitHub

Táto sekcia poskytuje prehľadný, krok-za-krokom návod na prenos
kompletnéj aplikácie vyvinutej prostredníctvom chat.z.ai na GitHub
repozitár. Návod pokrýva celý životný cyklus: od identifikácie všetkých
súborov projektu, cez prípravu lokálneho Git repozitára, až po
vytvorenie GitHub repozitára a push celého projektu.

Kontext platformy chat.z.ai: Aplikácie vyvinuté prostredníctvom
chat.z.ai základne bežia v lokálnom vývojom prostredí (pracovný adresár
projektu na disku). Všetky súbory --- zdrojový kód, konfiguračné súbori,
obrázky, fonty, asset-y a content --- sú uložené v štruktúre adresárov
projektu. Na prenos na GitHub je potrebné tieto súbory zabalitť do Git
repozitára a nahráť na GitHub. Nasledujúci návod predpokladá, že máš
prístup k súborom projektu v lokálnom adresári (napr.
/home/z/my-project/ alebo iný cesta, kde sa projekt nachádza).

D.1 Krok 1 --- Inštalácia a konfigurácia Git a GitHub CLI

**KROK 1: Inštalácia a konfigurácia Git a GitHub CLI**

> **Git:** Stiahni a nainštaluj Git z git-scm.com. Pre overenie spusti:
> git \--version
>
> **GitHub CLI:** Stiahni a nainštaluj GitHub CLI (gh) z cli.github.com.
> Pre overenie spusti: gh \--version
>
> **Authentifikácia:** Prihlás sa do GitHub cez CLI: gh auth login.
> Postupuj podľa interaktívnych promptov (vyber HTTPS alebo SSH).
>
> **Git config:** Nastav svoje meno a email:
>
> git config \--global user.name \"Tvoje Meno\"
>
> git config \--global user.email \"tvoj@email.com\"

D.2 Krok 2 --- Inventarizácia a príprava súborov projektu

**KROK 2: Inventarizácia a príprava súborov projektu**

> Pred vytvorením Git repozitára je kľúčité dôkladne preveriť všetky
> súbory v projekte, aby sa na GitHub nedostali citlivé údaje a aby
> repozitár bol čistý a profesionálny.
>
> **Prehľad projektu:** Otvor terminál a prejdi štruktúru projektu.
> Zobraz zoznam všetkých súborov:
>
> cd /cesta/k/projektu
>
> \# Zobrazí štruktúru adresárov
>
> find . -maxdepth 3 -type f \| head -50
>
> \# Alebo detailnejšie
>
> ls -laR
>
> **Identifikuj typy súborov:** Zaznamenaj, aké typy súborov projekt
> obsahuje:

-   Zdrojový kód: .ts, .tsx, .js, .jsx, .py, .json

-   Konfigurácia: package.json, tsconfig.json, next.config.js, .env\*,
    vercel.json

-   Asset-y: obrázky (.png, .jpg, .svg, .ico, .webp), fonty (.ttf,
    .woff2), ikony

-   Content: .md, .txt, .csv, .pdf, .docx, .html

-   Štyly: .css, .scss, .less, Tailwind config

-   Databáza: .prisma, .sql, migračné súbori

> **Citlivé súbory:** Zabezpeč, aby nasledujúce súbori NEBOLI
> commitované do Git repozitára (obsahujú API keys, heslá, tajomstvá):

-   .env, .env.local, .env.production, .env.\*.local

-   \*.key, \*.pem, certifikáty

-   Súbori s hardcoded API keys v zdrojovom kóde

D.3 Krok 3 --- Vytvorenie .gitignore súboru

**KROK 3: Vytvorenie .gitignore súboru**

> Súbor .gitignore definuje, ktoré súbory a adresáre Git má ignorovať
> pri commitovani. Toto je kritické pre bezpečnosť a čistotu repozitára.
>
> **Vytvor .gitignore:** V koreňovom adresári projektu vytvor .gitignore
> s nasledujúcim obsahom:
>
> \# ===== Dependencies =====
>
> node_modules/
>
> .pnp
>
> .pnp.js
>
> \# ===== Build output =====
>
> .next/
>
> out/
>
> dist/
>
> build/
>
> \# ===== Environment variables (CRITICAL!) =====
>
> .env
>
> .env.local
>
> .env.development.local
>
> .env.test.local
>
> .env.production.local
>
> \# ===== Debug logs =====
>
> npm-debug.log\*
>
> yarn-debug.log\*
>
> yarn-error.log\*
>
> \# ===== IDE / Editor =====
>
> .vscode/
>
> .idea/
>
> \*.swp
>
> \*.swo
>
> \*\~
>
> \# ===== OS generated =====
>
> .DS_Store
>
> Thumbs.db
>
> \# ===== Vercel =====
>
> .vercel/
>
> \# ===== AI / API keys (CRITICAL!) =====
>
> \*-api-key\*
>
> \*secret\*
>
> \*.key
>
> \*.pem
>
> \# ===== Large binary files (use Git LFS if needed) =====
>
> \*.mp4
>
> \*.zip
>
> \*.tar.gz

D.4 Krok 4 --- Inicializácia Git repozitára a prvý commit

**KROK 4: Inicializácia Git repozitára a prvý commit**

> **Init:** V koreňovom adresári projektu inicializuj Git repozitár:
>
> git init -b main
>
> **Add:** Pridaj všetky súbori (Git automaticky rešpektuje .gitignore):
>
> git add .
>
> **Over:** Skontroluj, če súbori boli správne pridané:
>
> git status
>
> **Commit:** Vytvor prvý commit:
>
> git commit -m \"Initial commit: aplikácia z chat.z.ai\"

D.5 Krok 5 --- Vytvorenie GitHub repozitára a push

**KROK 5: Vytvorenie GitHub repozitára a push**

> Máš dve možnosti: použiť GitHub CLI (odporúčané, rýchlejšie) alebo
> GitHub web UI (manuálne).

Možnosť A: GitHub CLI (odporúčané)

> **Jeden príkaz:** Vytvor repozitár a pushni kód jedným príkazom:
>
> gh repo create meno-projektu \--source=. \--public \--push
>
> **Alebo:** Ak chceš privátny repozitár:
>
> gh repo create meno-projektu \--source=. \--private \--push
>
> **Organizácia:** Ak vytváraš pre organizáciu:
>
> gh repo create organizacia/meno-projektu \--source=. \--public \--push

Možnosť B: Manuálne cez GitHub web UI

> **1.** Prejdi na github.com/new a prihlas sa.
>
> **2.** Vyplň: Repository name, Description (voliteľne), Visibility
> (Public/Private). NEZAKRTNI žiadne inicializačné možnosti (README,
> .gitignore, License) --- máš už lokálny repozitár.
>
> **3.** Klikni Create repository.
>
> **4.** Po vytvorení sleduj inštrukcie na stránke:
>
> git remote add origin https://github.com/POUZIVATEL/MENO-PROJEKTU.git
>
> git branch -M main
>
> git push -u origin main

D.6 Krok 6 --- Kontrola a verifikácia repozitára

**KROK 6: Kontrola a verifikácia repozitára**

> **Prehľad:** Po pushnutí otvor repozitár na github.com a skontroluj:

-   Všetky zdrojové súbori sú nahrané a čitateľné.

-   Obrázky, ikony a ostatné asset-y sú viditeľné.

-   Konfiguračné súbori (package.json, tsconfig.json) sú prítomné.

-   .env súbori a citlivé údaje NEBOLI nahrané.

-   .gitignore je viditeľný v repozitári.

> **README.md:** Ak ho ešte nemáš, vytvor README.md s popisom projektu:
>
> echo \"# Názov Projektu\" \> README.md
>
> git add README.md && git commit -m \"Add README\" && git push
>
> **Základné súbory pre Next.js:** Ubezpeč, že repozitár obsahuje
> minimálne tieto súbori pre úspešný build (pozri tabuľku 1 nižšie).

  -----------------------------------------------------------------------
  **Súbor / Adresár** **Popis**                         **Nutnosť**
  ------------------- --------------------------------- -----------------
  package.json        Závislosti projektu a skripty     Kritický

  tsconfig.json       TypeScript konfigurácia           Kritický

  next.config.\*      Next.js konfigurácia              Kritický

  app/ alebo pages/   Routy aplikácie                   Kritický

  public/             Statické asset-y (obrázky,        Kritický
                      favicon, fonty)                   

  .gitignore          Ignorované súbori (env,           Kritický
                      node_modules)                     

  .env.example        Príklad environment premenných    Veľmi odporúčané
                      (bez hodnôt)                      

  README.md           Dokumentácia projektu             Odporúčané

  lib/                Pomocné funkcie a konfigurácia    Podľa projektu
                      (napr. groq-config.ts)            

  styles/             Globálne štýly a CSS              Podľa projektu
  -----------------------------------------------------------------------

*Tabuľka 1: Základné súbory pre Next.js projekt na GitHub*

D.7 Krok 7 --- Zabezpečenie citlivých údajov

**KROK 7: Zabezpečenie citlivých údajov a .env.example**

> Po vytvorení repozitára je kľúčité zabezpečiť, že citlivé údaje nie sú
> dostupné v repozitári. Následujúce kroky sú nevyhnutné.
>
> **Skontroluj .env:** Over, že .env súbori nie sú v Git trackingu:
>
> git ls-files \| grep \"\\.env\"
>
> **Ak nájdeš .env v trackingu:** Odstráň ich z Gitu (súbor ostané na
> disku, len sa nebudú trackovať):
>
> git rm \--cached .env.local
>
> git rm \--cached .env.production.local
>
> git commit -m \"Remove env files from tracking\"
>
> **.env.example:** Vytvor .env.example s NAZVAMI premenných (bez
> hodnôt) ako dokumentáciu pre ostatných vývojárov:
>
> \# Groq AI
>
> GROQ_API_KEY=
>
> \# Aplikácia
>
> NEXT_PUBLIC_APP_URL=
>
> DATABASE_URL=
>
> \# Vercel
>
> VERCEL_TOKEN=
>
> **GitHub Secrets:** Pre CI/CD pipeline nastav secret-y cez GitHub:
>
> gh secret set GROQ_API_KEY
>
> \# Alebo cez GitHub web UI: Settings \> Secrets and variables \>
> Actions

D.8 Krok 8 --- .env.example ako šablóna pre deployment

**KROK 8: Nastavenie environment premenných na cieľových platformách**

> Po nasadení repozitára na GitHub je možné ho pripojiť na rôzne
> platformy. Pozri tabuľku 2 nižšie.

  -----------------------------------------------------------------------
  **Platforma**    **Kde nastaviť premenné**       **Spôsob**
  ---------------- ------------------------------- ----------------------
  Vercel           Dashboard \> Project \>         Web UI alebo vercel
                   Settings \> Environment         env CLI
                   Variables                       

  GitHub           Repository \> Settings \>       Web UI
  Codespaces       Codespaces \> Secrets           

  GitHub Actions   Repository \> Settings \>       Web UI alebo gh secret
  CI/CD            Secrets \> Actions              set

  Lokálne vývoj    .env.local v koreňovom adresári Manuálne v súbori
                   (NE commitnuť!)                 

  Docker           docker-compose.yml alebo docker Konfiguračné súbori
  deployment       run -e flagy                    
  -----------------------------------------------------------------------

*Tabuľka 2: Nastavenie environment premenných na platformách*

D.9 Krok 9 --- Pripojenie na Vercel a nasadenie z GitHub

**KROK 9: Pripojenie GitHub repozitára na Vercel**

> **Import:** Prejdi na vercel.com/new a vyber Import Git Repository.
>
> **Connect:** Vyber svoj GitHub repozitár. Ak ho nevidíš, klikni Adjust
> GitHub App Permissions.
>
> **Config:** Framework Preset: Next.js (automaticky detekovaný). Root
> Directory: ./ alebo pods­resar ak je monorepo.
>
> **Env vars:** Pridaj GROQ_API_KEY a ostatné premenné z .env.example.
>
> **Deploy:** Klikni Deploy. Po úspešnom buildi Vercel poskytne
> produkčné URL.
>
> **Automatic deploys:** Vercel automaticky redeployne pri každom push-i
> do GitHub main vetvy.

E. Referenčné tabuľky

E.1 Kompletná referencia Groq modelov na Vercel

  -----------------------------------------------------------------------------------------
  **Model ID**                       **Typ**      **Schopnosti**       **Použitie**
  ---------------------------------- ------------ -------------------- --------------------
  llama-3.3-70b-versatile            Chat         128K kontext, tool   Hlavný chatbot,
                                                  use                  sumarizácia

  llama-3.1-8b-instant               Chat         Rýchla inferencia    Jednoduché odpovede,
                                                                       klasifikácia

  meta-llama/llama-4-scout-17b-16e   Multimodal   Text + obrázok       Vízia, image
                                                                       understanding

  deepseek-r1-distill-llama-70b      Reasoning    Logické uvažovanie   Matematika, analýza

  qwen-qwq-32b                       Reasoning    Reasoning, tool use  Komplexné reasoning

  qwen/qwen3-32b                     Reasoning    Reasoning effort     Tunable reasoning
                                                  control              

  gemma2-9b-it                       Chat         Kompaktný, rýchly    Jednoduché
                                                                       generovanie

  whisper-large-v3-turbo             Audio        99 jazykov, ASR      Audio prepis
                                                                       (default)

  whisper-large-v3                   Audio        Max presnosť         Kritická presnosť
  -----------------------------------------------------------------------------------------

*Tabuľka 3: Groq modely dostupné cez Vercel*

E.2 Groq provider options (AI SDK 6.x)

  -------------------------------------------------------------------------------
  **Option**          **Typ**             **Default**   **Popis**
  ------------------- ------------------- ------------- -------------------------
  reasoningFormat     parsed \| raw \|    ---           Formát reasoning-u (len
                      hidden                            reasoning modely)

  reasoningEffort     low \| medium \|    default       Úroveň reasoning snahy
                      high \| none                      

  structuredOutputs   boolean             true          Spoľahlivé JSON výstupy

  strictJsonSchema    boolean             true          Garantovaná JSON validita

  parallelToolCalls   boolean             true          Paralelné volanie
                                                        nástrojov

  serviceTier         on_demand \| flex   on_demand     flex = 10x rate limity
                      \| auto                           
  -------------------------------------------------------------------------------

*Tabuľka 4: Groq provider options*

F. Kompletný kontrolný zoznam pre Vercel nasadenie + GitHub

Nasledujúci zoznam kontrol pokrýva obe čiasti procesu --- GitHub
transfer aj Vercel nasadenie s Groq AI.

F.1 GitHub transfer

-   Git a GitHub CLI sú nainštalované a nakonfigurované.

-   gh auth login prebehol úspešne.

-   git config \--global user.name a user.email sú nastavené.

-   .gitignore obsahuje: node_modules/, .next/, .env\*, .vercel/,
    .DS_Store.

-   Žiadne .env súbori s API keys sú v Git trackingu (over: git ls-files
    \| grep env).

-   .env.example existuje s názvami premenných (bez hodnôt).

-   git init -b main, git add ., git commit prebehli bez chýb.

-   GitHub repozitár bol vytvorený (cez gh repo create alebo web UI).

-   git push -u origin main prebehol úspešne.

-   Všetky súbori (kód, obrázky, config) sú viditeľné na GitHub.

-   README.md existuje s popisom projektu.

-   GitHub Secrets sú nastavené pre CI/CD (gh secret set GROQ_API_KEY).

F.2 Vercel nasadenie s Groq AI

-   GROQ_API_KEY je nastavená na Vercel (Production + Preview +
    Development).

-   \@ai-sdk/groq a ai sú v package.json s fixovanými verziami.

-   Všetky AI nástroje používajú Groq provider --- žiadne zvyšky
    openai/anthropic.

-   Každý API route má maxDuration = 30+ a serviceTier: \'auto\'.

-   Structured outputs s Zod schémami sú implementované.

-   Error handling zachytáva Groq API chyby.

-   Streaming (streamText + toDataStreamResponse) funguje cez Vercel
    CDN.

-   Build logy neobsahujú žiadne AI chyby ani varovania.

-   Preview deploy na Vercel prešiel --- všetky AI nástroje fungujú.

-   Production deploy je aktívny s monitoringom a alertami.
