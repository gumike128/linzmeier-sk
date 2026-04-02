'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getScoreGrade, getScoreBarColor } from '@/lib/scoring'
import { Sparkles, Zap, Loader2, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

interface ScorePanelProps {
  leadId: string
  score: number | null
  scoreDetails: string | null
}

export function ScorePanel({ leadId, score, scoreDetails }: ScorePanelProps) {
  const queryClient = useQueryClient()
  const [aiLoading, setAiLoading] = useState(false)
  const [scoringLoading, setScoringLoading] = useState(false)

  let breakdown: Record<string, number> = {}
  try {
    if (scoreDetails) {
      breakdown = JSON.parse(scoreDetails)
    }
  } catch {
    // ignore parse errors
  }

  const grade = score !== null ? getScoreGrade(score) : null

  async function handleCalculateScore(includeAI: boolean) {
    if (includeAI) {
      setAiLoading(true)
    } else {
      setScoringLoading(true)
    }
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeAI }),
      })
      if (res.ok) {
        const data = await res.json()
        queryClient.invalidateQueries({ queryKey: ['lead', leadId] })
        queryClient.invalidateQueries({ queryKey: ['leads'] })
        if (includeAI && data.aiBoost !== undefined) {
          toast.success(`AI analýza dokončená: +${data.aiBoost} bodov (celkovo ${data.score}/100)`)
        } else {
          toast.success(`Skóre vypočítané: ${data.score}/100`)
        }
      } else {
        toast.error('Chyba pri výpočte skóre')
      }
    } catch {
      toast.error('Chyba pri výpočte skóre')
    } finally {
      setAiLoading(false)
      setScoringLoading(false)
    }
  }

  async function handleScoreAll() {
    try {
      const res = await fetch('/api/admin/leads/score-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        const data = await res.json()
        queryClient.invalidateQueries({ queryKey: ['leads'] })
        toast.success(`Ohodnotených ${data.scored} leadov`)
      } else {
        toast.error('Chyba pri hromadnom hodnotení')
      }
    } catch {
      toast.error('Chyba pri hromadnom hodnotení')
    }
  }

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="size-4 text-warm-dark" />
          Skóre leadu
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {score !== null ? (
          <>
            {/* Score display */}
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">{score}</div>
              <div>
                {grade && (
                  <Badge className={`${grade.bgColor} ${grade.color} border-0`}>
                    {grade.label}
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground mt-1">z 100 možných bodov</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${getScoreBarColor(score)}`}
                style={{ width: `${score}%` }}
              />
            </div>

            {/* Rules breakdown */}
            {Object.keys(breakdown).length > 0 && (
              <div className="space-y-2.5 pt-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Rozdelenie bodov</p>
                {Object.entries(breakdown).map(([key, val]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{key}</span>
                      <span className="font-semibold">{val}b</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(val * 3)}`}
                        style={{ width: `${Math.min(100, val * 3)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <TrendingUp className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">Lead ešte nebola ohodnotená</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCalculateScore(false)}
              disabled={scoringLoading}
            >
              {scoringLoading ? (
                <Loader2 className="size-4 mr-1.5 animate-spin" />
              ) : (
                <Zap className="size-4 mr-1.5" />
              )}
              Vypočítať skóre
            </Button>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-warm-dark/30 text-warm-dark hover:bg-warm-dark/10"
            onClick={() => handleCalculateScore(true)}
            disabled={aiLoading}
          >
            {aiLoading ? (
              <Loader2 className="animate-spin mr-2 size-4" />
            ) : (
              <Sparkles className="mr-2 size-4" />
            )}
            AI analýza správy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={handleScoreAll}
          >
            <Zap className="mr-2 size-4" />
            Vypočítať všetky leady
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
