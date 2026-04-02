import { db } from './db'

export interface AutomationRule {
  id: string
  name: string
  description?: string
  trigger: string // 'lead_created' | 'status_change'
  conditions: {
    fromStatus?: string
    toStatus?: string
    customerType?: string
  }
  actions: {
    type: 'email' | 'assign' | 'notify'
    template?: string // for email type
    strategy?: string // for assign type: 'round_robin' | 'none'
    assignTo?: string // for notify type
  }[]
  isActive: boolean
}

export async function runAutomations(
  eventType: string,
  context: {
    leadId: string
    leadData?: Record<string, unknown>
    fromStatus?: string
    toStatus?: string
  },
): Promise<string[]> {
  const automations = await db.automation.findMany({
    where: { isActive: true, trigger: eventType },
  })

  const results: string[] = []

  for (const automation of automations) {
    const conditions: AutomationRule['conditions'] = JSON.parse(automation.conditions)
    let matches = true

    // Check conditions
    if (eventType === 'status_change') {
      if (conditions.fromStatus && conditions.fromStatus !== context.fromStatus) {
        matches = false
      }
      if (conditions.toStatus && conditions.toStatus !== context.toStatus) {
        matches = false
      }
    }

    if (eventType === 'lead_created') {
      if (conditions.customerType) {
        const leadData = context.leadData ?? {}
        if (leadData.customerType && conditions.customerType !== leadData.customerType) {
          matches = false
        }
      }
    }

    if (!matches) continue

    const actions: AutomationRule['actions'] = JSON.parse(automation.actions)

    for (const action of actions) {
      try {
        switch (action.type) {
          case 'assign': {
            if (action.strategy === 'round_robin') {
              await autoAssignLead(context.leadId)
              results.push(`Auto-priradený (round-robin)`)
            }
            break
          }
          case 'email': {
            results.push(`Email notifikácia: ${automation.name}`)
            await db.activity.create({
              data: {
                type: 'automation_email',
                description: `Automatizácia: ${automation.name} – email notifikácia pre lead`,
                metadata: JSON.stringify({
                  automationId: automation.id,
                  template: action.template,
                }),
                leadId: context.leadId,
                userId: 'system',
              },
            })
            break
          }
          case 'notify': {
            results.push(`Notifikácia: ${automation.name}`)
            await db.activity.create({
              data: {
                type: 'automation_notify',
                description: `Automatizácia: ${automation.name} – interná notifikácia`,
                metadata: JSON.stringify({
                  automationId: automation.id,
                  assignTo: action.assignTo,
                }),
                leadId: context.leadId,
                userId: 'system',
              },
            })
            break
          }
        }
      } catch (error) {
        console.error(`Automation ${automation.id} action failed:`, error)
      }
    }
  }

  return results
}

async function autoAssignLead(leadId: string) {
  // Get all active sales users
  const salesUsers = await db.user.findMany({
    where: { role: 'SALES', isActive: true },
    orderBy: { createdAt: 'asc' },
  })

  if (salesUsers.length === 0) return

  // Count leads per sales user
  const leadCounts: Record<string, number> = {}
  for (const user of salesUsers) {
    leadCounts[user.id] = await db.lead.count({
      where: { assignedToId: user.id, status: { not: 'LOST' } },
    })
  }

  // Find user with fewest leads
  let minCount = Infinity
  let targetUserId = salesUsers[0].id
  for (const [userId, count] of Object.entries(leadCounts)) {
    if (count < minCount) {
      minCount = count
      targetUserId = userId
    }
  }

  // Assign lead
  await db.lead.update({
    where: { id: leadId },
    data: { assignedToId: targetUserId },
  })

  // Log activity
  await db.activity.create({
    data: {
      type: 'auto_assigned',
      description: `Lead automaticky priradený obchodníkovi (round-robin)`,
      metadata: JSON.stringify({
        assignedToId: targetUserId,
        automation: 'auto_assign',
      }),
      leadId,
      userId: 'system',
    },
  })
}
