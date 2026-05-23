import { AppShell } from '../components/AppShell'
import { useLiveAppState } from '../api/useLiveAppState'
import { mockOneOnOneLedger } from '../data/mock'

type PageMode = 'live' | 'demo'

type OneOnOnePageProps = {
  mode?: PageMode
}

export function OneOnOnePage({ mode = 'live' }: OneOnOnePageProps) {
  const isDemo = mode === 'demo'
  const { appState, isLoading, error } = useLiveAppState(mode)
  const rows = isDemo ? mockOneOnOneLedger : appState?.oneOnOne.items ?? []

  return (
    <AppShell
      mode={mode}
      title="1-on-1 Ledger"
      subtitle={isDemo ? 'Track balances between two users' : 'No one-on-one entries yet.'}
    >
      {!isDemo && isLoading ? (
        <div className="mb-4 rounded-xl bg-white p-4 text-sm text-[#4b4451] shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:text-[#cac4cf] dark:ring-[#2d3234]">
          Loading one-on-one ledger...
        </div>
      ) : null}
      {!isDemo && error ? (
        <div className="mb-4 rounded-xl bg-[#fff4f4] p-4 text-sm text-[#93000a] shadow-sm ring-1 ring-[#ffdad6] dark:bg-[#3b2222] dark:text-[#ffb4ab] dark:ring-[#5c3030]">
          Could not load one-on-one data: {error}
        </div>
      ) : null}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
        <div className="grid grid-cols-3 bg-[#f3f4f5] px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#4b4451] dark:bg-[#1e1e1e] dark:text-[#cac4cf]">
          <span>Expense</span>
          <span>Total</span>
          <span>Your Share</span>
        </div>
        {rows.map((item) => (
          <div key={item.id} className="grid grid-cols-3 px-4 py-4 text-sm text-[#191c1d] dark:text-[#f0f1f2]">
            <span>{item.title}</span>
            <span>₹{item.amount.toLocaleString('en-IN')}</span>
            <span className="font-semibold text-[#4c1b87] dark:text-[#d8baff]">₹{item.yourShare.toLocaleString('en-IN')}</span>
          </div>
        ))}
        {rows.length === 0 ? (
          <div className="px-4 py-6 text-sm text-[#4b4451] dark:text-[#cac4cf]">
            No one-on-one expenses yet. Add a direct split to populate this ledger.
          </div>
        ) : null}
      </div>
    </AppShell>
  )
}
