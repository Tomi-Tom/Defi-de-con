import type { Database } from '@/types/database'

type Quote = Database['public']['Tables']['motivational_quotes']['Row']

export function selectDailyQuote(quotes: Quote[], userId: string): Quote | null {
  if (quotes.length === 0) return null

  // Seed based on userId + date for consistent daily rotation
  const today = new Date().toISOString().slice(0, 10)
  const seed = hashCode(`${userId}-${today}`)
  return quotes[Math.abs(seed) % quotes.length]
}

export function selectContextualQuote(quotes: Quote[], context: string): Quote | null {
  const filtered = quotes.filter(q => q.context === context)
  if (filtered.length === 0) {
    // Fallback to daily pool
    const daily = quotes.filter(q => q.context === 'daily')
    if (daily.length === 0) return null
    return daily[Math.floor(Math.random() * daily.length)]
  }
  return filtered[Math.floor(Math.random() * filtered.length)]
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return hash
}
