import { Sun, Moon, Plus } from 'lucide-react'
import type { Theme } from '../types'

interface Props {
  theme: Theme
  onThemeToggle: () => void
  onAdd: () => void
  totalGHSMonth: number
  totalUSDMonth: number
  activeSubs: number
}

export function Header({ theme, onThemeToggle, onAdd, totalGHSMonth, totalUSDMonth }: Props) {
  const isDark = theme === 'dark'

  return (
    <header
      className="sticky top-0 z-40 px-4 sm:px-6 py-4"
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border-strong)',
              boxShadow: isDark ? 'var(--accent-glow)' : 'none',
            }}
          >
            {/* Radar icon */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="9" stroke="var(--accent)" strokeWidth="1.5" opacity="0.4" />
              <circle cx="11" cy="11" r="5.5" stroke="var(--accent)" strokeWidth="1.5" opacity="0.7" />
              <circle cx="11" cy="11" r="2" fill="var(--accent)" />
              <line
                x1="11" y1="11" x2="19" y2="5"
                stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"
                opacity="0.9"
              />
            </svg>
          </div>
          <div>
            <div className="text-base font-black tracking-tight leading-none" style={{ color: 'var(--text)' }}>
              RPS<span style={{ color: 'var(--accent)' }}>SUBS</span>
            </div>
            <div className="text-[10px] font-semibold tracking-[0.18em] uppercase mt-0.5" style={{ color: 'var(--text-faint)' }}>
              Subscription Radar
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Stats (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-2">
            {totalGHSMonth > 0 && (
              <StatChip label="GHS / MO" value={`₵${totalGHSMonth.toFixed(2)}`} isDark={isDark} />
            )}
            {totalUSDMonth > 0 && (
              <StatChip label="USD / MO" value={`$${totalUSDMonth.toFixed(2)}`} isDark={isDark} />
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={onThemeToggle}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-muted)',
            }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Add button */}
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-95"
            style={{
              background: 'var(--surface-2)',
              border: `1px solid var(--accent)`,
              color: 'var(--accent)',
              boxShadow: isDark ? '0 0 12px rgba(0,229,255,0.2)' : 'none',
            }}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add subscription</span>
          </button>
        </div>
      </div>
    </header>
  )
}

function StatChip({ label, value, isDark, accent }: { label: string; value: string; isDark: boolean; accent?: boolean }) {
  return (
    <div
      className="px-3 py-1.5 rounded-lg"
      style={{
        background: accent ? 'var(--accent-dim)' : 'var(--surface)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="text-[9px] font-bold tracking-[0.15em] uppercase" style={{ color: isDark || accent ? 'var(--text-faint)' : 'var(--text-faint)' }}>
        {label}
      </div>
      <div
        className="text-sm font-bold tabular-nums"
        style={{ color: accent ? 'var(--accent)' : 'var(--text)', marginTop: 1 }}
      >
        {value}
      </div>
    </div>
  )
}
