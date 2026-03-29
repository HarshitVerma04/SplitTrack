import { AppShell } from '../components/AppShell'

const exportsData = [
  { id: 'e1', type: 'CSV', scope: 'Goa Trip 2026', generatedAt: '30-03-2026 09:12 IST' },
  { id: 'e2', type: 'PDF', scope: 'Personal Summary', generatedAt: '29-03-2026 18:40 IST' },
]

export function ExportsPage() {
  return (
    <AppShell title="Export Center" subtitle="Generate plain structured CSV and PDF reports">
      <div className="mb-4 flex flex-wrap gap-3">
        <button className="rounded-lg bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-4 py-2 text-sm font-bold text-white transition hover:scale-[1.02]">
          Export CSV
        </button>
        <button className="rounded-lg bg-[#e7e8e9] px-4 py-2 text-sm font-bold text-[#4c1b87] transition hover:bg-[#e1e3e4] dark:bg-[#2b2b2b] dark:text-[#d8baff]">
          Export PDF
        </button>
      </div>
      <div className="space-y-3">
        {exportsData.map((item) => (
          <div key={item.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
            <p className="font-semibold text-[#191c1d] dark:text-[#f0f1f2]">{item.type} • {item.scope}</p>
            <p className="text-xs text-[#4b4451] dark:text-[#cac4cf]">Generated {item.generatedAt}</p>
          </div>
        ))}
      </div>
    </AppShell>
  )
}
