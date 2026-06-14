import { Pencil } from 'lucide-react'
import type { Subscription } from '../types'
import { daysUntil, getUrgency, URGENCY_COLORS_RAW, periodDays, freqLabel } from '../lib/urgency'
import { formatAmount } from '../lib/currencies'
import { BrandTile } from './BrandTile'

interface Props {
  sub: Subscription
  onEdit: (sub: Subscription) => void
  animDelay?: number
}

function shortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function SubscriptionCard({ sub, onEdit, animDelay = 0 }: Props) {
  const days = daysUntil(sub.nextChargeDate)
  const urgency = getUrgency(sub)
  const color = URGENCY_COLORS_RAW[urgency]

  const dateLabel = sub.isTrial && sub.trialEndDate ? sub.trialEndDate : sub.nextChargeDate
  const chargeLabel = sub.isTrial ? 'first charge' : 'next charge'

  const total = periodDays(sub.frequencyEvery, sub.frequencyUnit)
  const elapsed = total - days
  const pct = Math.min(100, Math.max(0, (elapsed / total) * 100))

  return (
    <div
      className="card-in relative group cursor-pointer rounded-2xl p-5 transition-all duration-200"
      style={{
        animationDelay: `${animDelay}ms`,
        background: 'var(--surface)',
        border: `1px solid ${color}30`,
      }}
      onClick={() => onEdit(sub)}
    >
      {/* Edit hint */}
      <div
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150 w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ background: 'var(--surface-2)', color: 'var(--text-faint)' }}
      >
        <Pencil size={12} />
      </div>

      {/* Top row: brand + countdown */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <BrandTile domain={sub.domain} name={sub.serviceName} size={44} rounded={10} />
          <div className="min-w-0">
            <div className="font-bold text-base leading-tight truncate" style={{ color: 'var(--text)' }}>
              {sub.serviceName}
            </div>
            <div className="text-[11px] font-semibold tracking-wider mt-0.5 uppercase" style={{ color: 'var(--text-faint)' }}>
              {sub.isTrial ? 'FREE TRIAL' : freqLabel(sub.frequencyEvery, sub.frequencyUnit)}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 text-right">
          <div className="countdown font-black" style={{ fontSize: '2.4rem', color }}>
            {Math.max(0, days)}
          </div>
          <div className="text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--text-faint)' }}>
            DAYS
          </div>
        </div>
      </div>

      {/* Trial badge */}
      {sub.isTrial && sub.trialEndDate && (
        <div
          className="mt-3 px-2.5 py-1.5 rounded-lg text-[11px] font-bold tracking-wide"
          style={{ background: 'rgba(255,0,255,0.12)', border: '1px solid rgba(255,0,255,0.3)', color: '#FF00FF' }}
        >
          ⚠ TRIAL ENDS {shortDate(sub.trialEndDate).toUpperCase()} — CANCEL TO SKIP CHARGE
        </div>
      )}

      {/* Price + date + progress bar */}
      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <div className="text-xl font-bold tabular-nums" style={{ color: 'var(--text)' }}>
            {formatAmount(sub.amount, sub.currency)}
          </div>
          <div className="text-[11px] font-semibold" style={{ color: 'var(--text-faint)' }}>
            {sub.currency}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>{chargeLabel}</span>
            <span className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>{shortDate(dateLabel)}</span>
          </div>
          <div style={{ height: 3, borderRadius: 2, background: 'var(--border-strong)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, borderRadius: 2, background: color, opacity: 0.75, transition: 'width 0.6s ease' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
