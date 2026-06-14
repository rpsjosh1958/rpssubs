import { useState } from 'react'
import { brandLogoUrl } from '../hooks/useBrandfetch'

interface Props {
  domain?: string
  name: string
  size?: number
  rounded?: number
}

// Deterministic color from service name
function nameToColor(name: string): string {
  const palette = [
    '#E50914', '#1DB954', '#0033A0', '#FF9500',
    '#FF00FF', '#7B5EA7', '#00A2ED', '#FF6900',
    '#00C896', '#6441A5', '#FF0000', '#FFFC00',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return palette[hash % palette.length]
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return name.slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

export function BrandTile({ domain, name, size = 48, rounded = 12 }: Props) {
  const [imgFailed, setImgFailed] = useState(false)
  const color = nameToColor(name)

  if (domain && !imgFailed) {
    return (
      <img
        src={brandLogoUrl(domain)}
        alt={name}
        width={size}
        height={size}
        style={{ width: size, height: size, borderRadius: rounded, objectFit: 'contain', background: '#fff', flexShrink: 0 }}
        onError={() => setImgFailed(true)}
      />
    )
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: rounded,
        background: color,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'ui-monospace, monospace',
        fontWeight: 800,
        fontSize: size * 0.33,
        color: '#fff',
        letterSpacing: '-0.03em',
        userSelect: 'none',
      }}
    >
      {initials(name)}
    </div>
  )
}
