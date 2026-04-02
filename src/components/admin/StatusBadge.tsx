import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '@/lib/rbac'
import { Badge } from '@/components/ui/badge'

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={LEAD_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'}>
      {LEAD_STATUS_LABELS[status] || status}
    </Badge>
  )
}
