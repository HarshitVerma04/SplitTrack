import { AnimatePresence } from 'framer-motion'
import type { ReactElement } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './auth/AuthProvider'
import { LoginPage, OnboardingPage, SignupPage } from './pages/AuthPages'
import { AnalyticsDeepPage } from './pages/AnalyticsDeepPage'
import { AddExpensePage } from './pages/AddExpensePage'
import { DashboardPage } from './pages/DashboardPage'
import { ExpenseDetailPage } from './pages/ExpenseDetailPage'
import { ExportsPage } from './pages/ExportsPage'
import { GroupLedgerPage } from './pages/GroupLedgerPage'
import { LandingPage } from './pages/LandingPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { OneOnOnePage } from './pages/OneOnOnePage'
import { SettingsPage } from './pages/SettingsPage'
import { SettlementsPage } from './pages/SettlementsPage'

function RequireAuth({ children }: { children: ReactElement }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="grid min-h-screen place-items-center text-sm text-[#4b4451] dark:text-[#cac4cf]">Checking session...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/group-ledger" element={<RequireAuth><GroupLedgerPage /></RequireAuth>} />
        <Route path="/add-expense" element={<RequireAuth><AddExpensePage /></RequireAuth>} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupPage />} />
        <Route path="/onboarding" element={<RequireAuth><OnboardingPage /></RequireAuth>} />
        <Route path="/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
        <Route path="/settlements" element={<RequireAuth><SettlementsPage /></RequireAuth>} />
        <Route path="/one-on-one" element={<RequireAuth><OneOnOnePage /></RequireAuth>} />
        <Route path="/analytics-deep" element={<RequireAuth><AnalyticsDeepPage /></RequireAuth>} />
        <Route path="/exports" element={<RequireAuth><ExportsPage /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
        <Route path="/expense-detail" element={<RequireAuth><ExpenseDetailPage /></RequireAuth>} />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/landing'} replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default App
