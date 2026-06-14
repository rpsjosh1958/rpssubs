import { useState, useEffect, useMemo } from 'react'
import { periodDays } from './lib/urgency'
import type { Subscription, Theme } from './types'
import { useSubscriptions } from './hooks/useSubscriptions'
import { Header } from './components/Header'
import { HeroCard } from './components/HeroCard'
import { SubscriptionGrid } from './components/SubscriptionGrid'
import { AddEditModal } from './components/AddEditModal'

function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem('neonsubs:theme') as Theme) ?? 'dark'
    } catch {
      return 'dark'
    }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('neonsubs:theme', theme)
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  return [theme, toggle]
}

export default function App() {
  const [theme, toggleTheme] = useTheme()
  const { subs, sort, setSort, nextCharge, add, update, remove } = useSubscriptions()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSub, setEditingSub] = useState<Subscription | null>(null)

  function openAdd() {
    setEditingSub(null)
    setModalOpen(true)
  }

  function openEdit(sub: Subscription) {
    setEditingSub(sub)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingSub(null)
  }

  const { totalGHSMonth, totalUSDMonth } = useMemo(() => {
    function monthlyAmount(sub: Subscription): number {
      const days = periodDays(sub.frequencyEvery, sub.frequencyUnit)
      return (sub.amount / days) * 30.44
    }
    return {
      totalGHSMonth: subs.filter((s) => s.currency === 'GHS').reduce((acc, s) => acc + monthlyAmount(s), 0),
      totalUSDMonth: subs.filter((s) => s.currency === 'USD').reduce((acc, s) => acc + monthlyAmount(s), 0),
    }
  }, [subs])

  return (
    <div
      className={`min-h-screen bg-neon-grid ${theme === 'dark' ? 'scanlines' : ''}`}
      style={{ background: 'var(--bg)' }}
    >
      <Header
        theme={theme}
        onThemeToggle={toggleTheme}
        onAdd={openAdd}
        totalGHSMonth={totalGHSMonth}
        totalUSDMonth={totalUSDMonth}
        activeSubs={subs.length}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {nextCharge && (
          <HeroCard
            sub={nextCharge}
            totalGHSMonth={totalGHSMonth}
            totalUSDMonth={totalUSDMonth}
            activeSubs={subs.length}
            onEdit={openEdit}
          />
        )}

        <SubscriptionGrid
          subs={subs}
          sort={sort}
          onSortChange={setSort}
          onEdit={openEdit}
        />
      </main>

      {modalOpen && (
        <AddEditModal
          editing={editingSub}
          onSave={add}
          onUpdate={update}
          onDelete={remove}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
