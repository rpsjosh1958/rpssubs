import type { Subscription, FrequencyUnit } from '../types'

const KEY = 'neonsubs:v1'

/** Migrate old data that used `frequency: 'weekly'|'monthly'|'annual'` */
function migrate(raw: any): Subscription {
  if (raw.frequencyEvery !== undefined) return raw as Subscription
  const map: Record<string, [number, FrequencyUnit]> = {
    weekly: [1, 'weeks'],
    monthly: [1, 'months'],
    annual: [1, 'years'],
  }
  const [every, unit] = map[raw.frequency as string] ?? [1, 'months']
  const { frequency: _f, ...rest } = raw
  return { ...rest, frequencyEvery: every, frequencyUnit: unit } as Subscription
}

export function loadSubscriptions(): Subscription[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return (JSON.parse(raw) as any[]).map(migrate)
  } catch {
    return []
  }
}

export function saveSubscriptions(subs: Subscription[]): void {
  localStorage.setItem(KEY, JSON.stringify(subs))
}
