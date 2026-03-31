import { AppShell } from '../components/AppShell'
import { useLiveAppState } from '../api/useLiveAppState'

type PageMode = 'live' | 'demo'

type AnalyticsDeepPageProps = {
  mode?: PageMode
}

const demoCards = [
  { label: 'Monthly Spend', value: '₹84,250', tone: 'from-[#4c1b87] to-[#6437a0]' },
  { label: 'Top Category', value: 'Food', tone: 'from-[#6437a0] to-[#9754CB]' },
  { label: 'Highest Contributor', value: 'You', tone: 'from-[#9754CB] to-[#DEACF5]' },
]

const emptyCards = [
  { label: 'Monthly Spend', value: '₹0', tone: 'from-[#4c1b87] to-[#6437a0]' },
  { label: 'Top Category', value: 'N/A', tone: 'from-[#6437a0] to-[#9754CB]' },
  { label: 'Highest Contributor', value: 'N/A', tone: 'from-[#9754CB] to-[#DEACF5]' },
]

export function AnalyticsDeepPage({ mode = 'live' }: AnalyticsDeepPageProps) {
  const isDemo = mode === 'demo'
  const { appState, isLoading, error } = useLiveAppState(mode)
  const cards = isDemo
    ? demoCards
    : (appState?.analytics.cards ?? emptyCards).map((card) => ({
        ...card,
        tone:
          card.label === 'Monthly Spend'
            ? 'from-[#4c1b87] to-[#6437a0]'
            : card.label === 'Top Category'
              ? 'from-[#6437a0] to-[#9754CB]'
              : 'from-[#9754CB] to-[#DEACF5]',
      }))

  return (
    <AppShell
      mode={mode}
      title="Analytics"
      subtitle={isDemo ? 'IST monthly summaries and category trends' : 'No analytics yet. Add expenses to see trends.'}
    >
      {!isDemo && isLoading ? (
        <section className="mb-4 rounded-xl bg-white p-4 text-sm text-[#4b4451] shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:text-[#cac4cf] dark:ring-[#2d3234]">
          Loading analytics...
        </section>
      ) : null}
      {!isDemo && error ? (
        <section className="mb-4 rounded-xl bg-[#fff4f4] p-4 text-sm text-[#93000a] shadow-sm ring-1 ring-[#ffdad6] dark:bg-[#3b2222] dark:text-[#ffb4ab] dark:ring-[#5c3030]">
          Could not load analytics: {error}
        </section>
      ) : null}
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
