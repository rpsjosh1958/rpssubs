import { useState, useEffect, useRef } from 'react'
import { X, Trash2, Search, Loader2, Check } from 'lucide-react'
import type { Subscription, Currency, FrequencyUnit } from '../types'
import { CURRENCIES } from '../lib/currencies'
import { useBrandfetchSearch } from '../hooks/useBrandfetch'
import { BrandTile } from './BrandTile'
import { advanceToNextCharge } from '../lib/urgency'

interface Props {
  editing?: Subscription | null
  onSave: (data: Omit<Subscription, 'id' | 'createdAt'>) => void
  onUpdate: (id: string, patch: Partial<Subscription>) => void
  onDelete: (id: string) => void
  onClose: () => void
}

// Preset pills — covers the most common cases
const FREQ_PRESETS: { label: string; every: number; unit: FrequencyUnit }[] = [
  { label: 'Weekly', every: 1, unit: 'weeks' },
  { label: 'Monthly', every: 1, unit: 'months' },
  { label: '3 months', every: 3, unit: 'months' },
  { label: '6 months', every: 6, unit: 'months' },
  { label: 'Annual', every: 1, unit: 'years' },
]

const UNIT_OPTIONS: { value: FrequencyUnit; label: string }[] = [
  { value: 'days', label: 'days' },
  { value: 'weeks', label: 'weeks' },
  { value: 'months', label: 'months' },
  { value: 'years', label: 'years' },
]

const DEFAULT_FORM = {
  serviceName: '',
  domain: '',
  amount: '',
  currency: 'GHS' as Currency,
  frequencyEvery: 1,
  frequencyUnit: 'months' as FrequencyUnit,
  nextChargeDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  isTrial: false,
  trialEndDate: '',
  reminderDays: 2,
  notes: '',
}

export function AddEditModal({ editing, onSave, onUpdate, onDelete, onClose }: Props) {
  const [form, setForm] = useState(
    editing
      ? {
          serviceName: editing.serviceName,
          domain: editing.domain ?? '',
          amount: String(editing.amount),
          currency: editing.currency,
          frequencyEvery: editing.frequencyEvery,
          frequencyUnit: editing.frequencyUnit,
          nextChargeDate: editing.nextChargeDate,
          isTrial: editing.isTrial,
          trialEndDate: editing.trialEndDate ?? '',
          reminderDays: editing.reminderDays,
          notes: editing.notes ?? '',
        }
      : DEFAULT_FORM,
  )

  const [brandSearch, setBrandSearch] = useState(editing?.serviceName ?? '')
  const [searchOpen, setSearchOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const { data: searchResults = [], isFetching } = useBrandfetchSearch(brandSearch)

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    function handler(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function applyPreset(every: number, unit: FrequencyUnit) {
    setForm((f) => ({ ...f, frequencyEvery: every, frequencyUnit: unit }))
  }

  function isPresetActive(every: number, unit: FrequencyUnit) {
    return form.frequencyEvery === every && form.frequencyUnit === unit
  }

  function selectBrand(result: { name: string | null; domain: string; icon: string | null }) {
    const name = result.name ?? result.domain
    set('serviceName', name)
    set('domain', result.domain)
    setBrandSearch(name)
    setSearchOpen(false)
  }

  function isValid() {
    return form.serviceName.trim().length > 0 && parseFloat(form.amount) > 0 && form.nextChargeDate.length > 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid()) return

    const data: Omit<Subscription, 'id' | 'createdAt'> = {
      serviceName: form.serviceName.trim(),
      domain: form.domain || undefined,
      amount: parseFloat(form.amount),
      currency: form.currency,
      frequencyEvery: form.frequencyEvery,
      frequencyUnit: form.frequencyUnit,
      nextChargeDate: advanceToNextCharge(form.nextChargeDate, form.frequencyEvery, form.frequencyUnit),
      isTrial: form.isTrial,
      trialEndDate: form.isTrial && form.trialEndDate ? form.trialEndDate : undefined,
      reminderDays: form.reminderDays,
      notes: form.notes || undefined,
    }

    editing ? onUpdate(editing.id, data) : onSave(data)
    onClose()
  }

  return (
    <div
      className="modal-backdrop fade-in"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full sm:max-w-lg rounded-t-[22px] sm:rounded-2xl"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-strong)',
          maxHeight: '92dvh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle — mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border-strong)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-bold text-base" style={{ color: 'var(--text)' }}>
            {editing ? 'Edit Subscription' : 'Add Subscription'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ color: 'var(--text-faint)', background: 'var(--surface-2)' }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-5 space-y-4">
          {/* Brand search */}
          <div ref={searchRef} className="relative">
            <Label>Service / Brand</Label>
            <div className="relative">
              <input
                type="text"
                value={brandSearch}
                placeholder="Search Netflix, Spotify, OpenAI…"
                className="w-full rounded-xl px-4 py-3 pr-10 text-sm font-medium outline-none"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border-strong)', color: 'var(--text)' }}
                onChange={(e) => { setBrandSearch(e.target.value); set('serviceName', e.target.value); set('domain', ''); setSearchOpen(true) }}
                onFocus={() => setSearchOpen(true)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-faint)' }}>
                {isFetching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
              </div>
            </div>
            {searchOpen && searchResults.length > 0 && (
              <div
                className="absolute z-10 w-full mt-1.5 rounded-xl overflow-hidden py-1"
                style={{ background: 'var(--surface)', border: '1px solid var(--border-strong)', boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}
              >
                {searchResults.slice(0, 6).map((r) => (
                  <button
                    key={r.brandId}
                    type="button"
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                    style={{ color: 'var(--text)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    onClick={() => selectBrand(r)}
                  >
                    <BrandTile domain={r.domain} name={r.name ?? r.domain} size={32} rounded={8} />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{r.name ?? r.domain}</div>
                      <div className="text-xs truncate" style={{ color: 'var(--text-faint)' }}>{r.domain}</div>
                    </div>
                    {r.claimed && <Check size={13} className="ml-auto flex-shrink-0" style={{ color: 'var(--clr-safe)' }} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Amount + Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Amount</Label>
              <input
                type="number" min="0" step="0.01" value={form.amount} placeholder="0.00"
                className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border-strong)', color: 'var(--text)' }}
                onChange={(e) => set('amount', e.target.value)}
              />
            </div>
            <div>
              <Label>Currency</Label>
              <select
                value={form.currency}
                className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none appearance-none cursor-pointer"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border-strong)', color: 'var(--text)' }}
                onChange={(e) => set('currency', e.target.value as Currency)}
              >
                {(Object.keys(CURRENCIES) as Currency[]).map((c) => (
                  <option key={c} value={c}>{CURRENCIES[c].symbol} {c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Frequency */}
          <div>
            <Label>Billing frequency</Label>
            {/* Preset pills */}
            <div className="flex flex-wrap gap-2 mb-2">
              {FREQ_PRESETS.map((p) => {
                const active = isPresetActive(p.every, p.unit)
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPreset(p.every, p.unit)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150"
                    style={
                      active
                        ? { background: 'var(--accent-dim)', border: '1px solid var(--accent)', color: 'var(--accent)' }
                        : { background: 'var(--surface-2)', border: '1px solid var(--border-strong)', color: 'var(--text-muted)' }
                    }
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
            {/* Custom "every N unit" row */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold flex-shrink-0" style={{ color: 'var(--text-faint)' }}>Every</span>
              <input
                type="number"
                min="1"
                max="365"
                value={form.frequencyEvery}
                className="w-16 rounded-lg px-3 py-2 text-sm font-bold text-center outline-none"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border-strong)', color: 'var(--text)' }}
                onChange={(e) => {
                  const v = Math.max(1, parseInt(e.target.value) || 1)
                  setForm((f) => ({ ...f, frequencyEvery: v }))
                }}
              />
              <select
                value={form.frequencyUnit}
                className="flex-1 rounded-lg px-3 py-2 text-sm font-medium outline-none appearance-none cursor-pointer"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border-strong)', color: 'var(--text)' }}
                onChange={(e) => setForm((f) => ({ ...f, frequencyUnit: e.target.value as FrequencyUnit }))}
              >
                {UNIT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Next charge date */}
          <div>
            <Label>{form.isTrial ? 'Trial end date' : 'Next charge date'}</Label>
            <input
              type="date"
              value={form.isTrial ? form.trialEndDate : form.nextChargeDate}
              className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border-strong)', color: 'var(--text)' }}
              onChange={(e) => {
                if (form.isTrial) { set('trialEndDate', e.target.value); set('nextChargeDate', e.target.value) }
                else set('nextChargeDate', e.target.value)
              }}
            />
          </div>

          {/* Trial toggle */}
          <div
            className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Free trial</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>Remind me to cancel before it bills</div>
            </div>
            <button
              type="button"
              onClick={() => set('isTrial', !form.isTrial)}
              className="relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0"
              style={{ background: form.isTrial ? 'var(--clr-trial)' : 'var(--border-strong)' }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
                style={{ transform: form.isTrial ? 'translateX(20px)' : 'translateX(0)' }}
              />
            </button>
          </div>

          {/* Reminder days */}
          <div>
            <Label>Remind me (days before charge)</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 5, 7].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => set('reminderDays', d)}
                  className="flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-150"
                  style={
                    form.reminderDays === d
                      ? { background: 'var(--accent-dim)', border: '1px solid var(--accent)', color: 'var(--accent)' }
                      : { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }
                  }
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes (optional)</Label>
            <textarea
              value={form.notes}
              placeholder="Account email, plan name, etc."
              rows={2}
              className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none resize-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border-strong)', color: 'var(--text)' }}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="pt-1 space-y-2">
            {/* Mobile: submit spans full width */}
            <button
              type="submit" disabled={!isValid()}
              className="sm:hidden w-full py-3 rounded-xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)', color: 'var(--accent)' }}
            >
              {editing ? 'Save changes' : 'Add subscription'}
            </button>

            <div className="flex items-center gap-3">
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirmDelete) { onDelete(editing.id); onClose() }
                    else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000) }
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: confirmDelete ? 'rgba(220,38,38,0.12)' : 'var(--surface-2)',
                    border: confirmDelete ? '1px solid rgba(220,38,38,0.5)' : '1px solid var(--border)',
                    color: confirmDelete ? '#EF4444' : 'var(--text-faint)',
                  }}
                >
                  <Trash2 size={14} />
                  {confirmDelete ? 'Confirm delete' : 'Delete'}
                </button>
              )}
              <div className="hidden sm:block flex-1" />
              <button
                type="button" onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
              {/* Desktop only — on mobile the full-width button above is used */}
              <button
                type="submit" disabled={!isValid()}
                className="hidden sm:block px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)', color: 'var(--accent)' }}
              >
                {editing ? 'Save changes' : 'Add subscription'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold tracking-wide uppercase mb-1.5" style={{ color: 'var(--text-faint)' }}>
      {children}
    </label>
  )
}
