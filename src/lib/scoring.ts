// Lead Scoring Engine — hybrid rules-based + AI scoring system for LINZMEIER.SK

// Scoring weights for each lead attribute
const WEIGHTS = {
  customerType: { investor: 25, firma: 15, architekt: 20, other: 5 } as Record<string, number>,
  projectType: { priemysel: 30, novostavba: 20, rekonstrukcia: 10, other: 5 } as Record<string, number>,
  budget: { vysoky: 20, stredny: 10, nizky: 5, neuvedeny: 0 } as Record<string, number>,
  projectArea: (area: number) => {
    if (area >= 1000) return 20
    if (area >= 500) return 15
    if (area >= 200) return 10
    if (area > 0) return 5
    return 0
  },
  source: { partner: 15, referral: 10, web_form: 5, phone: 8 } as Record<string, number>,
  messageLength: (msg: string) => Math.min(10, Math.floor(msg.length / 50)),
}

/**
 * Calculate rules-based score for a lead
 */
export function calculateRulesScore(lead: {
  customerType: string
  projectType: string | null
  budget: string | null
  projectArea: number | null
  source: string
  message: string
}): { score: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {}
  let total = 0

  // Customer type
  const ctScore = WEIGHTS.customerType[lead.customerType] || 0
  breakdown['Typ zákazníka'] = ctScore
  total += ctScore

  // Project type
  if (lead.projectType) {
    const ptScore = WEIGHTS.projectType[lead.projectType] || 0
    breakdown['Typ projektu'] = ptScore
    total += ptScore
  }

  // Budget
  if (lead.budget) {
    const bScore = WEIGHTS.budget[lead.budget] || 0
    breakdown['Rozpočet'] = bScore
    total += bScore
  }

  // Project area
  if (lead.projectArea && lead.projectArea > 0) {
    const aScore = WEIGHTS.projectArea(lead.projectArea)
    breakdown['Rozloha'] = aScore
    total += aScore
  }

  // Source
  if (lead.source) {
    const sScore = WEIGHTS.source[lead.source] || 0
    breakdown['Zdroj'] = sScore
    total += sScore
  }

  // Message quality
  const mScore = WEIGHTS.messageLength(lead.message)
  breakdown['Kvalita správy'] = mScore
  total += mScore

  return { score: Math.min(100, total), breakdown }
}

/**
 * Get score grade with label and colors
 */
export function getScoreGrade(score: number): { label: string; color: string; bgColor: string } {
  if (score >= 80) return { label: 'Vysoká', color: 'text-green-700', bgColor: 'bg-green-100' }
  if (score >= 60) return { label: 'Stredná', color: 'text-yellow-800', bgColor: 'bg-yellow-100' }
  if (score >= 40) return { label: 'Nízka', color: 'text-orange-700', bgColor: 'bg-orange-100' }
  return { label: 'Veľmi nízka', color: 'text-red-700', bgColor: 'bg-red-100' }
}

/**
 * Get Tailwind background class for score bar
 */
export function getScoreBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-warm'
  if (score >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}

/**
 * Get max possible points for normalization display
 */
export function getMaxScore(): number {
  return 100
}
