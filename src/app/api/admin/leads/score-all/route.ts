import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, unauthorized, forbidden } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'
import { calculateRulesScore, getScoreGrade } from '@/lib/scoring'

// POST /api/admin/leads/score-all – Score all unscored leads
export async function POST() {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'leads:edit')) return forbidden()

    // Find all leads without a score
    const unscoredLeads = await db.lead.findMany({
      where: { score: null },
    })

    if (unscoredLeads.length === 0) {
      return NextResponse.json({
        scored: 0,
        results: [],
        message: 'Žiadne leady na ohodnotenie',
      })
    }

    const results: { id: string; score: number; grade: string }[] = []

    // Score each lead
    for (const lead of unscoredLeads) {
      const { score, breakdown } = calculateRulesScore({
        customerType: lead.customerType,
        projectType: lead.projectType,
        budget: lead.budget,
        projectArea: lead.projectArea,
        source: lead.source,
        message: lead.message,
      })

      const grade = getScoreGrade(score)

      await db.lead.update({
        where: { id: lead.id },
        data: {
          score,
          scoreDetails: JSON.stringify(breakdown),
        },
      })

      results.push({ id: lead.id, score, grade: grade.label })
    }

    // Log bulk scoring activity
    await db.activity.create({
      data: {
        type: 'leads_bulk_scored',
        description: `Hromadné ohodnotenie ${unscoredLeads.length} leadov`,
        userId: user.id,
      },
    })

    return NextResponse.json({
      scored: unscoredLeads.length,
      results,
    })
  } catch (error) {
    console.error('[LEADS SCORE-ALL] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri hromadnom hodnotení leadov' },
      { status: 500 }
    )
  }
}
