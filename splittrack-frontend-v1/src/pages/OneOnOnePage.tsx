import { AppShell } from '../components/AppShell'
import { mockOneOnOneLedger } from '../data/mock'

export function OneOnOnePage() {
  return (
    <AppShell title="1-on-1 Ledger" subtitle="Track balances between two users">
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
        <div className="grid grid-cols-3 bg-[#f3f4f5] px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#4b4451] dark:bg-[#1e1e1e] dark:text-[#cac4cf]">
          <span>Expense</span>
          <span>Total</span>
          <span>Your Share</span>
        </div>
        {mockOneOnOneLedger.map((item) => (
          <div key={item.id} className="grid grid-cols-3 px-4 py-4 text-sm text-[#191c1d] dark:text-[#f0f1f2]">
            <span>{item.title}</span>
            <span>₹{item.amount.toLocaleString('en-IN')}</span>
            <span className="font-semibold text-[#4c1b87] dark:text-[#d8baff]">₹{item.yourShare.toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>
    </AppShell>
  )
}
