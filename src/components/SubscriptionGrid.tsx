import { useState, useRef, useEffect } from 'react'
import { Search, X, AlignJustify, LayoutGrid, Grid3X3 } from 'lucide-react'
import type { Subscription, GridMode } from '../types'
import { daysUntil, getUrgency, URGENCY_COLORS_RAW } from '../lib/urgency'
import { formatAmount } from '../lib/currencies'
import { BrandTile } from './BrandTile'
import { SubscriptionCard } from './SubscriptionCard'

interface Props {
  subs: Subscription[]
  onEdit: (sub: Subscription) => void
}

const GRID_MODES: { mode: GridMode; icon: React.ReactNode; label: string }[] = [
  { mode: 'list',  icon: <AlignJustify size={13} />, label: 'List' },
  { mode: 'three', icon: <LayoutGrid size={13} />,   label: '3-col' },
  { mode: 'four',  icon: <Grid3X3 size={13} />,      label: '4-col' },
]

export function SubscriptionGrid({ subs, onEdit }: Props) {
  const [gridMode, setGridMode] = useState<GridMode>('list')
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isSearching) inputRef.current?.focus()
  }, [isSearching])

  function closeSearch() {
    setIsSearching(false)
    setSearchQuery('')
  }

  const filtered = searchQuery.trim()
    ? subs.filter((s) => s.serviceName.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : subs

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[10px] font-bold tracking-[0.2em] uppercase"
          style={{ color: 'var(--text-faint)' }}
        >
          {isSearching && searchQuery
            ? `${filtered.length} result${filtered.length === 1 ? '' : 's'}`
            : 'All Subscriptions'}
        </span>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Grid toggles — always visible */}
          {GRID_MODES.map(({ mode, icon, label }) => (
            <button
              key={mode}
              onClick={() => setGridMode(mode)}
              title={label}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
              style={
                gridMode === mode
                  ? { background: 'var(--accent-dim)', border: '1px solid var(--accent)', color: 'var(--accent)' }
                  : { background: 'var(--surface-2)', border: '1px solid var(--border-strong)', color: 'var(--text-muted)' }
              }
            >
              {icon}
            </button>
          ))}

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: 'var(--border-strong)', margin: '0 4px' }} />

          {/* Search — expands inline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', transition: 'width 0.22s ease', width: isSearching ? 204 : 28 }}>
            {/* Search pill — morphs from icon-button to input */}
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                height: 28, flexShrink: 0,
                width: isSearching ? 160 : 28,
                borderRadius: 8,
                padding: isSearching ? '0 8px' : '0',
                background: 'var(--surface-2)',
                border: '1px solid var(--border-strong)',
                cursor: isSearching ? 'default' : 'pointer',
                transition: 'width 0.22s ease, padding 0.22s ease',
                overflow: 'hidden',
                justifyContent: 'flex-start',
              }}
              onClick={!isSearching ? () => setIsSearching(true) : undefined}
            >
              <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0, marginLeft: isSearching ? 0 : 7 }} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent', outline: 'none', border: 'none',
                  color: 'var(--text)', fontSize: 13,
                  width: isSearching ? '100%' : 0,
                  opacity: isSearching ? 1 : 0,
                  transition: 'opacity 0.18s ease',
                  minWidth: 0,
                }}
              />
              {isSearching && searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ color: 'var(--text-faint)', flexShrink: 0, display: 'flex' }}>
                  <X size={11} />
                </button>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={closeSearch}
              style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                border: '1px solid var(--border-strong)',
                background: 'var(--surface-2)', color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: isSearching ? 1 : 0,
                transition: 'opacity 0.15s ease',
                pointerEvents: isSearching ? 'auto' : 'none',
              }}
            >
              <X size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <NoResults query={searchQuery} />
      ) : gridMode === 'list' ? (
        <div className="flex flex-col gap-4">
          {filtered.map((sub, i) => (
            <SubscriptionCard key={sub.id} sub={sub} onEdit={onEdit} animDelay={i * 40} />
          ))}
        </div>
      ) : (
        <div
          className={`grid gap-3 ${gridMode === 'three' ? 'grid-cols-3 sm:grid-cols-3 lg:grid-cols-3' : 'grid-cols-4 sm:grid-cols-4 lg:grid-cols-4'}`}
        >
          {filtered.map((sub, i) => (
            <CompactCard key={sub.id} sub={sub} onEdit={onEdit} cols={gridMode === 'three' ? 3 : 4} animDelay={i * 30} />
          ))}
        </div>
      )}
    </section>
  )
}

// ── Compact grid card ─────────────────────────────────────────────────────────

function CompactCard({ sub, onEdit, cols, animDelay }: { sub: Subscription; onEdit: (s: Subscription) => void; cols: 3 | 4; animDelay: number }) {
  const days = daysUntil(sub.nextChargeDate)
  const urgency = getUrgency(sub)
  const color = URGENCY_COLORS_RAW[urgency]
  const logoSize = cols === 3 ? 52 : 40
  const logoRounded = cols === 3 ? 13 : 10

  return (
    <div
      className="card-in relative cursor-pointer rounded-2xl flex flex-col items-center text-center transition-all duration-200 hover:scale-[1.02]"
      style={{
        animationDelay: `${animDelay}ms`,
        padding: cols === 3 ? '14px 10px' : '10px 6px',
        background: 'var(--surface)',
        border: `1px solid ${color}38`,
        boxShadow: `0 0 0 0 ${color}`,
      }}
      onClick={() => onEdit(sub)}
    >
      {/* Trial dot */}
      {sub.isTrial && (
        <span
          className="absolute top-2 right-2 w-2 h-2 rounded-full"
          style={{ background: '#FF00FF' }}
        />
      )}

      <div className="relative">
        <BrandTile domain={sub.domain} name={sub.serviceName} size={logoSize} rounded={logoRounded} />
      </div>

      <div
        className="font-bold truncate w-full mt-2"
        style={{ fontSize: cols === 3 ? 12 : 10, color: 'var(--text)' }}
      >
        {sub.serviceName}
      </div>

      <div
        className="countdown font-black leading-none mt-1.5"
        style={{ fontSize: cols === 3 ? '1.55rem' : '1.1rem', color }}
      >
        {Math.max(0, days)}{cols === 4 ? 'd' : ''}
      </div>

      {cols === 3 && (
        <>
          <div className="text-[7px] font-bold tracking-[0.18em] uppercase mt-0.5" style={{ color: 'var(--text-faint)' }}>
            DAYS
          </div>
          <div className="text-[10px] font-semibold mt-1.5" style={{ color: 'var(--text-muted)' }}>
            {formatAmount(sub.amount, sub.currency)}
          </div>
        </>
      )}
    </div>
  )
}

// ── No results ────────────────────────────────────────────────────────────────

function NoResults({ query }: { query: string }) {
  return (
    <div
      className="rounded-2xl py-14 flex flex-col items-center justify-center text-center"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <Search size={36} style={{ color: 'var(--text-faint)', marginBottom: 12 }} />
      <div className="font-semibold text-base" style={{ color: 'var(--text-muted)' }}>
        No results for "{query}"
      </div>
    </div>
  )
}
