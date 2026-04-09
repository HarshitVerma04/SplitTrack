import { useEffect, useMemo, useState } from 'react'
import {
  CATEGORY_STORAGE_KEY,
  DEFAULT_EXPENSE_CATEGORIES,
  mergeCategories,
  normalizeCategory,
} from '../data/expenseCategories'

function readStoredCategories(): string[] {
  try {
    const raw = localStorage.getItem(CATEGORY_STORAGE_KEY)
    if (!raw) {
      return DEFAULT_EXPENSE_CATEGORIES
    }
    const parsed = JSON.parse(raw) as string[]
    if (!Array.isArray(parsed)) {
      return DEFAULT_EXPENSE_CATEGORIES
    }
    return mergeCategories(DEFAULT_EXPENSE_CATEGORIES, parsed)
  } catch {
    return DEFAULT_EXPENSE_CATEGORIES
  }
}

export function useExpenseCategories() {
  const [categories, setCategories] = useState<string[]>(() => readStoredCategories())

  useEffect(() => {
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories))
  }, [categories])

  const defaultSet = useMemo(() => {
    return new Set(DEFAULT_EXPENSE_CATEGORIES.map((category) => category.toLowerCase()))
  }, [])

  function addCategory(value: string): { category: string; added: boolean } {
    const normalized = normalizeCategory(value)
    if (!normalized) {
      return { category: '', added: false }
    }

    let added = false
    setCategories((prev) => {
      const exists = prev.some((item) => item.toLowerCase() === normalized.toLowerCase())
      if (exists) {
        return prev
      }
      added = true
      return mergeCategories(prev, [normalized])
    })

    return { category: normalized, added }
  }

  function removeCategory(value: string): boolean {
    const normalized = normalizeCategory(value)
    if (!normalized) {
      return false
    }

    if (defaultSet.has(normalized.toLowerCase())) {
      return false
    }

    let removed = false
    setCategories((prev) => {
      const next = prev.filter((category) => category.toLowerCase() !== normalized.toLowerCase())
      removed = next.length !== prev.length
      return next.length > 0 ? next : DEFAULT_EXPENSE_CATEGORIES
    })

    return removed
  }

  function resetCategories() {
    setCategories(DEFAULT_EXPENSE_CATEGORIES)
  }

  function isDefaultCategory(value: string): boolean {
    return defaultSet.has(normalizeCategory(value).toLowerCase())
  }

  return {
    categories,
    addCategory,
    removeCategory,
    resetCategories,
    isDefaultCategory,
  }
}
