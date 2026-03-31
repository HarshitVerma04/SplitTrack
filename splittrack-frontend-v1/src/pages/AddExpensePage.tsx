import { useCallback, useEffect, useMemo, useState } from 'react'
import { createExpense, getGroupMembers, getGroups, type GroupSummary, type UserDirectoryItem } from '../api/appApi'
import { useAuth } from '../auth/AuthProvider'
import { AppShell } from '../components/AppShell'
import { useToast } from '../ui/ToastProvider'

type SplitMethod = 'equal' | 'custom' | 'percentage'

type SplitRow = {
  userId: string
  name: string
  amount: number
  percentage: number
  included: boolean
}

function currency(value: number) {
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function AddExpensePage() {
  const { accessToken, user } = useAuth()
  const { showToast } = useToast()
  const [groups, setGroups] = useState<GroupSummary[]>([])
  const [groupId, setGroupId] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('General')
  const [totalAmount, setTotalAmount] = useState(0)
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('equal')
  const [splits, setSplits] = useState<SplitRow[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [loadingMembers, setLoadingMembers] = useState(false)

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
            name: m.name || m.email,
            amount: 0,
            percentage: members.length > 0 ? Math.round((100 / members.length) * 100) / 100 : 0,
            included: true,
          }))
        )
      } catch (err) {
        if (!cancelled) showToast(err instanceof Error ? err.message : 'Failed to load members.', 'error')
      } finally {
        if (!cancelled) setLoadingMembers(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [accessToken, groupId, showToast])

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
        return rows.map((r) => {
          if (!r.included) return { ...r, amount: 0 }
          return { ...r, amount: Math.round((total * r.percentage) / 100 * 100) / 100 }
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

  const splitTotal = useMemo(() => splits.reduce((sum, row) => sum + row.amount, 0), [splits])
  const difference = useMemo(() => Number((totalAmount - splitTotal).toFixed(2)), [splitTotal, totalAmount])

  function toggleInclude(userId: string) {
    setSplits((prev) => {
      const updated = prev.map((r) => (r.userId === userId ? { ...r, included: !r.included } : r))
      return recalculate(updated, totalAmount, splitMethod)
    })
  }

  function updateCustomAmount(userId: string, amount: number) {
    setSplits((prev) => prev.map((r) => (r.userId === userId ? { ...r, amount } : r)))
  }

  function updatePercentage(userId: string, pct: number) {
    setSplits((prev) => {
      const updated = prev.map((r) => (r.userId === userId ? { ...r, percentage: pct } : r))
      return recalculate(updated, totalAmount, 'percentage')
    })
  }

  function splitEqually() {
    setSplitMethod('equal')
    setSplits((prev) => {
      const updated = prev.map((r) => ({ ...r, included: true }))
      return recalculate(updated, totalAmount, 'equal')
    })
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

    if (Math.abs(difference) > 0.01) {
      showToast(`Split total must match expense total. Off by ${currency(Math.abs(difference))}`, 'error')
      return
    }

    setIsSaving(true)

    try {
      await createExpense(accessToken, {
        groupId,
        title: title.trim(),
        category: category.trim() || 'General',
        totalAmount,
        payerId: user?.id,
        splits: activeSplits.map((row) => ({ userId: row.userId, amount: row.amount })),
      })
      setTitle('')
      setCategory('General')
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
    <AppShell title="Add Expense" subtitle="Create real expense entries using backend APIs">
      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
        {/* --- Expense Details --- */}
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm font-semibold text-[#4b4451] dark:text-[#cac4cf]">
            Group
            <select
              value={groupId}
              onChange={(event) => setGroupId(event.target.value)}
              className="mt-1 w-full rounded-lg bg-[#edeeef] p-2.5 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
            >
              <option value="">Select group</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-[#4b4451] dark:text-[#cac4cf]">
            Category
            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-1 w-full rounded-lg bg-[#edeeef] p-2.5 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
            />
          </label>

          <label className="text-sm font-semibold text-[#4b4451] dark:text-[#cac4cf] md:col-span-2">
            Title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Dinner at Brittos"
              className="mt-1 w-full rounded-lg bg-[#edeeef] p-2.5 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
            />
          </label>

          <label className="text-sm font-semibold text-[#4b4451] dark:text-[#cac4cf]">
            Total Amount (₹)
            <input
              type="number"
              min={0}
              step="0.01"
              value={totalAmount || ''}
              onChange={(event) => setTotalAmount(Number(event.target.value) || 0)}
              placeholder="0.00"
              className="mt-1 w-full rounded-lg bg-[#edeeef] p-2.5 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
            />
          </label>
        </div>

        {/* --- Split Method Tabs --- */}
        <div className="mt-5">
          <h4 className="text-sm font-semibold text-[#191c1d] dark:text-[#f0f1f2]">Split Method</h4>
          <div className="mt-2 flex gap-2 rounded-lg bg-[#f3f4f5] p-1 dark:bg-[#1e1e1e]">
            {splitMethodOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => {
                  if (opt.key === 'equal') {
                    splitEqually()
                  } else {
                    setSplitMethod(opt.key)
                  }
                }}
                className={[
                  'flex-1 rounded-md px-3 py-2 text-xs font-bold transition',
                  splitMethod === opt.key
                    ? 'bg-gradient-to-br from-[#4c1b87] to-[#6437a0] text-white shadow-sm'
                    : 'text-[#4b4451] hover:bg-white dark:text-[#cac4cf] dark:hover:bg-[#232627]',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* --- Split Allocation --- */}
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-[#191c1d] dark:text-[#f0f1f2]">Split Allocation</h4>

          {loadingMembers ? (
            <p className="mt-2 text-sm text-[#4b4451] dark:text-[#cac4cf]">Loading group members...</p>
          ) : splits.length === 0 ? (
            <p className="mt-2 text-sm text-[#4b4451] dark:text-[#cac4cf]">
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
                    <p className="truncate text-sm font-semibold text-[#191c1d] dark:text-[#f0f1f2]">
                      {row.name}
                      {row.userId === user?.id ? <span className="ml-1 text-xs font-normal text-[#4b4451] dark:text-[#cac4cf]">(You)</span> : null}
                    </p>
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
                        className="w-full rounded-md bg-white p-2 text-right text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 disabled:opacity-40 dark:bg-[#232627]"
                      />
                      <span className="text-xs text-[#4b4451] dark:text-[#cac4cf]">%</span>
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
                        className="w-full rounded-md bg-white p-2 text-right text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 disabled:opacity-40 dark:bg-[#232627]"
                      />
                    </div>
                  ) : (
                    <span className={[
                      'text-right text-sm font-semibold',
                      row.included ? 'text-[#4c1b87] dark:text-[#d8baff]' : 'text-[#4b4451]',
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
              <span className={Math.abs(difference) < 0.01 ? 'font-semibold text-[#15803d] dark:text-[#4ade80]' : 'font-semibold text-[#93000a] dark:text-[#ffb4ab]'}>
                {currency(Math.abs(difference))}
              </span>
            </p>
          </div>
          {splitMethod === 'percentage' ? (
            <p className="text-xs text-[#4b4451] dark:text-[#cac4cf]">
              Total: {splits.filter((r) => r.included).reduce((sum, r) => sum + r.percentage, 0).toFixed(1)}%
            </p>
          ) : null}
        </div>

        {/* --- Submit --- */}
        <button
          onClick={() => void onSubmit()}
          disabled={isSaving || !groupId || !title.trim() || totalAmount <= 0}
          className="mt-4 rounded-lg bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-5 py-2.5 text-sm font-bold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? 'Saving...' : 'Create Expense'}
        </button>
      </section>
    </AppShell>
  )
}
