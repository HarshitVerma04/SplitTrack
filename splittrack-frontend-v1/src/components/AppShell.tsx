import { Bell, ChartNoAxesColumn, FileDown, HandCoins, House, Moon, ReceiptText, Settings, Sun, UserRound, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import type { PropsWithChildren } from 'react'
import { useTheme } from '../theme/ThemeProvider'

type AppShellProps = PropsWithChildren<{
  title: string
  subtitle?: string
}>

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: House },
  { to: '/group-ledger', label: 'Groups', icon: Users },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settlements', label: 'Settlements', icon: HandCoins },
  { to: '/analytics-deep', label: 'Analytics', icon: ChartNoAxesColumn },
  { to: '/exports', label: 'Exports', icon: FileDown },
  { to: '/expense-detail', label: 'Expense Detail', icon: ReceiptText },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function AppShell({ title, subtitle, children }: AppShellProps) {
  const { resolvedTheme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] dark:bg-[#191c1d] dark:text-[#f0f1f2]">
      <div className="mx-auto flex w-full max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[#cdc3d3]/40 bg-[#f3f4f5] px-3 py-6 dark:border-[#232627] dark:bg-[#1e1e1e] lg:flex">
          <div className="px-3">
            <h1 className="font-[Manrope] text-xl font-extrabold tracking-tight text-[#4c1b87] dark:text-[#d8baff]">
              SplitTrack
            </h1>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4b4451] dark:text-[#cac4cf]">
              Editorial Expense Tracking
            </p>
          </div>
          <nav className="mt-8 space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition',
                    isActive
                      ? 'bg-white text-[#4c1b87] shadow-sm dark:bg-[#2b2b2b] dark:text-[#d8baff]'
                      : 'text-[#4b4451] hover:bg-[#e7e8e9] dark:text-[#cac4cf] dark:hover:bg-[#232627]',
                  ].join(' ')
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-[#cdc3d3]/40 bg-white/90 px-4 py-4 backdrop-blur md:px-6 dark:border-[#232627] dark:bg-[#191c1d]/95">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-[Manrope] text-xl font-bold tracking-tight text-[#4c1b87] dark:text-[#d8baff]">
                  {title}
                </h2>
                {subtitle ? (
                  <p className="text-sm text-[#4b4451] dark:text-[#cac4cf]">{subtitle}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f4f5] text-[#4c1b87] transition hover:scale-105 dark:bg-[#232627] dark:text-[#d8baff]"
                  aria-label="Toggle theme"
                >
                  {resolvedTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                </button>
                <button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f4f5] text-[#4c1b87] transition hover:scale-105 dark:bg-[#232627] dark:text-[#d8baff]">
                  <UserRound size={18} />
                </button>
              </div>
            </div>
          </header>

          <motion.main
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="p-4 md:p-6"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  )
}
