import { useState } from 'react'
import { AppShell } from '../components/AppShell'
import { mockSettlements } from '../data/mock'

export function SettlementsPage() {
  const [settlements, setSettlements] = useState(
    mockSettlements.map((item) => ({ ...item, partialAmount: item.amount })),
  )

  function acceptSettlement(id: string) {
    setSettlements((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'Accepted', amount: item.partialAmount }
          : item,
      ),
    )
  }

  return (
    <AppShell title="Settlement Requests" subtitle="Accept one suggested transaction at a time">
      <div className="grid gap-4 md:grid-cols-2">
        {settlements.map((item) => {
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
                {item.status}
              </span>
              <button
                disabled={item.status === 'Accepted' || invalid}
                onClick={() => acceptSettlement(item.id)}
                className="rounded-lg bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-4 py-2 text-sm font-bold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Accept
              </button>
            </div>
          </article>
          )
        })}
      </div>
    </AppShell>
  )
}
