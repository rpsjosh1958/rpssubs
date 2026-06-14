import { useState } from 'react'
import { Plus, Search, CalendarDays, BellRing } from 'lucide-react'
import { brandLogoUrl } from '../hooks/useBrandfetch'
import type { Theme } from '../types'

// Pre-computed angular trail segments: fade from sweep line backward 90°
const TRAIL_SEGS = (() => {
  const N = 32
  const R = 86
  return Array.from({ length: N }, (_, i) => {
    const a0 = (i / N) * (-Math.PI / 2)
    const a1 = ((i + 1) / N) * (-Math.PI / 2)
    const x0 = +(R * Math.cos(a0)).toFixed(3)
    const y0 = +(R * Math.sin(a0)).toFixed(3)
    const x1 = +(R * Math.cos(a1)).toFixed(3)
    const y1 = +(R * Math.sin(a1)).toFixed(3)
    const t = 1 - i / N
    return { d: `M 0 0 L ${x0} ${y0} A ${R} ${R} 0 0 0 ${x1} ${y1} Z`, opacity: +(t * t * 0.22).toFixed(3) }
  })
})()

interface Props {
  onAdd: () => void
  theme: Theme
}

const STEPS = [
  {
    icon: Search,
    number: '01',
    title: 'Search a brand',
    desc: "Type any service name and we'll pull the logo and info instantly.",
  },
  {
    icon: CalendarDays,
    number: '02',
    title: 'Set billing date',
    desc: 'Pick your next charge date and how often it repeats.',
  },
  {
    icon: BellRing,
    number: '03',
    title: 'Stay ahead',
    desc: 'Color-coded countdowns warn you days before each charge hits.',
  },
]

const GHOST_BRANDS = [
  { domain: 'playstation.com',        initials: 'XB', color: '#107C10' },
  { domain: 'applemusic.com',     initials: 'SP', color: '#1DB954' },
  { domain: 'anchor.fm', initials: 'AM', color: '#FA2D48' },
  { domain: 'deezer.com',      initials: 'iC', color: '#0A84FF' },
  { domain: 'netflix.com',     initials: 'NF', color: '#E50914' },
]

function GhostLogo({
  domain, initials, color, theme, style,
}: {
  domain: string; initials: string; color: string; theme: Theme; style?: React.CSSProperties
}) {
  const [failed, setFailed] = useState(false)
  return (
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: 11,
        background: color + '12',
        border: `1px solid ${color}22`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...style,
      }}
    >
      {failed ? (
        <span style={{ fontSize: 11, fontWeight: 800, color: color + '66', letterSpacing: '0.02em' }}>
          {initials}
        </span>
      ) : (
        <img
          src={brandLogoUrl(domain, theme, 80)}
          alt={initials}
          width={28}
          height={28}
          onError={() => setFailed(true)}
          style={{ objectFit: 'contain' }}
        />
      )}
    </div>
  )
}

export function EmptyState({ onAdd, theme }: Props) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center px-4"
      style={{ minHeight: 'calc(100vh - 120px)', paddingTop: 40, paddingBottom: 60 }}
    >
      {/* Radar + ghost brand logos */}
      <div className="relative mb-12" style={{ width: 220, height: 220 }}>
        {GHOST_BRANDS.map(({ domain, initials, color }, i) => {
          const angle = (i / GHOST_BRANDS.length) * 2 * Math.PI - Math.PI / 2
          const r = 94
          const x = Math.cos(angle) * r
          const y = Math.sin(angle) * r
          return (
            <div
              key={domain}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
            >
              <GhostLogo
                domain={domain}
                initials={initials}
                color={color}
                theme={theme}
                style={{
                  animation: `empty-breath ${2.6 + i * 0.55}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.28}s`,
                }}
              />
            </div>
          )
        })}

        {/* SVG radar */}
        <svg width="220" height="220" viewBox="0 0 220 220" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <linearGradient id="sweep-line-grad" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          <circle cx="110" cy="110" r="88" stroke="var(--accent)" strokeWidth="1" fill="none" opacity="0.07" />
          <circle cx="110" cy="110" r="62" stroke="var(--accent)" strokeWidth="1" fill="none" opacity="0.11" />
          <circle cx="110" cy="110" r="36" stroke="var(--accent)" strokeWidth="1.5" fill="none" opacity="0.16" />

          <g transform="translate(110, 110)">
            <g style={{ animation: 'radar-sweep 4s linear infinite', transformOrigin: '0 0' }}>
              {TRAIL_SEGS.map(({ d, opacity }, i) => (
                <path key={i} d={d} fill="var(--accent)" opacity={opacity} />
              ))}
              <rect x="0" y="-1" width="86" height="2" fill="url(#sweep-line-grad)" />
            </g>
          </g>

          <circle cx="110" cy="110" r="5" fill="var(--accent)" opacity="0.9" />
        </svg>
      </div>

      {/* Headline */}
      <h2
        className="countdown"
        style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: 8 }}
      >
        Nothing on radar.
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 340, lineHeight: 1.65, marginBottom: 44 }}>
        Add a subscription or trial and track every charge from one place.
      </p>

      {/* Step cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          width: '100%',
          maxWidth: 560,
          marginBottom: 44,
        }}
      >
        {STEPS.map((step, i) => {
          const Icon = step.icon
          return (
            <div
              key={step.number}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '18px 14px',
                textAlign: 'left',
                animation: 'card-in 0.4s cubic-bezier(0.2,0.7,0.3,1) both',
                animationDelay: `${0.08 + i * 0.1}s`,
              }}
            >
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.22em',
                  color: 'var(--accent)',
                  opacity: 0.55,
                  marginBottom: 11,
                }}
              >
                {step.number}
              </div>
              <Icon size={15} style={{ color: 'var(--accent)', marginBottom: 9, display: 'block' }} />
              <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.82rem', marginBottom: 5 }}>
                {step.title}
              </div>
              <div style={{ color: 'var(--text-faint)', fontSize: '0.74rem', lineHeight: 1.55 }}>
                {step.desc}
              </div>
            </div>
          )
        })}
      </div>

      {/* CTA */}
      <button
        onClick={onAdd}
        className="active:scale-95"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '13px 26px',
          borderRadius: 14,
          border: '1px solid var(--accent)',
          background: 'var(--accent-dim)',
          color: 'var(--accent)',
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: 'pointer',
          transition: 'box-shadow 0.15s, transform 0.15s',
          boxShadow: '0 0 22px color-mix(in srgb, var(--accent) 18%, transparent)',
        }}
      >
        <Plus size={16} />
        Add your first subscription
      </button>
    </div>
  )
}
