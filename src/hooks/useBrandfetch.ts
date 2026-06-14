import { useQuery } from '@tanstack/react-query'
import type { BrandfetchSearchResult, BrandfetchBrand } from '../types'

const CLIENT_ID = import.meta.env.VITE_BRANDFETCH_CLIENT_ID as string
const API_KEY = import.meta.env.VITE_BRANDFETCH_API_KEY as string

export function brandLogoUrl(domain: string, theme: 'dark' | 'light' = 'dark', size = 80): string {
  return `https://cdn.brandfetch.io/${domain}/w/${size}/h/${size}/theme/${theme}/type/icon?c=${CLIENT_ID}&fallback=lettermark`
}

export function useBrandfetchSearch(query: string) {
  return useQuery<BrandfetchSearchResult[]>({
    queryKey: ['brandfetch-search', query],
    queryFn: async () => {
      if (!query.trim() || query.length < 2) return []
      const res = await fetch(
        `https://api.brandfetch.io/v2/search/${encodeURIComponent(query)}?c=${CLIENT_ID}`,
      )
      if (!res.ok) throw new Error('Search failed')
      return res.json()
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 5,
    placeholderData: [],
  })
}

export function useBrandfetchBrand(domain: string | undefined) {
  return useQuery<BrandfetchBrand>({
    queryKey: ['brandfetch-brand', domain],
    queryFn: async () => {
      const res = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
      })
      if (!res.ok) throw new Error('Brand fetch failed')
      return res.json()
    },
    enabled: !!domain && !!API_KEY,
    staleTime: 1000 * 60 * 60,
  })
}

export function useBrandColor(domain: string | undefined): string | undefined {
  const { data } = useBrandfetchBrand(domain)
  if (!data?.colors?.length) return undefined
  const primary = data.colors.find((c) => c.type === 'brand') ?? data.colors[0]
  return primary?.hex
}
