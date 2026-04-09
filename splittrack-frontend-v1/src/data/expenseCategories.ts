export const DEFAULT_EXPENSE_CATEGORIES = [
  'General',
  'Food',
  'Rent',
  'Utilities',
  'Groceries',
  'Dining',
  'Travel',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Education',
  'Shopping',
  'Subscriptions',
  'Bills',
  'Insurance',
]

export const CATEGORY_STORAGE_KEY = 'splittrack.expense.categories.v1'

export function normalizeCategory(value: string): string {
  const normalized = value.trim().replace(/\s+/g, ' ')
  if (!normalized) {
    return ''
  }
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

export function mergeCategories(base: string[], additions: string[]): string[] {
  const map = new Map<string, string>()
  for (const category of [...base, ...additions]) {
    const normalized = normalizeCategory(category)
    if (!normalized) {
      continue
    }
    map.set(normalized.toLowerCase(), normalized)
  }
  return Array.from(map.values())
}
