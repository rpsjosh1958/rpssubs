export type Currency = 'GHS' | 'USD' | 'GBP' | 'EUR' | 'NGN' | 'ZAR' | 'KES' | 'CAD' | 'INR'
export type FrequencyUnit = 'days' | 'weeks' | 'months' | 'years'
export type UrgencyLevel = 'critical' | 'warning' | 'soon' | 'safe' | 'trial'

export interface Subscription {
  id: string
  serviceName: string
  domain?: string
  amount: number
  currency: Currency
  frequencyEvery: number     // e.g. 3
  frequencyUnit: FrequencyUnit // e.g. 'months'
  nextChargeDate: string     // ISO date
  isTrial: boolean
  trialEndDate?: string      // ISO date
  reminderDays: number
  notes?: string
  createdAt: string
}

export interface BrandfetchSearchResult {
  icon: string | null
  name: string | null
  domain: string
  claimed: boolean
  brandId: string
}

export interface BrandfetchBrand {
  id: string
  name: string
  domain: string
  logos: BrandfetchLogo[]
  colors: BrandfetchColor[]
}

export interface BrandfetchLogo {
  type: string
  theme: string
  formats: { src: string; format: string; height: number; width: number }[]
  tags: string[]
}

export interface BrandfetchColor {
  hex: string
  type: string
  brightness: number
}

export type SortMode = 'soonest' | 'priciest'
export type Theme = 'dark' | 'light'
