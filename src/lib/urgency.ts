import type { UrgencyLevel, Subscription, FrequencyUnit } from '../types'

export function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function getUrgency(sub: Subscription): UrgencyLevel {
  if (sub.isTrial) return 'trial'
  const days = daysUntil(sub.nextChargeDate)
  if (days <= 3) return 'critical'
  if (days <= 7) return 'warning'
  if (days <= 14) return 'soon'
  return 'safe'
}

export const URGENCY_COLORS_RAW: Record<UrgencyLevel, string> = {
  critical: '#FF4500',
  warning: '#FF9500',
  soon: '#00E5FF',
  safe: '#00FF9E',
  trial: '#FF00FF',
}

/** Approximate period in days for progress bar and monthly cost calc */
export function periodDays(every: number, unit: FrequencyUnit): number {
  if (unit === 'days') return every
  if (unit === 'weeks') return every * 7
  if (unit === 'months') return every * 30.44
  return every * 365.25
}

export function freqLabel(every: number, unit: FrequencyUnit): string {
  if (every === 1) {
    if (unit === 'days') return 'Daily'
    if (unit === 'weeks') return 'Weekly'
    if (unit === 'months') return 'Monthly'
    if (unit === 'years') return 'Annual'
  }
  return `Every ${every} ${unit}`
}

export function advanceToNextCharge(dateStr: string, every: number, unit: FrequencyUnit): string {
  const date = new Date(dateStr)
  date.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  while (date <= today) {
    if (unit === 'days') date.setDate(date.getDate() + every)
    else if (unit === 'weeks') date.setDate(date.getDate() + every * 7)
    else if (unit === 'months') date.setMonth(date.getMonth() + every)
    else date.setFullYear(date.getFullYear() + every)
  }
  return date.toISOString().split('T')[0]
}
