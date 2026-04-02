import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, unauthorized, forbidden } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'

// GET /api/admin/analytics – Comprehensive analytics data
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'dashboard:view')) return forbidden()

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || '30'
    const days = Math.min(parseInt(period) || 30, 365)

    const now = new Date()
    const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      leadsInRange,
      allLeads,
      users,
      allActivities,
      aiInteractions,
      publishedProducts,
      publishedPosts,
    ] = await Promise.all([
      db.lead.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: 'asc' },
        include: { assignedTo: { select: { id: true, name: true } } },
      }),
      db.lead.findMany({
        select: { status: true, createdAt: true, customerType: true, source: true, projectType: true, score: true, assignedToId: true, utmSource: true },
      }),
      db.user.findMany({
        select: { id: true, name: true, role: true, isActive: true, lastLoginAt: true },
      }),
      db.activity.findMany({
        where: { createdAt: { gte: since } },
        select: { type: true, userId: true, leadId: true, createdAt: true },
      }),
      db.aIInteraction.count(),
      db.product.count({ where: { status: 'PUBLISHED' } }),
      db.blogPost.count({ where: { status: 'PUBLISHED' } }),
    ])

    // KPIs
    const totalLeadsInRange = leadsInRange.length
    const newToday = leadsInRange.filter(l => l.createdAt >= todayStart).length
    const newThisWeek = leadsInRange.filter(l => l.createdAt >= weekAgo).length
    const newThisMonth = leadsInRange.filter(l => l.createdAt >= monthAgo).length
    const activeUsers = users.filter(u => u.isActive && u.lastLoginAt && u.lastLoginAt >= since).length
    const totalUsers = users.filter(u => u.isActive).length

    // Conversion Funnel
    const funnel = {
      total: allLeads.length,
      NEW: allLeads.filter(l => l.status === 'NEW').length,
      CONTACTED: allLeads.filter(l => l.status === 'CONTACTED').length,
      QUALIFIED: allLeads.filter(l => l.status === 'QUALIFIED').length,
      PROPOSAL: allLeads.filter(l => l.status === 'PROPOSAL').length,
      NEGOTIATION: allLeads.filter(l => l.status === 'NEGOTIATION').length,
      WON: allLeads.filter(l => l.status === 'WON').length,
      LOST: allLeads.filter(l => l.status === 'LOST').length,
    }
    const nonLost = allLeads.filter(l => l.status !== 'LOST')
    const conversionRate = nonLost.length > 0
      ? Math.round((funnel.WON / nonLost.length) * 100) : 0

    // Sources
    const sourceMap: Record<string, { count: number; won: number }> = {}
    for (const lead of allLeads) {
      const src = lead.source || 'neznámy'
      if (!sourceMap[src]) sourceMap[src] = { count: 0, won: 0 }
      sourceMap[src].count++
      if (lead.status === 'WON') sourceMap[src].won++
    }

    // Customer Types
    const customerTypeMap: Record<string, { count: number; won: number }> = {}
    for (const lead of allLeads) {
      const ct = lead.customerType || 'neurčené'
      if (!customerTypeMap[ct]) customerTypeMap[ct] = { count: 0, won: 0 }
      customerTypeMap[ct].count++
      if (lead.status === 'WON') customerTypeMap[ct].won++
    }

    // Project Types
    const projectTypeMap: Record<string, number> = {}
    for (const lead of allLeads) {
      const pt = lead.projectType || 'nešpecifikované'
      projectTypeMap[pt] = (projectTypeMap[pt] || 0) + 1
    }

    // Daily Trend
    const trendMap: Record<string, { date: string; new: number; won: number }> = {}
    for (let i = 0; i < days; i++) {
      const d = new Date(since)
      d.setDate(d.getDate() + i)
      const key = d.toISOString().split('T')[0]
      trendMap[key] = { date: key, new: 0, won: 0 }
    }
    for (const lead of leadsInRange) {
      const key = lead.createdAt.toISOString().split('T')[0]
      if (trendMap[key]) {
        trendMap[key].new++
        if (lead.status === 'WON') trendMap[key].won++
      }
    }
    const dailyTrend = Object.values(trendMap)

    // Monthly Trend
    const monthlyMap: Record<string, { month: string; leads: number; won: number }> = {}
    for (const lead of leadsInRange) {
      const key = lead.createdAt.toISOString().slice(0, 7)
      if (!monthlyMap[key]) monthlyMap[key] = { month: key, leads: 0, won: 0 }
      monthlyMap[key].leads++
      if (lead.status === 'WON') monthlyMap[key].won++
    }
    const monthlyTrend = Object.values(monthlyMap)

    // Score Distribution
    const scoredLeads = allLeads.filter(l => l.score !== null)
    const scoreDistribution = [
      { range: '0-20', count: scoredLeads.filter(l => l.score! >= 0 && l.score! <= 20).length },
      { range: '21-40', count: scoredLeads.filter(l => l.score! > 20 && l.score! <= 40).length },
      { range: '41-60', count: scoredLeads.filter(l => l.score! > 40 && l.score! <= 60).length },
      { range: '61-80', count: scoredLeads.filter(l => l.score! > 60 && l.score! <= 80).length },
      { range: '81-100', count: scoredLeads.filter(l => l.score! > 80 && l.score! <= 100).length },
    ]

    // Assignment Stats
    const assignedLeads = allLeads.filter(l => l.assignedToId)
    const unassignedLeads = allLeads.filter(l => !l.assignedToId)
    const assignedUserMap: Record<string, number> = {}
    for (const lead of allLeads) {
      if (lead.assignedToId) {
        assignedUserMap[lead.assignedToId] = (assignedUserMap[lead.assignedToId] || 0) + 1
      }
    }

    // Activity Breakdown
    const activityTypeMap: Record<string, number> = {}
    for (const act of allActivities) {
      activityTypeMap[act.type] = (activityTypeMap[act.type] || 0) + 1
    }

    // UTM Attribution
    const utmSourceMap: Record<string, number> = {}
    for (const lead of allLeads) {
      const src = lead.utmSource || '(bez UTM)'
      utmSourceMap[src] = (utmSourceMap[src] || 0) + 1
    }

    // Average Score
    const avgScore = scoredLeads.length > 0
      ? Math.round(scoredLeads.reduce((s, l) => s + (l.score || 0), 0) / scoredLeads.length)
      : 0

    // Recent Won Leads
    const wonLeads = allLeads.filter(l => l.status === 'WON')

    return NextResponse.json({
      period: { days },
      timestamp: now.toISOString(),
      kpis: {
        totalLeadsInRange, newToday, newThisWeek, newThisMonth,
        totalLeads: allLeads.length, conversionRate, avgLeadScore: avgScore,
        activeUsers, totalUsers, publishedProducts, publishedPosts, aiInteractions,
      },
      funnel,
      sources: sourceMap,
      customerTypes: customerTypeMap,
      projectTypes: projectTypeMap,
      dailyTrend,
      monthlyTrend,
      scoreDistribution,
      assignment: {
        assigned: assignedLeads.length,
        unassigned: unassignedLeads.length,
        byUser: assignedUserMap,
      },
      activities: activityTypeMap,
      utmSources: utmSourceMap,
      recentWonLeads: wonLeads.slice(0, 10).map(l => ({
        id: l.id, name: l.name, customerType: l.customerType,
        projectType: l.projectType, score: l.score, createdAt: l.createdAt,
      })),
    })
  } catch (error) {
    console.error('[ANALYTICS] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri načítaní analytík' },
      { status: 500 },
    )
  }
}
