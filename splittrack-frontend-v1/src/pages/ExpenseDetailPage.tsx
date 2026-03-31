import { useState } from 'react'
import { AppShell } from '../components/AppShell'
import { deleteExpense, updateExpense } from '../api/appApi'
import { useLiveAppState } from '../api/useLiveAppState'
import { useAuth } from '../auth/AuthProvider'
import { useToast } from '../ui/ToastProvider'

type PageMode = 'live' | 'demo'

type ExpenseDetailPageProps = {
  mode?: PageMode
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

    setIsSaving(true)
    try {
      await updateExpense(accessToken, liveExpense.id, { title: nextTitle })
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
          <p className="mt-1 text-sm text-[#4b4451] dark:text-[#cac4cf]">Paid by Ananya • Total ₹9,800 • Split equally</p>
          <div className="mt-6 space-y-3">
            <div className="rounded-lg bg-[#f3f4f5] p-3 dark:bg-[#1e1e1e]">
              <p className="text-sm text-[#191c1d] dark:text-[#f0f1f2]"><span className="font-bold">@rohan</span> please verify your share.</p>
            </div>
            <div className="rounded-lg bg-[#f3f4f5] p-3 dark:bg-[#1e1e1e]">
              <p className="text-sm text-[#191c1d] dark:text-[#f0f1f2]">Confirmed. Looks good.</p>
            </div>
          </div>
        </article>
      ) : liveExpense ? (
        <article className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
          <div className="flex items-center justify-between gap-3">
            {isEditing ? (
              <input
                value={editedTitle}
                onChange={(event) => setEditedTitle(event.target.value)}
                className="w-full max-w-md rounded-lg bg-[#edeeef] px-3 py-2 text-sm font-semibold outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
              />
            ) : (
              <h3 className="font-[Manrope] text-2xl font-bold text-[#4c1b87] dark:text-[#d8baff]">{liveExpense.title}</h3>
            )}
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditedTitle(liveExpense.title)
                    }}
                    disabled={isSaving}
                    className="rounded-lg bg-[#e7e8e9] px-3 py-1.5 text-xs font-bold text-[#4b4451] transition hover:bg-[#e1e3e4] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#2b2b2b] dark:text-[#cac4cf]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => void onSaveExpense()}
                    disabled={isSaving}
                    className="rounded-lg bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-3 py-1.5 text-xs font-bold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setEditedTitle(liveExpense.title)
                    setIsEditing(true)
                  }}
                  className="rounded-lg bg-[#e7e8e9] px-3 py-1.5 text-xs font-bold text-[#4b4451] transition hover:bg-[#e1e3e4] dark:bg-[#2b2b2b] dark:text-[#cac4cf]"
                >
                  Edit Title
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
