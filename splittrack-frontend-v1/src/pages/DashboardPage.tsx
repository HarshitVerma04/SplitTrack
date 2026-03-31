import { motion } from 'framer-motion'
import { ArrowUpRight, Bolt, CircleDollarSign, HandCoins, Plus, ReceiptIndianRupee, UsersRound } from 'lucide-react'
import { AppShell } from '../components/AppShell'

const summaryCards = [
  { label: 'Total Net Balance', value: '₹12,450.00', note: '+14% from last month', icon: CircleDollarSign },
  { label: 'You are owed', value: '₹18,200.00', note: '8 pending receipts', icon: ArrowUpRight },
  { label: 'You owe', value: '₹5,750.00', note: '3 pending payouts', icon: HandCoins },
]

const recentActivity = [
  { id: 'a1', title: 'Dinner at Soho House', group: 'Weekend Trip', amount: '₹4,200.00', time: '2 hours ago', tone: 'text-[#4c1b87]' },
  { id: 'a2', title: 'Electricity Bill', group: 'Flatmates', amount: '- ₹1,150.00', time: 'Yesterday', tone: 'text-[#ba1a1a]' },
  { id: 'a3', title: 'Airport Taxi', group: 'Goa Trip 2026', amount: '₹2,400.00', time: '2 days ago', tone: 'text-[#4c1b87]' },
]

const groups = [
  { id: 'g1', name: 'Goa Trip 2026', members: 8, spend: '₹84,250.00' },
  { id: 'g2', name: 'Flatmates Central', members: 4, spend: '₹22,300.00' },
  { id: 'g3', name: 'Weekend Brunch', members: 6, spend: '₹12,540.00' },
]

export function DashboardPage() {
  return (
    <AppShell title="Dashboard" subtitle="Financial clarity at a glance">
      <section className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card, index) => {
          const Icon = card.icon

          return (
            <motion.article
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
              className="card-interactive rounded-xl bg-white p-5 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-[#4b4451] dark:text-[#cac4cf]">{card.label}</p>
                <div className="rounded-lg bg-[#eddcff] p-2 text-[#4c1b87] dark:bg-[#2b2b2b] dark:text-[#d8baff]">
                  <Icon size={16} />
                </div>
              </div>
              <p className="font-[Manrope] text-3xl font-extrabold tracking-tight text-[#191c1d] dark:text-[#f0f1f2]">{card.value}</p>
              <p className="mt-2 text-xs font-semibold text-[#4b4451] dark:text-[#cac4cf]">{card.note}</p>
            </motion.article>
          )
        })}
      </section>

      <section className="mt-6 flex flex-wrap gap-3">
        <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:scale-[1.02]">
          <Plus size={16} /> Add Expense
        </button>
        <button className="inline-flex items-center gap-2 rounded-xl bg-[#e7e8e9] px-5 py-3 text-sm font-bold text-[#4c1b87] transition hover:-translate-y-0.5 hover:bg-[#e1e3e4] dark:bg-[#2b2b2b] dark:text-[#d8baff]">
          <Bolt size={16} /> Settle Now
        </button>
        <button className="inline-flex items-center gap-2 rounded-xl bg-[#e7e8e9] px-5 py-3 text-sm font-bold text-[#4c1b87] transition hover:-translate-y-0.5 hover:bg-[#e1e3e4] dark:bg-[#2b2b2b] dark:text-[#d8baff]">
          <UsersRound size={16} /> New Group
        </button>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-[Manrope] text-2xl font-bold tracking-tight text-[#191c1d] dark:text-[#f0f1f2]">Recent Activity</h3>
            <button className="text-sm font-semibold text-[#4c1b87] dark:text-[#d8baff]">View all</button>
          </div>
          <div className="space-y-3">
            {recentActivity.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="card-interactive rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#191c1d] dark:text-[#f0f1f2]">{item.title}</p>
                    <p className="text-xs text-[#4b4451] dark:text-[#cac4cf]">{item.group} • {item.time}</p>
                  </div>
                  <p className={['font-[Manrope] text-lg font-extrabold tracking-tight', item.tone].join(' ')}>{item.amount}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-[Manrope] text-2xl font-bold tracking-tight text-[#191c1d] dark:text-[#f0f1f2]">Active Groups</h3>
            <span className="rounded bg-[#e7e8e9] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#4b4451] dark:bg-[#2b2b2b] dark:text-[#cac4cf]">
              {groups.length} total
            </span>
          </div>
          <div className="space-y-3">
            {groups.map((group, index) => (
              <motion.article
                key={group.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="card-interactive rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]"
              >
                <p className="font-semibold text-[#191c1d] dark:text-[#f0f1f2]">{group.name}</p>
                <div className="mt-1 flex items-center justify-between text-xs text-[#4b4451] dark:text-[#cac4cf]">
                  <span>{group.members} members</span>
                  <span className="inline-flex items-center gap-1"><ReceiptIndianRupee size={12} />{group.spend}</span>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  )
}
