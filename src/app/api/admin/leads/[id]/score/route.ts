import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getAuthUser, unauthorized, forbidden } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'
import { calculateRulesScore, getScoreGrade } from '@/lib/scoring'
import { generateContent } from '@/lib/ai'

const scoreBodySchema = z.object({
  includeAI: z.boolean().optional().default(false),
})

// POST /api/admin/leads/[id]/score – Score a single lead (rules + optional AI boost)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'leads:edit')) return forbidden()

    const { id } = await params

    // Validate body
    const body = await request.json()
    const parsed = scoreBodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Chyba validácie' },
        { status: 400 }
      )
    }

    const { includeAI } = parsed.data

    // Fetch lead
    const lead = await db.lead.findUnique({
      where: { id },
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead nebol nájdený' },
        { status: 404 }
      )
    }

    // Calculate rules-based score
    const { score: rulesScore, breakdown } = calculateRulesScore({
      customerType: lead.customerType,
      projectType: lead.projectType,
      budget: lead.budget,
      projectArea: lead.projectArea,
      source: lead.source,
      message: lead.message,
    })

    let finalScore = rulesScore
    let aiBoost: number | undefined

    // AI analysis boost (0-30 extra points)
    if (includeAI) {
      try {
        const aiResult = await generateContent(
          'faq',
          `Ohodnoť kvalitu tohto leadu: "${lead.message}". Zákazník: ${lead.customerType}, projekt: ${lead.projectType}. Vráť len číslo od 0 do 30.`,
          'analytický'
        )
        aiBoost = parseInt(aiResult.match(/\d+/)?.[0] || '10')
        aiBoost = Math.max(0, Math.min(30, aiBoost))
        finalScore = Math.min(100, rulesScore + aiBoost)
        breakdown['AI analýza'] = aiBoost
      } catch (aiError) {
        console.error('[LEAD SCORE] AI analysis failed:', aiError)
        // Continue with rules-only score if AI fails
      }
    }

    const grade = getScoreGrade(finalScore)

    // Update lead in DB
    await db.lead.update({
      where: { id },
      data: {
        score: finalScore,
        scoreDetails: JSON.stringify(breakdown),
      },
    })

    // Log activity
    await db.activity.create({
      data: {
        type: 'lead_scored',
        description: includeAI
          ? `Lead ohodnotený skóre ${finalScore}/100 (pravidlá: ${rulesScore}, AI: +${aiBoost ?? 0})`
          : `Lead ohodnotený skóre ${finalScore}/100 (pravidlá)`,
        leadId: lead.id,
        userId: user.id,
      },
    })

    return NextResponse.json({
      score: finalScore,
      breakdown,
      grade: grade.label,
      rulesScore,
      aiBoost,
    })
  } catch (error) {
    console.error('[LEAD SCORE] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri hodnotení leadu' },
      { status: 500 }
    )
  }
}
