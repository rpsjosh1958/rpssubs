import type { Subscription, FrequencyUnit } from '../types'

const KEY = 'neonsubs:v1'

function daysFromNow(n: number): string {
  return new Date(Date.now() + n * 86400000).toISOString().split('T')[0]
}

const SEED: Subscription[] = [
  {
    id: '1', serviceName: 'Netflix', domain: 'netflix.com',
    amount: 75, currency: 'GHS', frequencyEvery: 1, frequencyUnit: 'months',
    nextChargeDate: daysFromNow(2), isTrial: false, reminderDays: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2', serviceName: 'ChatGPT Plus', domain: 'openai.com',
    amount: 20, currency: 'USD', frequencyEvery: 1, frequencyUnit: 'months',
    nextChargeDate: daysFromNow(5), isTrial: true, trialEndDate: daysFromNow(5),
    reminderDays: 2, createdAt: new Date().toISOString(),
  },
  {
    id: '3', serviceName: 'Disney+', domain: 'disneyplus.com',
    amount: 59.99, currency: 'GHS', frequencyEvery: 1, frequencyUnit: 'months',
    nextChargeDate: daysFromNow(7), isTrial: false, reminderDays: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4', serviceName: 'Spotify Premium', domain: 'spotify.com',
    amount: 5.99, currency: 'USD', frequencyEvery: 1, frequencyUnit: 'months',
    nextChargeDate: daysFromNow(9), isTrial: false, reminderDays: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: '5', serviceName: 'YouTube Premium', domain: 'youtube.com',
    amount: 25, currency: 'GHS', frequencyEvery: 1, frequencyUnit: 'months',
    nextChargeDate: daysFromNow(12), isTrial: false, reminderDays: 2,
    createdAt: new Date().toISOString(),
  },
]

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
    if (!raw) {
      saveSubscriptions(SEED)
      return SEED
    }
    return (JSON.parse(raw) as any[]).map(migrate)
  } catch {
    return SEED
  }
}

export function saveSubscriptions(subs: Subscription[]): void {
  localStorage.setItem(KEY, JSON.stringify(subs))
}
