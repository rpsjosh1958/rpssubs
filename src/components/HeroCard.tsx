import type { Subscription } from '../types'
import { daysUntil, getUrgency, URGENCY_COLORS_RAW } from '../lib/urgency'
import { formatAmount } from '../lib/currencies'
import { freqLabel } from '../lib/urgency'
import { BrandTile } from './BrandTile'

interface Props {
  sub: Subscription
  totalGHSMonth: number
  totalUSDMonth: number
  activeSubs: number
  onEdit: (sub: Subscription) => void
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function HeroCard({ sub, activeSubs, onEdit }: Props) {
  const days = daysUntil(sub.nextChargeDate)
  const urgency = getUrgency(sub)
  const color = URGENCY_COLORS_RAW[urgency]
  const dateLabel = sub.isTrial ? sub.trialEndDate : sub.nextChargeDate

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 sm:p-8 cursor-pointer transition-all duration-200"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-strong)',
      }}
      onClick={() => onEdit(sub)}
    >
      <div>
        <div className="text-[10px] font-bold tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--text-faint)' }}>
          Next Charge Incoming
        </div>

        {/* Service row: logo + name + countdown inline */}
        <div className="flex items-center gap-3">
          <BrandTile domain={sub.domain} name={sub.serviceName} size={52} rounded={12} />
          <div className="flex-1 min-w-0">
            <div className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text)' }}>
              {sub.serviceName}
            </div>
            <div className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {formatAmount(sub.amount, sub.currency)} · {freqLabel(sub.frequencyEvery, sub.frequencyUnit)}
            </div>
          </div>
          {/* Frequency + date — flush with card left edge, same as brand tile */}
        
          {/* Countdown — inline with the service name */}
          <div className="flex-shrink-0 text-center">
            <div
              className="countdown font-black"
              style={{
                fontSize: 'clamp(3.5rem, 9vw, 6rem)',
                color,
                textShadow: `0 0 28px ${color}80`,
                lineHeight: 1,
              }}
            >
              {Math.max(0, days)}
            </div>
            <div
              className="text-[10px] font-bold tracking-[0.22em] uppercase mt-1"
              style={{ color: 'var(--text-faint)' }}
            >
              Days to go
            </div>
          </div>
        </div>

        {/* Frequency + date — flush with card left edge, same as brand tile */}
        <div className="mt-2 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          {dateLabel && (
            <span> {sub.isTrial ? 'Trial ends' : 'Bills on'}{' '}
              <span className="font-bold" style={{ color: 'var(--text)' }}>
                {formatDate(dateLabel)}
              </span>
            </span>
          )}
        </div>


        {/* Summary chips */}
        <div className="flex flex-wrap items-center gap-2 mt-5">
          <SummaryChip label="Active" value={`${activeSubs} subscriptions`} accent />
        </div>
      </div>
    </div>
  )
}

function SummaryChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className="px-3 py-1.5 rounded-lg flex flex-col gap-0.5"
      style={{
        background: accent ? 'var(--accent-dim)' : 'var(--surface-2)',
        border: '1px solid var(--border)',
      }}
    >
      <span className="text-[9px] font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--text-faint)' }}>
        {label}
      </span>
      <span
        className="text-sm font-bold tabular-nums"
        style={{ color: accent ? 'var(--accent)' : 'var(--text)' }}
      >
        {value}
      </span>
    </div>
  )
}
