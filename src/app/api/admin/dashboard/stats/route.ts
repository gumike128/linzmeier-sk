import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, unauthorized, forbidden } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'

// GET /api/admin/dashboard/stats – Dashboard statistics with chart data
export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'dashboard:view')) return forbidden()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Date ranges for charts
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    // Run all queries in parallel for performance
    const [
      newLeadsToday,
      totalLeads,
      wonLeads,
      allLeads,
      recentLeads,
      recentActivities,
      aiInteractions,
      recentLeadsForChart,
    ] = await Promise.all([
      // New leads created today
      db.lead.count({
        where: { createdAt: { gte: today } },
      }),
      // Total leads (excluding archived/lost)
      db.lead.count({
        where: { status: { not: 'LOST' } },
      }),
      // Won leads count
      db.lead.count({
        where: { status: 'WON' },
      }),
      // All leads for status grouping
      db.lead.findMany({
        select: { status: true },
      }),
      // Last 5 leads with assigned user info
      db.lead.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          assignedTo: {
            select: { id: true, name: true },
          },
        },
      }),
      // Last 10 activities with user name
      db.activity.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true },
          },
          lead: {
            select: { id: true, name: true },
          },
        },
      }),
      // Total AI interactions count
      db.aIInteraction.count(),
      // Leads from last 6 months for chart data
      db.lead.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true, customerType: true, source: true, status: true, projectType: true },
      }),
    ])

    // Calculate leads by status
    const leadsByStatus: Record<string, number> = {}
    for (const lead of allLeads) {
      const status = lead.status
      leadsByStatus[status] = (leadsByStatus[status] || 0) + 1
    }

    // Calculate conversion rate (WON / total non-lost leads)
    const conversionRate = totalLeads > 0
      ? Math.round((wonLeads / totalLeads) * 100)
      : 0

    // ── Chart data ──

    // Group by month (last 6 months) – for line chart
    const leadsByMonth: Record<string, number> = {}
    for (const lead of recentLeadsForChart) {
      const monthKey = lead.createdAt.toISOString().slice(0, 7) // "2024-03"
      leadsByMonth[monthKey] = (leadsByMonth[monthKey] || 0) + 1
    }

    // Group by customerType – for pie chart
    const leadsByCustomerType: Record<string, number> = {}
    for (const lead of recentLeadsForChart) {
      const type = lead.customerType || 'neurčené'
      leadsByCustomerType[type] = (leadsByCustomerType[type] || 0) + 1
    }

    // Group by source – for bar chart
    const leadsBySource: Record<string, number> = {}
    for (const lead of recentLeadsForChart) {
      const source = lead.source || 'neznámy'
      leadsBySource[source] = (leadsBySource[source] || 0) + 1
    }

    // Group by projectType as "topProducts" – leads mentioning each product/project type
    const topProducts: Record<string, number> = {}
    for (const lead of recentLeadsForChart) {
      const productType = lead.projectType || 'nešpecifikované'
      topProducts[productType] = (topProducts[productType] || 0) + 1
    }

    // Weekly leads – last 7 days grouped by date – for bar chart
    const weeklyLeads: Record<string, number> = {}
    for (const lead of recentLeadsForChart) {
      if (lead.createdAt >= sevenDaysAgo) {
        const dayKey = lead.createdAt.toISOString().split('T')[0] // "2024-03-15"
        weeklyLeads[dayKey] = (weeklyLeads[dayKey] || 0) + 1
      }
    }

    // Ensure all 7 days have entries (fill missing days with 0)
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo)
      d.setDate(d.getDate() + i)
      const key = d.toISOString().split('T')[0]
      if (!weeklyLeads[key]) {
        weeklyLeads[key] = 0
      }
    }

    return NextResponse.json({
      newLeadsToday,
      totalLeads,
      wonLeads,
      conversionRate,
      leadsByStatus,
      recentLeads,
      recentActivities,
      aiInteractions,
      // Chart data
      leadsByMonth,
      leadsByCustomerType,
      leadsBySource,
      topProducts,
      weeklyLeads,
    })
  } catch (error) {
    console.error('[DASHBOARD STATS] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri načítaní štatistík' },
      { status: 500 }
    )
  }
}
