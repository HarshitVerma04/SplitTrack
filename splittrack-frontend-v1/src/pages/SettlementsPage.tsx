import { useEffect, useMemo, useState } from 'react'
import { createSettlement, getUsers, updateSettlementStatus, type UserDirectoryItem } from '../api/appApi'
import { useLiveAppState } from '../api/useLiveAppState'
import { useAuth } from '../auth/AuthProvider'
import { AppShell } from '../components/AppShell'
import { mockSettlements } from '../data/mock'
import { useToast } from '../ui/ToastProvider'

type PageMode = 'live' | 'demo'

type SettlementsPageProps = {
  mode?: PageMode
}

export function SettlementsPage({ mode = 'live' }: SettlementsPageProps) {
  const isDemo = mode === 'demo'
  const { showToast } = useToast()
  const { accessToken } = useAuth()
  const { appState, isLoading, error, refetch } = useLiveAppState(mode)
  const rawSettlements = isDemo ? mockSettlements : appState?.settlements.items ?? []
  const rawKey = useMemo(() => JSON.stringify(rawSettlements.map((s) => s.id)), [rawSettlements])
  const [users, setUsers] = useState<UserDirectoryItem[]>([])
  const [toUserId, setToUserId] = useState('')
  const [newAmount, setNewAmount] = useState(0)
  const [isCreating, setIsCreating] = useState(false)

  const [settlements, setSettlements] = useState(rawSettlements.map((item) => ({ ...item, partialAmount: item.amount })))

  useEffect(() => {
    setSettlements(rawSettlements.map((item) => ({ ...item, partialAmount: item.amount })))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawKey])

  useEffect(() => {
    if (isDemo || !accessToken) return
    let cancelled = false
    const loadUsers = async () => {
      try {
        const rows = await getUsers(accessToken)
        if (!cancelled) {
          setUsers(rows)
          if (rows.length > 0) {
            setToUserId(rows[0].id)
          }
        }
      } catch {
        if (!cancelled) {
          setUsers([])
          showToast('Failed to load users for settlement requests.', 'error')
        }
      }
    }
    void loadUsers()
    return () => {
      cancelled = true
    }
  }, [isDemo, accessToken, showToast])

  async function onCreateSettlement() {
    if (!accessToken || !toUserId || newAmount <= 0) return
    setIsCreating(true)
    try {
      await createSettlement(accessToken, {
        toUserId,
        amount: newAmount,
      })
      setNewAmount(0)
      showToast('Settlement request created.', 'success')
      refetch()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create settlement request.', 'error')
    } finally {
      setIsCreating(false)
    }
  }

  async function updateStatus(id: string, status: 'ACCEPTED' | 'REJECTED') {
    if (!accessToken) return
    try {
      await updateSettlementStatus(accessToken, id, status)
      showToast(`Settlement ${status.toLowerCase()}.`, 'success')
      refetch()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update settlement status.', 'error')
    }
  }

  return (
    <AppShell
      mode={mode}
      title="Settlement Requests"
      subtitle={isDemo ? 'Accept one suggested transaction at a time' : 'No settlement requests yet.'}
    >
      {!isDemo && isLoading ? (
        <article className="mb-4 rounded-xl bg-white p-4 text-sm text-[#4b4451] shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:text-[#cac4cf] dark:ring-[#2d3234]">
          Loading settlement requests...
        </article>
      ) : null}
      {!isDemo && error ? (
        <article className="mb-4 rounded-xl bg-[#fff4f4] p-4 text-sm text-[#93000a] shadow-sm ring-1 ring-[#ffdad6] dark:bg-[#3b2222] dark:text-[#ffb4ab] dark:ring-[#5c3030]">
          Could not load settlement requests: {error}
        </article>
      ) : null}
      {!isDemo ? (
        <article className="mb-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
          <h4 className="font-semibold text-[#191c1d] dark:text-[#f0f1f2]">Create Settlement Request</h4>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <select
              value={toUserId}
              onChange={(event) => setToUserId(event.target.value)}
              className="rounded-lg bg-[#edeeef] p-2 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
            >
              <option value="">Select recipient</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            <input
              type="number"
              value={newAmount}
              onChange={(event) => setNewAmount(Number(event.target.value) || 0)}
              placeholder="Amount"
              className="rounded-lg bg-[#edeeef] p-2 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
            />
          </div>
          <button
            onClick={() => void onCreateSettlement()}
            disabled={!toUserId || newAmount <= 0 || isCreating}
            className="mt-3 rounded-lg bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreating ? 'Submitting...' : 'Request Settlement'}
          </button>
        </article>
      ) : null}
      {settlements.length === 0 ? (
        <article className="rounded-xl bg-white p-6 text-sm text-[#4b4451] shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:text-[#cac4cf] dark:ring-[#2d3234]">
          No settlement requests yet. Suggestions will appear once you have pending balances.
        </article>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {settlements.map((item) => {
          const status = String(item.status).toUpperCase()
          const isAccepted = status === 'ACCEPTED'
          const invalid = item.partialAmount <= 0 || item.partialAmount > item.amount

          return (
          <article
            key={item.id}
            className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]"
          >
            <p className="text-sm text-[#4b4451] dark:text-[#cac4cf]">{item.from} → {item.to}</p>
            <p className="mt-1 font-[Manrope] text-3xl font-extrabold text-[#4c1b87] dark:text-[#d8baff]">
              ₹{item.amount.toLocaleString('en-IN')}
            </p>
            <label className="mt-3 block text-xs font-semibold text-[#4b4451] dark:text-[#cac4cf]">
              Partial settlement amount
              <input
                type="number"
                value={item.partialAmount}
                disabled={item.status === 'Accepted'}
                onChange={(event) => {
                  const value = Number(event.target.value) || 0
                  setSettlements((prev) =>
                    prev.map((row) =>
                      row.id === item.id ? { ...row, partialAmount: value } : row,
                    ),
                  )
                }}
                className="mt-1 w-full rounded-lg bg-[#edeeef] p-2 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 disabled:opacity-60 dark:bg-[#1e1e1e]"
              />
            </label>
            {invalid && item.status !== 'Accepted' ? (
              <p className="mt-2 text-xs font-semibold text-[#93000a]">Enter a value between ₹1 and the suggested amount.</p>
            ) : null}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4b4451] dark:text-[#cac4cf]">
                {status}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={isAccepted || invalid}
                  onClick={() => void updateStatus(item.id, 'ACCEPTED')}
                  className="rounded-lg bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-4 py-2 text-sm font-bold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Accept
                </button>
                <button
                  disabled={isAccepted}
                  onClick={() => void updateStatus(item.id, 'REJECTED')}
                  className="rounded-lg bg-[#fbe9ec] px-4 py-2 text-sm font-bold text-[#93000a] transition hover:bg-[#f9dde2] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#3c1f24] dark:text-[#ffb4ab]"
                >
                  Reject
                </button>
              </div>
            </div>
          </article>
          )
        })}
      </div>
    </AppShell>
  )
}
