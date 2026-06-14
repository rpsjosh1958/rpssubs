import type { Currency } from '../types'

export const CURRENCIES: Record<Currency, { symbol: string; name: string }> = {
  GHS: { symbol: '₵', name: 'Ghana Cedi' },
  USD: { symbol: '$', name: 'US Dollar' },
  GBP: { symbol: '£', name: 'British Pound' },
  EUR: { symbol: '€', name: 'Euro' },
  NGN: { symbol: '₦', name: 'Nigerian Naira' },
  ZAR: { symbol: 'R', name: 'South African Rand' },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling' },
  CAD: { symbol: 'CA$', name: 'Canadian Dollar' },
  INR: { symbol: '₹', name: 'Indian Rupee' },
}

export function formatAmount(amount: number, currency: Currency): string {
  const { symbol } = CURRENCIES[currency]
  return `${symbol}${amount % 1 === 0 ? amount : amount.toFixed(2)}`
}
