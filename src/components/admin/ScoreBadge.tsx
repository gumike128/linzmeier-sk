'use client'

import { getScoreGrade, getScoreBarColor } from '@/lib/scoring'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ScoreBadgeProps {
  score: number | null
  scoreDetails?: string | null
}

export function ScoreBadge({ score, scoreDetails }: ScoreBadgeProps) {
  if (score === null) {
    return <span className="text-xs text-muted-foreground">–</span>
  }

  const grade = getScoreGrade(score)
  let breakdown: Record<string, number> | null = null
  try {
    if (scoreDetails) {
      breakdown = JSON.parse(scoreDetails)
    }
  } catch {
    // ignore parse errors
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 cursor-help">
            <div className="flex items-center gap-1 w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getScoreBarColor(score)}`}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className="text-xs font-bold text-muted-foreground">{score}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-[220px]" side="bottom">
          <p className="font-semibold text-sm">{grade.label} ({score}/100)</p>
          {breakdown && Object.keys(breakdown).length > 0 && (
            <div className="mt-1.5 space-y-0.5 border-t pt-1.5">
              {Object.entries(breakdown).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-muted-foreground">{key}</span>
                  <span className="font-medium">{val}b</span>
                </div>
              ))}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
