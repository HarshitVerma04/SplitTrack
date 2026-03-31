import { Bell, ChartNoAxesColumn, FileDown, HandCoins, House, Menu, Moon, ReceiptText, Settings, Sun, UserRound, Users, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState, type PropsWithChildren } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { usePageTitle } from '../hooks/usePageTitle'
import { useTheme } from '../theme/ThemeProvider'

type AppShellProps = PropsWithChildren<{
  title: string
  subtitle?: string
  mode?: 'live' | 'demo'
}>

const navItems = [
  { liveTo: '/dashboard', demoTo: '/demo', label: 'Dashboard', icon: House },
  { liveTo: '/group-ledger', demoTo: '/demo/group-ledger', label: 'Groups', icon: Users },
  { liveTo: '/notifications', demoTo: '/demo/notifications', label: 'Notifications', icon: Bell },
  { liveTo: '/settlements', demoTo: '/demo/settlements', label: 'Settlements', icon: HandCoins },
  { liveTo: '/analytics-deep', demoTo: '/demo/analytics-deep', label: 'Analytics', icon: ChartNoAxesColumn },
  { liveTo: '/exports', demoTo: '/demo/exports', label: 'Exports', icon: FileDown },
  { liveTo: '/expense-detail', demoTo: '/demo/expense-detail', label: 'Expense Detail', icon: ReceiptText },
  { liveTo: '/settings', demoTo: '/demo/settings', label: 'Settings', icon: Settings },
]

export function AppShell({ title, subtitle, mode = 'live', children }: AppShellProps) {
  usePageTitle(title)
  const { resolvedTheme, toggleTheme } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', onDocumentClick)
    return () => document.removeEventListener('mousedown', onDocumentClick)
  }, [])

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false)
  }, [title])

  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? 'U'
  const isDemo = mode === 'demo'

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] dark:bg-[#1b2028] dark:text-[#eef1f4]">
      <div className="mx-auto flex w-full max-w-[1600px]">
        {/* Desktop Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[#cdc3d3]/40 bg-[#f3f4f5] px-3 py-6 dark:border-[#2d3440] dark:bg-[#202631] lg:flex">
          <div className="px-3">
            <h1 className="font-[Manrope] text-xl font-extrabold tracking-tight text-[#4c1b87] dark:text-[#d8baff]">
              SplitTrack
            </h1>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4b4451] dark:text-[#cac4cf]">
              Editorial Expense Tracking
            </p>
          </div>
          <nav className="mt-8 space-y-1">
            {navItems.map(({ liveTo, demoTo, label, icon: Icon }) => {
              const to = isDemo ? demoTo : liveTo
              return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition will-change-transform hover:-translate-y-0.5',
                    isActive
                      ? 'bg-white text-[#4c1b87] shadow-sm dark:bg-[#2b2b2b] dark:text-[#d8baff]'
                      : 'text-[#4b4451] hover:bg-[#e7e8e9] dark:text-[#cac4cf] dark:hover:bg-[#232627]',
                  ].join(' ')
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
              )
            })}
          </nav>
        </aside>

        {/* Mobile Navigation Overlay */}
        <AnimatePresence>
          {mobileNavOpen ? (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                onClick={() => setMobileNavOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-[#cdc3d3]/40 bg-[#f3f4f5] px-3 py-6 shadow-2xl dark:border-[#2d3440] dark:bg-[#202631] lg:hidden"
              >
                <div className="flex items-center justify-between px-3">
                  <h1 className="font-[Manrope] text-xl font-extrabold tracking-tight text-[#4c1b87] dark:text-[#d8baff]">
                    SplitTrack
                  </h1>
                  <button
                    onClick={() => setMobileNavOpen(false)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#4b4451] transition hover:bg-[#e7e8e9] dark:text-[#cac4cf] dark:hover:bg-[#232627]"
                    aria-label="Close mobile menu"
                  >
                    <X size={18} />
                  </button>
                </div>
                <nav className="mt-6 space-y-1">
                  {navItems.map(({ liveTo, demoTo, label, icon: Icon }) => {
                    const to = isDemo ? demoTo : liveTo
                    return (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => setMobileNavOpen(false)}
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
                    )
                  })}
                </nav>
              </motion.aside>
            </>
          ) : null}
        </AnimatePresence>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-[#cdc3d3]/40 bg-white/90 px-4 py-4 backdrop-blur md:px-6 dark:border-[#2d3440] dark:bg-[#1b2028]/95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Mobile hamburger */}
                <button
                  onClick={() => setMobileNavOpen(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f4f5] text-[#4c1b87] transition hover:-translate-y-0.5 hover:scale-105 dark:bg-[#2a3039] dark:text-[#d8baff] lg:hidden"
                  aria-label="Open navigation menu"
                >
                  <Menu size={18} />
                </button>
                <div>
                  <h2 className="font-[Manrope] text-xl font-bold tracking-tight text-[#4c1b87] dark:text-[#d8baff]">
                    {title}
                  </h2>
                  {subtitle ? (
                    <p className="text-sm text-[#4b4451] dark:text-[#cac4cf]">{subtitle}</p>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f4f5] text-[#4c1b87] transition hover:-translate-y-0.5 hover:scale-105 dark:bg-[#2a3039] dark:text-[#d8baff]"
                  aria-label="Toggle theme"
                >
                  {resolvedTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                </button>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((value) => !value)}
                    className="inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-full bg-[#f3f4f5] px-3 text-[#4c1b87] transition hover:-translate-y-0.5 hover:scale-105 dark:bg-[#2a3039] dark:text-[#d8baff]"
                  >
                    <UserRound size={16} />
                    <span className="text-xs font-bold">{userInitial}</span>
                  </button>
                  {menuOpen ? (
                    <div className="absolute right-0 z-50 mt-2 w-44 rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-[#cdc3d3]/50 dark:bg-[#242b35] dark:ring-[#384150]">
                      {isAuthenticated ? (
                        <>
                          <button
                            onClick={() => {
                              setMenuOpen(false)
                              navigate(isDemo ? '/demo/settings' : '/settings')
                            }}
                            className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#191c1d] hover:bg-[#eceff3] dark:text-[#eef1f4] dark:hover:bg-[#2f3743]"
                          >
                            Settings
                          </button>
                          <button
                            onClick={() => {
                              logout()
                              setMenuOpen(false)
                              navigate('/login')
                            }}
                            className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#b42318] hover:bg-[#fef3f2] dark:text-[#fda29b] dark:hover:bg-[#3a2a2a]"
                          >
                            Logout
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setMenuOpen(false)
                            navigate('/login')
                          }}
                          className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#191c1d] hover:bg-[#eceff3] dark:text-[#eef1f4] dark:hover:bg-[#2f3743]"
                        >
                          Login
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>
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
