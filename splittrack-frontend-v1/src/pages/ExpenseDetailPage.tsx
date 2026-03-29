import { AppShell } from '../components/AppShell'

export function ExpenseDetailPage() {
  return (
    <AppShell title="Expense Detail" subtitle="Comments and @username mentions">
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
    </AppShell>
  )
}
