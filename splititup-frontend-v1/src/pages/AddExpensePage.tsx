import { useCallback, useEffect, useMemo, useState } from 'react'
import { createExpense, getGroupMembers, getGroups, type GroupSummary, type UserDirectoryItem } from '../api/appApi'
import { useAuth } from '../auth/AuthProvider'
import { AppShell } from '../components/AppShell'
import { normalizeCategory } from '../data/expenseCategories'
import { useExpenseCategories } from '../hooks/useExpenseCategories'
import { getDisplayName } from '../utils/userDisplay'
import { useToast } from '../ui/ToastProvider'

type SplitMethod = 'equal' | 'custom' | 'percentage'

type PageMode = 'live' | 'demo'

type AddExpensePageProps = {
  mode?: PageMode
}

type SplitRow = {
  userId: string
  name: string
  email: string
  amount: number
  percentage: number
  included: boolean
}

function currency(value: number) {
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function AddExpensePage({ mode = 'live' }: AddExpensePageProps) {
  const { accessToken, user } = useAuth()
  const { showToast } = useToast()
  const isDemo = mode === 'demo'
  const { categories: categoryOptions, addCategory } = useExpenseCategories()
  const [groups, setGroups] = useState<GroupSummary[]>([])
  const [groupId, setGroupId] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('General')
  const [payerId, setPayerId] = useState(user?.id ?? '')
  const [customCategory, setCustomCategory] = useState('')
  const [totalAmount, setTotalAmount] = useState(0)
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('equal')
  const [splits, setSplits] = useState<SplitRow[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [loadingMembers, setLoadingMembers] = useState(false)

  useEffect(() => {
    if (!categoryOptions.includes(category)) {
      setCategory(categoryOptions[0] ?? 'General')
    }
  }, [categoryOptions, category])

  useEffect(() => {
    if (!payerId && user?.id) {
      setPayerId(user.id)
    }
  }, [payerId, user?.id])

  // Load groups on mount
  useEffect(() => {
    if (!accessToken) return
    let cancelled = false
    const load = async () => {
      try {
        const groupRows = await getGroups(accessToken)
        if (cancelled) return
        setGroups(groupRows)
        if (groupRows.length > 0) {
          setGroupId(groupRows[0].id)
        }
      } catch (err) {
        if (!cancelled) showToast(err instanceof Error ? err.message : 'Failed to load groups.', 'error')
      }
    }
    void load()
    return () => { cancelled = true }
  }, [accessToken, showToast])

  // Load group members when group changes
  useEffect(() => {
    if (!accessToken || !groupId) {
      setSplits([])
      setPayerId(user?.id ?? '')
      return
    }
    let cancelled = false
    const load = async () => {
      setLoadingMembers(true)
      try {
        const members: UserDirectoryItem[] = await getGroupMembers(accessToken, groupId)
        if (cancelled) return
        setSplits(
          members.map((m) => ({
            userId: m.id,
            name: getDisplayName(m),
            email: m.email,
            amount: 0,
            percentage: members.length > 0 ? Math.round((100 / members.length) * 100) / 100 : 0,
            included: true,
          }))
        )
        const defaultPayerId =
          members.find((m) => m.id === user?.id)?.id ??
          members[0]?.id ??
          user?.id ??
          ''
        setPayerId(defaultPayerId)
      } catch (err) {
        if (!cancelled) showToast(err instanceof Error ? err.message : 'Failed to load members.', 'error')
      } finally {
        if (!cancelled) setLoadingMembers(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [accessToken, groupId, showToast, user?.id])

  // Recalculate amounts when total or split method changes
  const recalculate = useCallback(
    (rows: SplitRow[], total: number, method: SplitMethod): SplitRow[] => {
      if (method === 'equal') {
        const includedCount = rows.filter((r) => r.included).length
        if (includedCount === 0) return rows.map((r) => ({ ...r, amount: 0 }))
        const share = Math.round((total / includedCount) * 100) / 100
        // Distribute rounding remainder to the first included person
        let remainder = Math.round((total - share * includedCount) * 100) / 100
        return rows.map((r) => {
          if (!r.included) return { ...r, amount: 0 }
          let amt = share
          if (remainder !== 0) {
            amt = Math.round((amt + remainder) * 100) / 100
            remainder = 0
          }
          return { ...r, amount: amt }
        })
      }
      if (method === 'percentage') {
        const includedIndexes = rows
          .map((row, index) => ({ row, index }))
          .filter(({ row }) => row.included)
          .map(({ index }) => index)

        if (includedIndexes.length === 0) {
          return rows.map((r) => ({ ...r, amount: 0 }))
        }

        const totalPaise = Math.round(total * 100)
        const paiseByIndex = new Map<number, number>()
        let allocatedPaise = 0

        for (const index of includedIndexes) {
          const paise = Math.round((total * rows[index].percentage) / 100 * 100)
          paiseByIndex.set(index, paise)
          allocatedPaise += paise
        }

        let remainderPaise = totalPaise - allocatedPaise
        if (remainderPaise !== 0) {
          const direction = remainderPaise > 0 ? 1 : -1
          remainderPaise = Math.abs(remainderPaise)
          for (let i = 0; i < remainderPaise; i += 1) {
            const targetIndex = includedIndexes[i % includedIndexes.length]
            paiseByIndex.set(targetIndex, (paiseByIndex.get(targetIndex) ?? 0) + direction)
          }
        }

        return rows.map((row, index) => {
          if (!row.included) return { ...row, amount: 0 }
          return { ...row, amount: (paiseByIndex.get(index) ?? 0) / 100 }
        })
      }
      // custom — amounts are manually entered, no recalc needed
      return rows
    },
    []
  )

  useEffect(() => {
    if (splitMethod === 'equal' || splitMethod === 'percentage') {
      setSplits((prev) => recalculate(prev, totalAmount, splitMethod))
    }
  }, [totalAmount, splitMethod, recalculate])

  const splitTotalPaise = useMemo(
    () => Math.round(splits.reduce((sum, row) => sum + (row.included ? row.amount : 0), 0) * 100),
    [splits],
  )
  const totalAmountPaise = useMemo(() => Math.round(totalAmount * 100), [totalAmount])
  const splitTotal = useMemo(() => splitTotalPaise / 100, [splitTotalPaise])
  const differencePaise = useMemo(() => totalAmountPaise - splitTotalPaise, [totalAmountPaise, splitTotalPaise])
  const difference = useMemo(() => differencePaise / 100, [differencePaise])

  function distributeBasis(totalBasis: number, count: number): number[] {
    if (count <= 0) {
      return []
    }
    const base = Math.floor(totalBasis / count)
    const remainder = totalBasis - base * count
    return Array.from({ length: count }, (_, index) => base + (index < remainder ? 1 : 0))
  }

  function rebalancePercentages(rows: SplitRow[], fixedUserId?: string, fixedPct?: number): SplitRow[] {
    const includedRows = rows.filter((row) => row.included)
    if (includedRows.length === 0) {
      return rows.map((row) => ({ ...row, percentage: 0, amount: 0 }))
    }

    if (includedRows.length === 1) {
      const onlyUserId = includedRows[0].userId
      return rows.map((row) =>
        row.included
          ? { ...row, percentage: row.userId === onlyUserId ? 100 : 0 }
          : { ...row, percentage: 0, amount: 0 },
      )
    }

    const percentageByUserId = new Map<string, number>()
    const fixedRowIncluded = fixedUserId ? includedRows.some((row) => row.userId === fixedUserId) : false

    if (fixedUserId && fixedRowIncluded && fixedPct !== undefined) {
      const fixedBasis = Math.max(0, Math.min(10000, Math.round(fixedPct * 100)))
      const otherUserIds = includedRows
        .map((row) => row.userId)
        .filter((userId) => userId !== fixedUserId)
      const remainingBasis = Math.max(0, 10000 - fixedBasis)
      const distributed = distributeBasis(remainingBasis, otherUserIds.length)

      percentageByUserId.set(fixedUserId, fixedBasis / 100)
      for (let index = 0; index < otherUserIds.length; index += 1) {
        percentageByUserId.set(otherUserIds[index], distributed[index] / 100)
      }
    } else {
      const distributed = distributeBasis(10000, includedRows.length)
      for (let index = 0; index < includedRows.length; index += 1) {
        percentageByUserId.set(includedRows[index].userId, distributed[index] / 100)
      }
    }

    return rows.map((row) => {
      if (!row.included) {
        return { ...row, percentage: 0, amount: 0 }
      }
      return { ...row, percentage: percentageByUserId.get(row.userId) ?? 0 }
    })
  }

  function toggleInclude(userId: string) {
    setSplits((prev) => {
      const updated = prev.map((row) => {
        if (row.userId !== userId) {
          return row
        }

        const nextIncluded = !row.included
        if (!nextIncluded) {
          return { ...row, included: false, amount: 0, percentage: 0 }
        }

        return { ...row, included: true }
      })

      if (splitMethod === 'custom') {
        return updated
      }

      if (splitMethod === 'percentage') {
        const rebalanced = rebalancePercentages(updated)
        return recalculate(rebalanced, totalAmount, 'percentage')
      }

      return recalculate(updated, totalAmount, 'equal')
    })
  }

  function updateCustomAmount(userId: string, amount: number) {
    setSplits((prev) => prev.map((r) => (r.userId === userId ? { ...r, amount } : r)))
  }

  function updatePercentage(userId: string, pct: number) {
    setSplits((prev) => {
      const rebalanced = rebalancePercentages(prev, userId, pct)
      return recalculate(rebalanced, totalAmount, 'percentage')
    })
  }

  function splitEqually() {
    setSplitMethod('equal')
    setSplits((prev) => {
      const updated = prev.map((r) => ({ ...r, included: true }))
      return recalculate(updated, totalAmount, 'equal')
    })
  }

  function onAddCategory() {
    const normalized = normalizeCategory(customCategory)
    if (!normalized) {
      showToast('Enter a category name first.', 'info')
      return
    }

    const result = addCategory(normalized)

    setCategory(normalized)
    setCustomCategory('')
    showToast(result.added ? 'Category added.' : 'Category already exists. Selected it for you.', 'success')
  }

  async function onSubmit() {
    if (!accessToken) {
      showToast('Session expired. Please log in again.', 'error')
      return
    }
    if (!groupId) {
      showToast('Please select a group.', 'error')
      return
    }
    if (!title.trim()) {
      showToast('Expense title is required.', 'error')
      return
    }
    if (totalAmount <= 0) {
      showToast('Total amount must be greater than zero.', 'error')
      return
    }

    const activeSplits = splits.filter((row) => row.included && row.amount > 0)
    if (activeSplits.length === 0) {
      showToast('Add at least one split amount greater than zero.', 'error')
      return
    }

    if (differencePaise !== 0) {
      showToast(`Split total must match expense total. Off by ${currency(Math.abs(difference))}`, 'error')
      return
    }

    const selectedPayerId = payerId || user?.id || ''
    if (!selectedPayerId || !splits.some((row) => row.userId === selectedPayerId)) {
      showToast('Please select a valid payer from this group.', 'error')
      return
    }

    setIsSaving(true)

    try {
      await createExpense(accessToken, {
        groupId,
        title: title.trim(),
        category: category.trim() || 'General',
        totalAmount,
        payerId: selectedPayerId,
        splits: activeSplits.map((row) => ({
          userId: row.userId,
          amount: Math.round(row.amount * 100) / 100,
        })),
      })
      setTitle('')
      setCategory(categoryOptions[0] ?? 'General')
      setTotalAmount(0)
      setSplits((prev) => prev.map((row) => ({ ...row, amount: 0, percentage: prev.filter((r) => r.included).length > 0 ? Math.round((100 / prev.filter((r) => r.included).length) * 100) / 100 : 0 })))
      showToast('Expense added successfully.', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create expense.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const splitMethodOptions: { key: SplitMethod; label: string }[] = [
    { key: 'equal', label: 'Split Equally' },
    { key: 'custom', label: 'Custom Amounts' },
    { key: 'percentage', label: 'By Percentage' },
  ]

  return (
    <AppShell
      mode={mode}
      title="Add Expense"
      subtitle={isDemo ? 'Try category + split workflows in demo mode' : 'Create an expense with categories and accurate split allocation'}
    >
      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[#d0d9e5] dark:bg-[#232627] dark:ring-[#2d3234]">
        {/* --- Expense Details --- */}
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm font-semibold text-[#3b3f45] dark:text-[#cac4cf]">
            Group
            <select
              value={groupId}
              onChange={(event) => setGroupId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-[#d0d9e5] bg-[#f8fafc] p-2.5 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:border-[#384150] dark:bg-[#1e1e1e]"
            >
              <option value="">Select group</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-[#3b3f45] dark:text-[#cac4cf]">
            Category
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-1 w-full rounded-lg border border-[#d0d9e5] bg-[#f8fafc] p-2.5 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:border-[#384150] dark:bg-[#1e1e1e]"
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-[#3b3f45] dark:text-[#cac4cf] md:col-span-2">
            Add Category
            <div className="mt-1 flex gap-2">
              <input
                value={customCategory}
                onChange={(event) => setCustomCategory(event.target.value)}
                placeholder="Add custom category (for example: Home Repair)"
                className="w-full rounded-lg border border-[#d0d9e5] bg-[#f8fafc] p-2.5 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:border-[#384150] dark:bg-[#1e1e1e]"
              />
              <button
                type="button"
                onClick={onAddCategory}
                className="rounded-lg bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-4 py-2.5 text-sm font-semibold text-white transition"
              >
                Add
              </button>
            </div>
          </label>

          <label className="text-sm font-semibold text-[#3b3f45] dark:text-[#cac4cf] md:col-span-2">
            Title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Dinner at Brittos"
              className="mt-1 w-full rounded-lg border border-[#d0d9e5] bg-[#f8fafc] p-2.5 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:border-[#384150] dark:bg-[#1e1e1e]"
            />
          </label>

          <label className="text-sm font-semibold text-[#3b3f45] dark:text-[#cac4cf]">
            Total Amount (₹)
            <input
              type="number"
              min={0}
              step="0.01"
              value={totalAmount || ''}
              onChange={(event) => setTotalAmount(Number(event.target.value) || 0)}
              placeholder="0.00"
              className="mt-1 w-full rounded-lg border border-[#d0d9e5] bg-[#f8fafc] p-2.5 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:border-[#384150] dark:bg-[#1e1e1e]"
            />
          </label>

          <label className="text-sm font-semibold text-[#3b3f45] dark:text-[#cac4cf]">
            Paid By
            <select
              value={payerId || user?.id || ''}
              onChange={(event) => setPayerId(event.target.value)}
              disabled={!groupId || splits.length === 0}
              className="mt-1 w-full rounded-lg border border-[#d0d9e5] bg-[#f8fafc] p-2.5 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 disabled:opacity-60 dark:border-[#384150] dark:bg-[#1e1e1e]"
            >
              {splits.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.name} {member.userId === user?.id ? '(You)' : ''}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* --- Split Method Tabs --- */}
        <div className="mt-5">
          <h4 className="text-sm font-semibold text-[#1f2328] dark:text-[#f0f1f2]">Split Method</h4>
          <div className="mt-2 flex gap-2 rounded-lg bg-[#f3f4f5] p-1 dark:bg-[#1e1e1e]">
            {splitMethodOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => {
                  if (opt.key === 'equal') {
                    splitEqually()
                  } else if (opt.key === 'percentage') {
                    setSplitMethod('percentage')
                    setSplits((prev) => {
                      const rebalanced = rebalancePercentages(prev)
                      return recalculate(rebalanced, totalAmount, 'percentage')
                    })
                  } else {
                    setSplitMethod(opt.key)
                  }
                }}
                className={[
                  'flex-1 rounded-md px-3 py-2 text-xs font-bold transition',
                  splitMethod === opt.key
                    ? 'bg-gradient-to-br from-[#4c1b87] to-[#6437a0] text-white shadow-sm'
                    : 'text-[#3b3f45] hover:bg-white dark:text-[#cac4cf] dark:hover:bg-[#232627]',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* --- Split Allocation --- */}
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-[#1f2328] dark:text-[#f0f1f2]">Split Allocation</h4>

          {loadingMembers ? (
            <p className="mt-2 text-sm text-[#3b3f45] dark:text-[#cac4cf]">Loading group members...</p>
          ) : splits.length === 0 ? (
            <p className="mt-2 text-sm text-[#3b3f45] dark:text-[#cac4cf]">
              {groupId ? 'No members found in this group.' : 'Select a group to see members.'}
            </p>
          ) : (
            <div className="mt-2 space-y-2">
              {splits.map((row) => (
                <div
                  key={row.userId}
                  className={[
                    'grid items-center gap-3 rounded-lg p-3 transition',
                    row.included
                      ? 'bg-[#f3f4f5] dark:bg-[#1e1e1e]'
                      : 'bg-[#f3f4f5]/50 opacity-50 dark:bg-[#1e1e1e]/50',
                    splitMethod === 'equal' ? 'grid-cols-[auto_1fr_120px]' : '',
                    splitMethod === 'custom' ? 'grid-cols-[auto_1fr_140px]' : '',
                    splitMethod === 'percentage' ? 'grid-cols-[auto_1fr_100px_120px]' : '',
                  ].join(' ')}
                >
                  {/* Checkbox */}
                  <label className="flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={row.included}
                      onChange={() => toggleInclude(row.userId)}
                      className="h-4 w-4 accent-[#4c1b87]"
                    />
                  </label>

                  {/* Name */}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#1f2328] dark:text-[#f0f1f2]">
                      {row.name}
                      {row.userId === user?.id ? <span className="ml-1 text-xs font-normal text-[#63707e] dark:text-[#cac4cf]">(You)</span> : null}
                    </p>
                    <p className="truncate text-xs text-[#63707e] dark:text-[#9ea5af]">{row.email}</p>
                  </div>

                  {/* Percentage input (only in percentage mode) */}
                  {splitMethod === 'percentage' ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="0.01"
                        value={row.percentage || ''}
                        disabled={!row.included}
                        onChange={(event) => updatePercentage(row.userId, Number(event.target.value) || 0)}
                        className="w-full rounded-md border border-[#d0d9e5] bg-white p-2 text-right text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 disabled:opacity-40 dark:border-[#384150] dark:bg-[#232627]"
                      />
                      <span className="text-xs text-[#3b3f45] dark:text-[#cac4cf]">%</span>
                    </div>
                  ) : null}

                  {/* Amount */}
                  {splitMethod === 'custom' ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-[#4b4451] dark:text-[#cac4cf]">₹</span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={row.amount || ''}
                        disabled={!row.included}
                        onChange={(event) => updateCustomAmount(row.userId, Number(event.target.value) || 0)}
                        className="w-full rounded-md border border-[#d0d9e5] bg-white p-2 text-right text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 disabled:opacity-40 dark:border-[#384150] dark:bg-[#232627]"
                      />
                    </div>
                  ) : (
                    <span className={[
                      'text-right text-sm font-semibold',
                      row.included ? 'text-[#4c1b87] dark:text-[#d8baff]' : 'text-[#3b3f45]',
                    ].join(' ')}>
                      {currency(row.amount)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- Summary Bar --- */}
        <div className="mt-4 flex items-center justify-between rounded-lg bg-[#f3f4f5] p-3 text-sm dark:bg-[#1e1e1e]">
          <div>
            <p>Split Total: <span className="font-semibold">{currency(splitTotal)}</span></p>
            <p>
              Difference:{' '}
              <span className={differencePaise === 0 ? 'font-semibold text-[#15803d] dark:text-[#4ade80]' : 'font-semibold text-[#93000a] dark:text-[#ffb4ab]'}>
                {currency(Math.abs(difference))}
              </span>
            </p>
          </div>
          {splitMethod === 'percentage' ? (
            <p className="text-xs text-[#3b3f45] dark:text-[#cac4cf]">
              Total: {splits.filter((r) => r.included).reduce((sum, r) => sum + r.percentage, 0).toFixed(1)}%
            </p>
          ) : null}
        </div>

        {/* --- Submit --- */}
        <button
          onClick={() => void onSubmit()}
          disabled={isSaving || !groupId || !title.trim() || totalAmount <= 0}
          className="mt-4 rounded-lg bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-5 py-2.5 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? 'Saving...' : 'Create Expense'}
        </button>
      </section>
    </AppShell>
  )
}
