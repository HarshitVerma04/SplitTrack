import { AnimatePresence, motion } from 'framer-motion'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

type StitchFrameProps = {
  title: string
  src: string
}

const pageTransition = {
  duration: 0.2,
  ease: [0.22, 1, 0.36, 1],
} as const

function StitchFrame({ title, src }: StitchFrameProps) {
  return (
    <motion.main
      key={src}
      aria-label={title}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={pageTransition}
      className="h-screen w-screen overflow-hidden"
    >
      <iframe
        title={title}
        src={src}
        className="h-full w-full border-0"
        loading="eager"
      />
    </motion.main>
  )
}

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
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default App
