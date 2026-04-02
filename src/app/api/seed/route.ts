import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST() {
  try {
    const results: string[] = []

    // ── Create admin user ──
    const adminHash = hashPassword('admin123')
    await db.user.upsert({
      where: { email: 'admin@linzmeier.sk' },
      update: {},
      create: {
        email: 'admin@linzmeier.sk',
        name: 'Admin LINZMEIER',
        passwordHash: adminHash,
        role: 'ADMIN',
        isActive: true,
      },
    })
    results.push('✅ Admin user created')

    // ── Create sales user ──
    const salesHash = hashPassword('sales123')
    await db.user.upsert({
      where: { email: 'obchod@linzmeier.sk' },
      update: {},
      create: {
        email: 'obchod@linzmeier.sk',
        name: 'Ján Obchodník',
        passwordHash: salesHash,
        role: 'SALES',
        isActive: true,
      },
    })
    results.push('✅ Sales user created')

    // ── Create marketing user ──
    const marketingHash = hashPassword('marketing123')
    await db.user.upsert({
      where: { email: 'marketing@linzmeier.sk' },
      update: {},
      create: {
        email: 'marketing@linzmeier.sk',
        name: 'Maria Marketingová',
        passwordHash: marketingHash,
        role: 'MARKETING',
        isActive: true,
      },
    })
    results.push('✅ Marketing user created')

    // ── Create sample products ──
    const products = [
      {
        name: 'Thermowand 100',
        slug: 'thermowand-100',
        category: 'panels',
        shortDesc: 'Izolačný panel s vynikajúcimi tepelnými vlastnosťami',
        description: 'Vysokokvalitný termoizolačný panel s vynikajúcimi tepelnými vlastnosťami. Vhodný pre novostavby aj rekonštrukcie rodinných domov a bytových domov.',
        status: 'PUBLISHED',
        sortOrder: 1,
        suitableFor: '["RD","bytové domy","priemysel"]',
      },
      {
        name: 'Thermowand 150',
        slug: 'thermowand-150',
        category: 'panels',
        shortDesc: 'Zvýšená tepelná izolácia pre pasívne domy',
        description: 'Panel so zvýšenou tepelnou izoláciou navrhnutý pre pasívne domy a energeticky náročné stavby.',
        status: 'PUBLISHED',
        sortOrder: 2,
        suitableFor: '["RD","bytové domy"]',
      },
      {
        name: 'Fasádny systém LFS-100',
        slug: 'fasadny-system-lfs-100',
        category: 'facades',
        shortDesc: 'Kompletný fasádny systém pre novostavby',
        description: 'Kompletný fasádny systém zahŕňajúci izolačné panely, kotviaci systém a fasádne omietky pre novostavby.',
        status: 'PUBLISHED',
        sortOrder: 1,
        suitableFor: '["RD","bytové domy","priemysel"]',
      },
      {
        name: 'Priečelová doska WoodEffect',
        slug: 'priecelova-doska-woodeffect',
        category: 'boards',
        shortDesc: 'Imitácia dreva s maximálnou odolnosťou',
        description: 'Priečelová doska s realistickou imitáciou dreva a maximálnou odolnosťou voči poveternostným vplyvom.',
        status: 'PUBLISHED',
        sortOrder: 1,
        suitableFor: '["RD","bytové domy"]',
      },
      {
        name: 'Príslušenstvo - upevňovací systém',
        slug: 'prislusenstvo-upevnovaci',
        category: 'accessories',
        shortDesc: 'Kompletné príslušenstvo pre montáž',
        description: 'Kompletný upevňovací systém pre montáž izolačných panelov a fasádnych systémov.',
        status: 'PUBLISHED',
        sortOrder: 1,
      },
    ]

    for (const p of products) {
      await db.product.upsert({
        where: { slug: p.slug },
        update: {},
        create: p,
      })
    }
    results.push('✅ Products seeded')

    // ── Create sample references ──
    const refs = [
      {
        id: 'rodinny-dom-bratislava',
        title: 'Rodinný dom Bratislava',
        type: 'rodinny_dom',
        location: 'Bratislava',
        system: 'Thermowand',
        status: 'PUBLISHED',
        sortOrder: 1,
      },
      {
        id: 'bytovy-dom-kosice',
        title: 'Bytový dom Košice',
        type: 'bytovy_dom',
        location: 'Košice',
        system: 'Fasádny systém',
        status: 'PUBLISHED',
        sortOrder: 2,
      },
      {
        id: 'priemyselna-hala-zilina',
        title: 'Priemyselná hala Žilina',
        type: 'priemysel',
        location: 'Žilina',
        system: 'Priemyselný panel',
        status: 'PUBLISHED',
        sortOrder: 3,
      },
    ]

    for (const r of refs) {
      await db.reference.upsert({
        where: { id: r.id },
        update: {},
        create: r,
      })
    }
    results.push('✅ References seeded')

    // ── Create sample leads ──
    const leads = [
      {
        customerType: 'architekt',
        name: 'Peter Architekt',
        email: 'peter@architektura.sk',
        projectType: 'novostavba',
        message: 'Potrebujem cenovú ponuku na zateplenie rodinného domu v Bratislave.',
        status: 'NEW',
        source: 'web_form',
      },
      {
        customerType: 'firma',
        name: 'StavMax s.r.o.',
        email: 'info@stavmax.sk',
        projectType: 'rekonstrukcia',
        message: 'Máme záujem o fasádny systém pre bytový dom v Košiciach, 36 bytov.',
        status: 'CONTACTED',
        source: 'web_form',
      },
      {
        customerType: 'investor',
        name: 'Jozef Investor',
        email: 'jozef@investor.sk',
        projectType: 'priemysel',
        message: 'Plánujeme výstavbu logistického centra, potrebné zateplenie 5000m².',
        status: 'QUALIFIED',
        source: 'partner',
      },
    ]

    for (const l of leads) {
      const existing = await db.lead.findFirst({ where: { email: l.email } })
      if (!existing) {
        await db.lead.create({ data: l })
      }
    }
    results.push('✅ Leads seeded')

    // ── Create settings ──
    await db.setting.upsert({
      where: { key: 'chatbot_system_prompt' },
      update: {},
      create: {
        key: 'chatbot_system_prompt',
        value:
          'Si odborný asistent spoločnosti LINZMEIER Slovakia. Odpovedaj vždy po slovensky, stručne a odborne. Pomáhaj zákazníkom s výberom produktov, technickými informáciami a cenovými ponukami.',
        type: 'string',
      },
    })

    await db.setting.upsert({
      where: { key: 'company_name' },
      update: {},
      create: {
        key: 'company_name',
        value: 'LINZMEIER Slovakia s.r.o.',
        type: 'string',
      },
    })

    await db.setting.upsert({
      where: { key: 'company_email' },
      update: {},
      create: {
        key: 'company_email',
        value: 'info@linzmeier.sk',
        type: 'string',
      },
    })

    await db.setting.upsert({
      where: { key: 'company_phone' },
      update: {},
      create: {
        key: 'company_phone',
        value: '+421 2 XXX XXX XX',
        type: 'string',
      },
    })

    results.push('✅ Settings seeded')

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      results,
      credentials: {
        admin: 'admin@linzmeier.sk / admin123',
        sales: 'obchod@linzmeier.sk / sales123',
        marketing: 'marketing@linzmeier.sk / marketing123',
      },
    })
  } catch (error) {
    console.error('[Seed API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Chyba pri seedovaní databázy.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Seed API - POST to /api/seed to seed the database',
    credentials: {
      admin: 'admin@linzmeier.sk / admin123',
      sales: 'obchod@linzmeier.sk / sales123',
      marketing: 'marketing@linzmeier.sk / marketing123',
    },
  })
}
