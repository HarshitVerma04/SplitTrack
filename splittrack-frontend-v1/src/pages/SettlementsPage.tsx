import { AppShell } from '../components/AppShell'
import { mockSettlements } from '../data/mock'

export function SettlementsPage() {
  return (
    <AppShell title="Settlement Requests" subtitle="Accept one suggested transaction at a time">
      <div className="grid gap-4 md:grid-cols-2">
        {mockSettlements.map((item) => (
          <article
            key={item.id}
            className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]"
          >
            <p className="text-sm text-[#4b4451] dark:text-[#cac4cf]">{item.from} → {item.to}</p>
            <p className="mt-1 font-[Manrope] text-3xl font-extrabold text-[#4c1b87] dark:text-[#d8baff]">
              ₹{item.amount.toLocaleString('en-IN')}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4b4451] dark:text-[#cac4cf]">
                {item.status}
              </span>
              <button className="rounded-lg bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-4 py-2 text-sm font-bold text-white transition hover:scale-[1.02]">
                Accept
              </button>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  )
}
