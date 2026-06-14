import type { Subscription, SortMode } from '../types'
import { SubscriptionCard } from './SubscriptionCard'

interface Props {
  subs: Subscription[]
  sort: SortMode
  onSortChange: (mode: SortMode) => void
  onEdit: (sub: Subscription) => void
}

export function SubscriptionGrid({ subs, sort, onSortChange, onEdit }: Props) {
  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--text-faint)' }}>
            All Subcriptions
          </div>
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-1.5">
          {(['soonest', 'priciest'] as SortMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onSortChange(mode)}
              className="px-4 py-2 rounded-full text-[11px] font-bold tracking-wide capitalize transition-all duration-150"
              style={
                sort === mode
                  ? {
                      background: 'var(--accent-dim)',
                      border: '1px solid var(--accent)',
                      color: 'var(--accent)',
                    }
                  : {
                      background: 'var(--surface)',
                      border: '1px solid var(--border-strong)',
                      color: 'var(--text-muted)',
                    }
              }
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {subs.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {subs.map((sub, i) => (
            <SubscriptionCard
              key={sub.id}
              sub={sub}
              onEdit={onEdit}
              animDelay={i * 40}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function EmptyState() {
  return (
    <div
      className="rounded-2xl py-16 flex flex-col items-center justify-center text-center"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="text-4xl mb-3">📡</div>
      <div className="font-bold text-base" style={{ color: 'var(--text)' }}>
        No subscriptions tracked
      </div>
      <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
        Add your first subscription to start the radar.
      </div>
    </div>
  )
}
