import { motion } from 'framer-motion'
import { CalendarDays, ChevronRight, Filter, Plus, Tags, UsersRound } from 'lucide-react'
import { AppShell } from '../components/AppShell'

const members = [
  { id: 'm1', name: 'Ananya Sharma', status: 'Owes you', amount: '+₹12,400', tone: 'text-[#ba1a1a]' },
  { id: 'm2', name: 'Rohan Verma', status: 'You owe', amount: '-₹4,200', tone: 'text-[#4c1b87]' },
  { id: 'm3', name: 'Vikram Singh', status: 'All clear', amount: 'Settled', tone: 'text-[#4b4451]' },
]

const ledgerDays = [
  {
    date: '14-03-2026',
    rows: [
      { id: 'r1', title: 'Seafood Dinner at Brittos', category: 'Food', payer: 'Ananya Sharma', split: 'Split equally', yourShare: '₹2,450', total: '₹9,800' },
      { id: 'r2', title: 'Airport Taxi', category: 'Transport', payer: 'You', split: 'Split equally', yourShare: '₹600', total: '₹2,400' },
    ],
  },
  {
    date: '13-03-2026',
    rows: [
      { id: 'r3', title: 'Villa Booking Deposit', category: 'Stay', payer: 'Rohan Verma', split: 'Split unevenly', yourShare: '₹7,500', total: '₹30,000' },
    ],
  },
]

export function GroupLedgerPage() {
  return (
    <AppShell title="Goa Trip 2026" subtitle="Trip ledger and member-level balances">
      <section className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-[#eddcff] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#4c1b87]">Active Trip</span>
            <span className="inline-flex items-center gap-1 text-xs text-[#4b4451] dark:text-[#cac4cf]"><CalendarDays size={12} />Mar 12 - Mar 20, 2026</span>
          </div>
          <h3 className="font-[Manrope] text-4xl font-extrabold tracking-tight text-[#191c1d] dark:text-[#f0f1f2]">Goa Trip 2026</h3>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#4b4451] dark:text-[#cac4cf]">Total Group Spending</p>
          <p className="font-[Manrope] text-3xl font-extrabold text-[#4c1b87] dark:text-[#d8baff]">₹84,250.00</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {members.map((member, index) => (
          <motion.article
            key={member.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#eddcff] text-[#4c1b87] dark:bg-[#2b2b2b] dark:text-[#d8baff]">
                <UsersRound size={16} />
              </div>
              <span className={['text-xs font-bold', member.tone].join(' ')}>{member.amount}</span>
            </div>
            <p className="font-semibold text-[#191c1d] dark:text-[#f0f1f2]">{member.name}</p>
            <p className="text-xs text-[#4b4451] dark:text-[#cac4cf]">{member.status}</p>
          </motion.article>
        ))}
        <button className="rounded-xl border border-dashed border-[#7c7483]/40 bg-[#f3f4f5] p-5 text-sm font-semibold text-[#4c1b87] transition hover:bg-[#e7e8e9] dark:border-[#4b4451] dark:bg-[#1e1e1e] dark:text-[#d8baff] dark:hover:bg-[#232627]">
          + Add Member
        </button>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#cdc3d3]/30 px-5 py-4 dark:border-[#2d3234]">
          <div className="inline-flex items-center gap-2">
            <Filter size={16} className="text-[#4b4451] dark:text-[#cac4cf]" />
            <h4 className="font-[Manrope] text-lg font-bold tracking-tight text-[#191c1d] dark:text-[#f0f1f2]">Activity Ledger</h4>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="inline-flex items-center gap-1 rounded-full bg-[#f3f4f5] px-3 py-2 text-xs font-semibold text-[#4b4451] dark:bg-[#1e1e1e] dark:text-[#cac4cf]"><CalendarDays size={12} />All Dates</button>
            <button className="inline-flex items-center gap-1 rounded-full bg-[#f3f4f5] px-3 py-2 text-xs font-semibold text-[#4b4451] dark:bg-[#1e1e1e] dark:text-[#cac4cf]"><UsersRound size={12} />Everyone</button>
            <button className="inline-flex items-center gap-1 rounded-full bg-[#f3f4f5] px-3 py-2 text-xs font-semibold text-[#4b4451] dark:bg-[#1e1e1e] dark:text-[#cac4cf]"><Tags size={12} />Categories</button>
          </div>
        </div>

        {ledgerDays.map((day) => (
          <div key={day.date}>
            <div className="bg-[#f3f4f5] px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-[#4b4451] dark:bg-[#1e1e1e] dark:text-[#cac4cf]">
              {day.date}
            </div>
            {day.rows.map((row, index) => (
              <motion.article
                key={row.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-1 gap-4 px-5 py-4 transition hover:bg-[#f8f9fa] md:grid-cols-[1fr_auto_auto_auto] md:items-center dark:hover:bg-[#1e1e1e]"
              >
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <p className="font-semibold text-[#191c1d] dark:text-[#f0f1f2]">{row.title}</p>
                    <span className="rounded bg-[#e7e8e9] px-2 py-0.5 text-[10px] font-semibold text-[#4b4451] dark:bg-[#2b2b2b] dark:text-[#cac4cf]">{row.category}</span>
                  </div>
                  <p className="text-xs text-[#4b4451] dark:text-[#cac4cf]">Paid by {row.payer} • {row.split}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#4b4451] dark:text-[#cac4cf]">Your share</p>
                  <p className="font-[Manrope] text-lg font-extrabold text-[#4c1b87] dark:text-[#d8baff]">{row.yourShare}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#4b4451] dark:text-[#cac4cf]">Total</p>
                  <p className="font-[Manrope] text-lg font-extrabold text-[#191c1d] dark:text-[#f0f1f2]">{row.total}</p>
                </div>
                <div className="flex justify-end text-[#4b4451] dark:text-[#cac4cf]">
                  <ChevronRight size={18} />
                </div>
              </motion.article>
            ))}
          </div>
        ))}
      </section>

      <section className="mt-6 flex flex-wrap gap-3">
        <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02]">
          <Plus size={16} /> Add Expense
        </button>
      </section>
    </AppShell>
  )
}
