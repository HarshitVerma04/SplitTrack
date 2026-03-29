import { AnimatePresence } from 'framer-motion'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { StitchFrame } from './components/StitchFrame'
import { LoginPage, OnboardingPage, SignupPage } from './pages/AuthPages'
import { AnalyticsDeepPage } from './pages/AnalyticsDeepPage'
import { ExpenseDetailPage } from './pages/ExpenseDetailPage'
import { ExportsPage } from './pages/ExportsPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { OneOnOnePage } from './pages/OneOnOnePage'
import { SettingsPage } from './pages/SettingsPage'
import { SettlementsPage } from './pages/SettlementsPage'

function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/landing"
          element={
            <StitchFrame
              title="SplitTrack Public Landing"
              src="/stitch/public_landing_page/code.html"
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            <StitchFrame
              title="SplitTrack Dashboard"
              src="/stitch/main_dashboard/code.html"
            />
          }
        />
        <Route
          path="/group-ledger"
          element={
            <StitchFrame
              title="SplitTrack Group Ledger"
              src="/stitch/group_ledger_dark_mode/code.html"
            />
          }
        />
        <Route
          path="/add-expense"
          element={
            <StitchFrame
              title="SplitTrack Add Expense"
              src="/stitch/add_expense_itemized_split/code.html"
            />
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settlements" element={<SettlementsPage />} />
        <Route path="/one-on-one" element={<OneOnOnePage />} />
        <Route path="/analytics-deep" element={<AnalyticsDeepPage />} />
        <Route path="/exports" element={<ExportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/expense-detail" element={<ExpenseDetailPage />} />
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default App
