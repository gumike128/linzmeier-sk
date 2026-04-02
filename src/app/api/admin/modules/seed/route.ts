import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

const DEFAULT_MODULES = [
  {
    slug: 'crm-basic',
    name: 'CRM Basic',
    category: 'crm',
    icon: 'Users',
    price: 0,
    priceLabel: '',
    isFree: true,
    trialDays: 0,
    description: 'Základný CRM pre správu leadov a kontaktov',
    longDescription:
      'Spravujte svoje leady, priraďujte ich obchodníkom a sledujte statusy v jednoduchom pipeline zobrazení.',
    features: ['Správa leadov', 'Základný pipeline', 'Priraďovanie obchodníkov', 'Stavové správy'],
    linkedMenuItems: ['crm-leads'],
    sortOrder: 1,
  },
  {
    slug: 'crm-pro',
    name: 'CRM Pro',
    category: 'crm',
    icon: 'Target',
    price: 49,
    priceLabel: '€49/mesiac',
    isFree: false,
    trialDays: 14,
    description: 'Pokročilý CRM s pipeline zobrazením a automatizáciou',
    longDescription:
      'Pokročilý systém na správu obchodného procesu vrátane Kanban pipeline, lead scoringu a automatických akcií.',
    features: [
      'Kanban Pipeline',
      'Lead Scoring (AI)',
      'Automatizácie',
      'Export dát',
      'Pokročilé filtre',
      'Prípomienky a notifikácie',
    ],
    linkedMenuItems: ['crm-pipeline', 'automations'],
    sortOrder: 2,
  },
  {
    slug: 'cms-basic',
    name: 'CMS Basic',
    category: 'cms',
    icon: 'FileText',
    price: 0,
    priceLabel: '',
    isFree: true,
    trialDays: 0,
    description: 'Základný systém pre správu obsahu a produktov',
    longDescription:
      'Riadenie produktového katalógu, blogu a dokumentov v jednom mieste.',
    features: ['Produktový katalóg', 'Blog', 'Dokumenty', 'Základné SEO'],
    linkedMenuItems: ['products', 'blog', 'documents'],
    sortOrder: 3,
  },
  {
    slug: 'references-manager',
    name: 'Manažér referencií',
    category: 'cms',
    icon: 'Building2',
    price: 29,
    priceLabel: '€29/mesiac',
    isFree: false,
    trialDays: 7,
    description: 'Správa referenčných projektov a realizácií',
    longDescription:
      'Prezentujte vaše realizácie a referenčné projekty s fotogalériou a detailnými popismi.',
    features: ['Referenčné projekty', 'Fotogaléria', 'Kategórie', 'Zobrazenie na webstránke'],
    linkedMenuItems: ['references'],
    sortOrder: 4,
  },
  {
    slug: 'ai-assistant',
    name: 'AI Asistent',
    category: 'ai',
    icon: 'Bot',
    price: 39,
    priceLabel: '€39/mesiac',
    isFree: false,
    trialDays: 14,
    description: 'AI nástroje pre obsahové generovanie a asistenciu',
    longDescription:
      'Využite umelú inteligenciu na generovanie obsahu, návrhy produktov a automatizáciu komunikácie.',
    features: ['AI Chatbot', 'Generovanie obsahu', 'Návrhy produktov', 'Lead Scoring (AI)'],
    linkedMenuItems: ['ai-chatbot'],
    sortOrder: 5,
  },
  {
    slug: 'analytics-pro',
    name: 'Analytika Pro',
    category: 'analytics',
    icon: 'BarChart3',
    price: 29,
    priceLabel: '€29/mesiac',
    isFree: false,
    trialDays: 7,
    description: 'Pokročilá analytika a reporting',
    longDescription:
      'Komplexné prehľady o výkone vašej stránky, konverziách a obchodných metrikách.',
    features: ['Dashboard s metrikami', 'Konverzné funnele', 'Trendy a reporty', 'Export do PDF'],
    linkedMenuItems: ['analytics'],
    sortOrder: 6,
  },
  {
    slug: 'audit-trail',
    name: 'Audit Log',
    category: 'security',
    icon: 'ClipboardList',
    price: 19,
    priceLabel: '€19/mesiac',
    isFree: false,
    trialDays: 0,
    description: 'Kompletný záznam všetkých aktivít v systéme',
    longDescription:
      'Sledujte všetky zmeny v systéme - od úprav obsahu po zmeny nastavení a používateľských účtov.',
    features: ['Záznam akcií', 'Filtrovanie podľa používateľa', 'Export logov', 'Notifikácie'],
    linkedMenuItems: ['audit-log'],
    sortOrder: 7,
  },
  {
    slug: 'multilingual',
    name: 'Viacjazyčnosť',
    category: 'integration',
    icon: 'Globe',
    price: 49,
    priceLabel: '€49/mesiac',
    isFree: false,
    trialDays: 14,
    description: 'Podpora viacerých jazykov pre webstránku',
    longDescription:
      'Rozšírte svoju prítomnosť na ďalšie trhy s plnou podporou viacerých jazykov vrátane SEO optimalizácie.',
    features: ['Preklady obsahu', 'SEO pre každý jazyk', 'Automatický preklad (AI)', 'Jazykový prepínač'],
    linkedMenuItems: [],
    sortOrder: 8,
  },
  {
    slug: 'white-label',
    name: 'White Label',
    category: 'integration',
    icon: 'Palette',
    price: 99,
    priceLabel: '€99/mesiac',
    isFree: false,
    trialDays: 0,
    description: 'Kompletné branding úpravy aplikácie',
    longDescription:
      'Prispôsobte administráciu a verejnú stránku vašej značke s vlastnými farbami, logom a názvom domény.',
    features: [
      'Vlastné farby',
      'Vlastné logo',
      'Custom doména',
      'Brand vo všetkých e-mailoch',
    ],
    linkedMenuItems: [],
    sortOrder: 9,
  },
  {
    slug: 'api-access',
    name: 'API Prístup',
    category: 'integration',
    icon: 'Code',
    price: 79,
    priceLabel: '€79/mesiac',
    isFree: false,
    trialDays: 0,
    description: 'REST API pre integráciu s externými systémami',
    longDescription:
      'Pripojte vašu aplikáciu na ERP, CRM alebo iné systémy cez dokumentované REST API rozhranie.',
    features: [
      'REST API endpointy',
      'API kľúče',
      'Webhooky',
      'Dokumentácia API',
      'Rate limiting',
    ],
    linkedMenuItems: [],
    sortOrder: 10,
  },
]

// POST /api/admin/modules/seed – Seed default marketplace modules
export async function POST() {
  try {
    const check = await requireAuth('superadmin:modules')()
    if (!check) return check

    const modules: string[] = []

    for (const mod of DEFAULT_MODULES) {
      await db.module.upsert({
        where: { slug: mod.slug },
        update: {
          name: mod.name,
          description: mod.description,
          longDescription: mod.longDescription,
          category: mod.category,
          icon: mod.icon,
          price: mod.price,
          priceLabel: mod.priceLabel,
          sortOrder: mod.sortOrder,
          isFree: mod.isFree,
          trialDays: mod.trialDays,
          features: JSON.stringify(mod.features),
          linkedMenuItems: JSON.stringify(mod.linkedMenuItems),
          isVisible: true,
        },
        create: {
          slug: mod.slug,
          name: mod.name,
          description: mod.description,
          longDescription: mod.longDescription,
          category: mod.category,
          icon: mod.icon,
          price: mod.price,
          priceLabel: mod.priceLabel,
          sortOrder: mod.sortOrder,
          isFree: mod.isFree,
          trialDays: mod.trialDays,
          features: JSON.stringify(mod.features),
          linkedMenuItems: JSON.stringify(mod.linkedMenuItems),
          isVisible: true,
        },
      })
      modules.push(mod.slug)
    }

    return NextResponse.json({
      success: true,
      count: modules.length,
      modules,
    })
  } catch (error) {
    console.error('[MODULES SEED] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri seedovaní modulov' },
      { status: 500 },
    )
  }
}
