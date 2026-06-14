import { useState, useCallback } from 'react'
import type { Subscription, SortMode } from '../types'
import { loadSubscriptions, saveSubscriptions } from '../lib/storage'
import { daysUntil, advanceToNextCharge } from '../lib/urgency'

function normalize(sub: Subscription): Subscription {
  return {
    ...sub,
    nextChargeDate: advanceToNextCharge(sub.nextChargeDate, sub.frequencyEvery, sub.frequencyUnit),
  }
}

function sortSubs(subs: Subscription[], mode: SortMode): Subscription[] {
  return [...subs].sort((a, b) => {
    if (mode === 'soonest') return daysUntil(a.nextChargeDate) - daysUntil(b.nextChargeDate)
    return b.amount - a.amount
  })
}

export function useSubscriptions() {
  const [subs, setSubs] = useState<Subscription[]>(() => loadSubscriptions().map(normalize))
  const [sort, setSort] = useState<SortMode>('soonest')

  const persist = useCallback((updated: Subscription[]) => {
    setSubs(updated)
    saveSubscriptions(updated)
  }, [])

  const add = useCallback(
    (sub: Omit<Subscription, 'id' | 'createdAt'>) => {
      const next = normalize({ ...sub, id: crypto.randomUUID(), createdAt: new Date().toISOString() })
      persist([...subs, next])
    },
    [subs, persist],
  )

  const update = useCallback(
    (id: string, patch: Partial<Subscription>) => {
      const updated = subs.map((s) => (s.id === id ? normalize({ ...s, ...patch }) : s))
      persist(updated)
    },
    [subs, persist],
  )

  const remove = useCallback(
    (id: string) => persist(subs.filter((s) => s.id !== id)),
    [subs, persist],
  )

  return {
    subs: sortSubs(subs, sort),
    sort,
    setSort,
    nextCharge: sortSubs(subs, 'soonest')[0] ?? null,
    add,
    update,
    remove,
  }
}
