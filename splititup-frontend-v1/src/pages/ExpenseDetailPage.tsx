import { useMemo, useState } from 'react'
import { AppShell } from '../components/AppShell'
import { deleteExpense, updateExpense } from '../api/appApi'
import { useLiveAppState } from '../api/useLiveAppState'
import { useAuth } from '../auth/AuthProvider'
import { useToast } from '../ui/ToastProvider'

type PageMode = 'live' | 'demo'

type ExpenseDetailPageProps = {
  mode?: PageMode
}

type DemoParticipant = {
  id: string
  name: string
  amount: string
  sharePercent: string
  role: string
}

const demoParticipants: DemoParticipant[] = [
  { id: 'u1', name: 'Ananya Rao', amount: '₹2,450.00', sharePercent: '25%', role: 'PAYER' },
  { id: 'u2', name: 'Rohan Verma', amount: '₹2,450.00', sharePercent: '25%', role: 'MEMBER' },
  { id: 'u3', name: 'You', amount: '₹2,450.00', sharePercent: '25%', role: 'YOU' },
  { id: 'u4', name: 'Sarah Miller', amount: '₹2,450.00', sharePercent: '25%', role: 'MEMBER' },
]

function parseCurrency(value: string | undefined): number {
  if (!value) {
    return 0
  }
  const numeric = Number(value.replace(/[^\d.-]/g, ''))
  return Number.isFinite(numeric) ? numeric : 0
}

function currency(value: number): string {
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function percentageValue(input: string): number {
  const numeric = Number(input.replace(/[^\d.]/g, ''))
  if (!Number.isFinite(numeric)) {
    return 0
  }
  return Math.max(0, Math.min(100, numeric))
}

export function ExpenseDetailPage({ mode = 'live' }: ExpenseDetailPageProps) {
  const isDemo = mode === 'demo'
  const { showToast } = useToast()
  const { accessToken } = useAuth()
  const { appState, isLoading, error, refetch } = useLiveAppState(mode)
  const liveExpense = appState?.expenseDetail.expense
  const [deleting, setDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedCategory, setEditedCategory] = useState('')

  const participants = useMemo(() => {
    if (isDemo) {
      return demoParticipants
    }
    return liveExpense?.participants ?? []
  }, [isDemo, liveExpense])

  const analyticsCards = useMemo(() => {
    if (isDemo) {
      return [
        { label: 'Total Amount', value: '₹9,800.00' },
        { label: 'Your Share', value: '₹2,450.00' },
        { label: 'Participants', value: '4' },
        { label: 'Category', value: 'Dining' },
      ]
    }

    const totalAmount = liveExpense?.totalAmount ?? 'N/A'
    const yourShare = liveExpense?.yourShare ?? 'N/A'
    const participantCount = participants.length > 0 ? String(participants.length) : '0'
    const category = liveExpense?.category ?? 'Uncategorized'

    return [
      { label: 'Total Amount', value: totalAmount },
      { label: 'Your Share', value: yourShare },
      { label: 'Participants', value: participantCount },
      { label: 'Category', value: category },
    ]
  }, [isDemo, liveExpense, participants])

  const insights = useMemo(() => {
    if (isDemo) {
      return [
        { label: 'Payer', value: 'Ananya Rao' },
        { label: 'Split Strategy', value: 'Equal split' },
        { label: 'Recorded On', value: 'Mar 30, 2026' },
      ]
    }
    if (!liveExpense) {
      return []
    }

    const contribution = participants.reduce((sum, row) => sum + parseCurrency(row.amount), 0)
    return [
      { label: 'Payer', value: liveExpense.payer ?? 'Unknown' },
      { label: 'Split Strategy', value: liveExpense.splitType ?? 'Not available' },
      { label: 'Recorded On', value: liveExpense.createdAt ?? 'Not available' },
      { label: 'Split Coverage', value: contribution > 0 ? currency(contribution) : 'Not available' },
    ]
  }, [isDemo, liveExpense, participants])

  async function onDeleteExpense() {
    if (!accessToken || !liveExpense?.id) return
    setDeleting(true)
    try {
      await deleteExpense(accessToken, liveExpense.id)
      showToast('Expense deleted.', 'success')
      refetch()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete expense.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  async function onSaveExpense() {
    if (!accessToken || !liveExpense?.id) {
      showToast('Session expired. Please log in again.', 'error')
      return
    }

    const nextTitle = editedTitle.trim()
    if (!nextTitle) {
      showToast('Expense title is required.', 'error')
      return
    }
    const nextCategory = editedCategory.trim()
    if (!nextCategory) {
      showToast('Expense category is required.', 'error')
      return
    }

    setIsSaving(true)
    try {
      await updateExpense(accessToken, liveExpense.id, { title: nextTitle, category: nextCategory })
      setIsEditing(false)
      showToast('Expense updated.', 'success')
      refetch()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update expense.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AppShell
      mode={mode}
      title="Expense Detail"
      subtitle={isDemo ? 'Comments and @username mentions' : 'No expense selected yet.'}
    >
      {!isDemo && isLoading ? (
        <article className="mb-4 rounded-xl bg-white p-4 text-sm text-[#4b4451] shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:text-[#cac4cf] dark:ring-[#2d3234]">
          Loading expense details...
        </article>
      ) : null}
      {!isDemo && error ? (
        <article className="mb-4 rounded-xl bg-[#fff4f4] p-4 text-sm text-[#93000a] shadow-sm ring-1 ring-[#ffdad6] dark:bg-[#3b2222] dark:text-[#ffb4ab] dark:ring-[#5c3030]">
          Could not load expense details: {error}
        </article>
      ) : null}
      {isDemo ? (
        <article className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
          <h3 className="font-[Manrope] text-2xl font-bold text-[#4c1b87] dark:text-[#d8baff]">Seafood Dinner at Brittos</h3>
          <p className="mt-1 text-sm text-[#4b4451] dark:text-[#cac4cf]">Paid by Ananya Rao • Total ₹9,800 • Split equally</p>

          <section className="mt-6 grid gap-3 md:grid-cols-4">
            {analyticsCards.map((card) => (
              <div key={card.label} className="rounded-lg bg-[#f3f4f5] p-3 dark:bg-[#1e1e1e]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#63707e] dark:text-[#9ea5af]">{card.label}</p>
                <p className="mt-1 text-lg font-bold text-[#1f2328] dark:text-[#f0f1f2]">{card.value}</p>
              </div>
            ))}
          </section>

          <section className="mt-4 rounded-lg bg-[#f3f4f5] p-3 dark:bg-[#1e1e1e]">
            <p className="text-sm font-semibold text-[#1f2328] dark:text-[#f0f1f2]">Participant Breakdown</p>
            <div className="mt-3 space-y-2">
              {demoParticipants.map((row) => (
                <div key={row.id} className="rounded-md bg-white p-2 dark:bg-[#232627]">
                  <div className="mb-1 flex items-center justify-between text-xs font-semibold text-[#1f2328] dark:text-[#f0f1f2]">
                    <span>{row.name}</span>
                    <span>{row.amount}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#dde6f2] dark:bg-[#2d3234]">
                    <div className="h-full rounded-full bg-[#4c1b87]" style={{ width: `${percentageValue(row.sharePercent)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-4 space-y-2">
            {insights.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg bg-[#f3f4f5] p-3 text-sm dark:bg-[#1e1e1e]">
                <span className="text-[#63707e] dark:text-[#9ea5af]">{item.label}</span>
                <span className="font-semibold text-[#1f2328] dark:text-[#f0f1f2]">{item.value}</span>
              </div>
            ))}
          </div>
        </article>
      ) : liveExpense ? (
        <article className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
          <div className="flex items-center justify-between gap-3">
            <div className="w-full max-w-xl space-y-2">
              {isEditing ? (
                <>
                  <input
                    value={editedTitle}
                    onChange={(event) => setEditedTitle(event.target.value)}
                    className="w-full rounded-lg bg-[#edeeef] px-3 py-2 text-sm font-semibold outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
                  />
                  <input
                    value={editedCategory}
                    onChange={(event) => setEditedCategory(event.target.value)}
                    className="w-full rounded-lg bg-[#edeeef] px-3 py-2 text-sm font-semibold outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
                    placeholder="Category"
                  />
                </>
              ) : (
                <>
                  <h3 className="font-[Manrope] text-2xl font-bold text-[#4c1b87] dark:text-[#d8baff]">{liveExpense.title}</h3>
                  <p className="inline-flex rounded-full bg-[#eddcff] px-2.5 py-1 text-xs font-semibold text-[#4c1b87] dark:bg-[#2f3743] dark:text-[#d8baff]">
                    {liveExpense.category ?? 'Uncategorized'}
                  </p>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditedTitle(liveExpense.title)
                      setEditedCategory(liveExpense.category ?? '')
                    }}
                    disabled={isSaving}
                    className="rounded-lg bg-[#e7e8e9] px-3 py-1.5 text-xs font-bold text-[#4b4451] transition hover:bg-[#e1e3e4] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#2b2b2b] dark:text-[#cac4cf]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => void onSaveExpense()}
                    disabled={isSaving}
                    className="rounded-lg bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-3 py-1.5 text-xs font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setEditedTitle(liveExpense.title)
                    setEditedCategory(liveExpense.category ?? '')
                    setIsEditing(true)
                  }}
                  className="rounded-lg bg-[#e7e8e9] px-3 py-1.5 text-xs font-bold text-[#4b4451] transition hover:bg-[#e1e3e4] dark:bg-[#2b2b2b] dark:text-[#cac4cf]"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => void onDeleteExpense()}
                disabled={deleting || isEditing}
                className="rounded-lg bg-[#fbe9ec] px-3 py-1.5 text-xs font-bold text-[#93000a] transition hover:bg-[#f9dde2] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#3c1f24] dark:text-[#ffb4ab]"
              >
                {deleting ? 'Deleting...' : 'Delete Expense'}
              </button>
            </div>
          </div>
          <p className="mt-1 text-sm text-[#4b4451] dark:text-[#cac4cf]">{liveExpense.summary}</p>

          <section className="mt-6 grid gap-3 md:grid-cols-4">
            {analyticsCards.map((card) => (
              <div key={card.label} className="rounded-lg bg-[#f3f4f5] p-3 dark:bg-[#1e1e1e]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#63707e] dark:text-[#9ea5af]">{card.label}</p>
                <p className="mt-1 text-lg font-bold text-[#1f2328] dark:text-[#f0f1f2]">{card.value}</p>
              </div>
            ))}
          </section>

          <section className="mt-4 rounded-lg bg-[#f3f4f5] p-3 dark:bg-[#1e1e1e]">
            <p className="text-sm font-semibold text-[#1f2328] dark:text-[#f0f1f2]">Participant Breakdown</p>
            {participants.length === 0 ? (
              <p className="mt-2 text-sm text-[#63707e] dark:text-[#9ea5af]">Detailed split breakdown is not available for this expense yet.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {participants.map((row) => (
                  <div key={row.id} className="rounded-md bg-white p-2 dark:bg-[#232627]">
                    <div className="mb-1 flex items-center justify-between text-xs font-semibold text-[#1f2328] dark:text-[#f0f1f2]">
                      <span>{row.name} {row.role === 'PAYER' ? '(Payer)' : row.role === 'YOU' ? '(You)' : ''}</span>
                      <span>{row.amount}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#dde6f2] dark:bg-[#2d3234]">
                      <div className="h-full rounded-full bg-[#4c1b87]" style={{ width: `${percentageValue(row.sharePercent)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-4 grid gap-2 md:grid-cols-2">
            {insights.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg bg-[#f3f4f5] p-3 text-sm dark:bg-[#1e1e1e]">
                <span className="text-[#63707e] dark:text-[#9ea5af]">{item.label}</span>
                <span className="font-semibold text-[#1f2328] dark:text-[#f0f1f2]">{item.value}</span>
              </div>
            ))}
          </section>

          <div className="mt-6 space-y-3">
            {liveExpense.comments.map((comment) => (
              <div key={comment.id} className="rounded-lg bg-[#f3f4f5] p-3 dark:bg-[#1e1e1e]">
                <p className="text-sm text-[#191c1d] dark:text-[#f0f1f2]">{comment.message}</p>
              </div>
            ))}
          </div>
        </article>
      ) : (
        <article className="rounded-xl bg-white p-6 text-sm text-[#4b4451] shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:text-[#cac4cf] dark:ring-[#2d3234]">
          No expense selected yet. Open any transaction from Dashboard or Groups to inspect details and comments.
        </article>
      )}
    </AppShell>
  )
}
