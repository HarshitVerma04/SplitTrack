import { AppShell } from '../components/AppShell'

const cards = [
  { label: 'Monthly Spend', value: '₹84,250', tone: 'from-[#4c1b87] to-[#6437a0]' },
  { label: 'Top Category', value: 'Food', tone: 'from-[#6437a0] to-[#9754CB]' },
  { label: 'Highest Contributor', value: 'You', tone: 'from-[#9754CB] to-[#DEACF5]' },
]

export function AnalyticsDeepPage() {
  return (
    <AppShell title="Analytics" subtitle="IST monthly summaries and category trends">
      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card.label} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
            <p className="text-xs font-bold uppercase tracking-widest text-[#4b4451] dark:text-[#cac4cf]">{card.label}</p>
            <p className="mt-3 font-[Manrope] text-3xl font-extrabold text-[#191c1d] dark:text-[#f0f1f2]">{card.value}</p>
            <div className={['mt-4 h-2 rounded-full bg-gradient-to-r', card.tone].join(' ')} />
          </article>
        ))}
      </section>
    </AppShell>
  )
}
