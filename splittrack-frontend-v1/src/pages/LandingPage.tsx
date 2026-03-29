import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const featureCards = [
  {
    title: 'Add expenses in under 10s',
    description: 'Swift entry system designed for people on the move. Type, tap, and done.',
    tone: 'bg-[#6437a0] text-white',
  },
  {
    title: 'Automated settlements',
    description: 'Smart debt simplification minimizes payment hops with clear explanation.',
    tone: 'bg-[#9754CB] text-white',
  },
  {
    title: 'Detailed analytics',
    description: 'Editorial-grade charts make monthly spending and category trends obvious.',
    tone: 'bg-[#DEACF5] text-[#28104E]',
  },
]

const faqs = [
  {
    q: 'Is SplitTrack free for college projects?',
    a: 'Yes. Core group tracking, settlements, and exports are available for your project scope.',
  },
  {
    q: 'Can I export data to CSV and PDF?',
    a: 'Yes. Group and user summaries support filtered exports in both formats.',
  },
  {
    q: 'Does it support dark mode?',
    a: 'Yes. Theme follows system preference with a manual override in settings.',
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] dark:bg-[#191c1d] dark:text-[#f0f1f2]">
      <header className="sticky top-0 z-30 border-b border-[#cdc3d3]/30 bg-white/85 backdrop-blur dark:border-[#232627] dark:bg-[#191c1d]/90">
        <nav className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-4 md:px-6">
          <h1 className="font-[Manrope] text-2xl font-black tracking-tight text-[#4c1b87] dark:text-[#d8baff]">SplitTrack</h1>
          <div className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm font-semibold text-[#4b4451] hover:text-[#4c1b87] dark:text-[#cac4cf] dark:hover:text-[#d8baff]">Features</a>
            <a href="#faq" className="text-sm font-semibold text-[#4b4451] hover:text-[#4c1b87] dark:text-[#cac4cf] dark:hover:text-[#d8baff]">FAQ</a>
            <Link to="/login" className="rounded-full bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-5 py-2 text-sm font-bold text-white transition hover:scale-[1.03]">Login</Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-12 px-4 pb-24 pt-16 md:px-6 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}>
            <span className="inline-flex rounded-full bg-[#eddcff] px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#4c1b87]">
              Financial clarity redefined
            </span>
            <h2 className="mt-6 font-[Manrope] text-5xl font-black leading-tight tracking-tight md:text-6xl">
              Split expenses,
              <br />
              not friendships.
            </h2>
            <p className="mt-5 max-w-xl text-lg text-[#4b4451] dark:text-[#cac4cf]">
              A modern expense-sharing workspace with deterministic settlements, deep analytics, and fast entry flows optimized for real groups.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup" className="rounded-xl bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-6 py-3 text-sm font-bold text-white transition hover:scale-[1.02]">
                Get Started
              </Link>
              <Link to="/dashboard" className="rounded-xl bg-[#e7e8e9] px-6 py-3 text-sm font-bold text-[#4c1b87] transition hover:bg-[#e1e3e4] dark:bg-[#2b2b2b] dark:text-[#d8baff]">
                Explore Demo
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl bg-white p-4 shadow-[0px_24px_48px_rgba(40,16,78,0.12)] dark:bg-[#232627]"
          >
            <img
              src="/stitch/public_landing_page/screen.png"
              alt="SplitTrack dashboard preview"
              className="h-full w-full rounded-xl object-cover"
            />
            <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-[#9754CB]/20 blur-2xl" />
            <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-[#6437a0]/20 blur-2xl" />
          </motion.div>
        </section>

        <section id="features" className="bg-[#f3f4f5] py-20 dark:bg-[#1e1e1e]">
          <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6">
            <h3 className="font-[Manrope] text-4xl font-extrabold tracking-tight">Engineered for efficiency</h3>
            <p className="mt-3 max-w-2xl text-[#4b4451] dark:text-[#cac4cf]">Stop wrestling spreadsheets. SplitTrack automates the math and keeps balances transparent.</p>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {featureCards.map((feature, index) => (
                <motion.article
                  key={feature.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.2, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-xl bg-white p-6 ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]"
                >
                  <div className={['mb-4 inline-flex rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider', feature.tone].join(' ')}>
                    {index + 1}
                  </div>
                  <h4 className="font-[Manrope] text-xl font-bold tracking-tight">{feature.title}</h4>
                  <p className="mt-2 text-sm text-[#4b4451] dark:text-[#cac4cf]">{feature.description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto w-full max-w-[920px] px-4 py-20 md:px-6">
          <h3 className="text-center font-[Manrope] text-4xl font-extrabold tracking-tight">Common questions</h3>
          <div className="mt-8 space-y-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[#cdc3d3]/30 open:shadow-md dark:bg-[#232627] dark:ring-[#2d3234]">
                <summary className="cursor-pointer list-none font-semibold text-[#191c1d] dark:text-[#f0f1f2]">{faq.q}</summary>
                <p className="mt-2 text-sm text-[#4b4451] dark:text-[#cac4cf]">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1400px] px-4 pb-20 md:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-8 py-16 text-center text-white md:px-16">
            <h3 className="font-[Manrope] text-4xl font-black tracking-tight md:text-5xl">Ready to clear the air?</h3>
            <p className="mx-auto mt-4 max-w-2xl text-white/90">Join SplitTrack and keep every group expense crystal clear from day one.</p>
            <Link to="/signup" className="mt-8 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#4c1b87] transition hover:scale-[1.03]">
              Create Account
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#cdc3d3]/30 bg-[#f3f4f5] px-4 py-8 text-sm text-[#4b4451] md:px-6 dark:border-[#232627] dark:bg-[#1e1e1e] dark:text-[#cac4cf]">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center justify-between gap-3 md:flex-row">
          <p>© 2026 SplitTrack. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-[#4c1b87] dark:hover:text-[#d8baff]">Privacy</a>
            <a href="#" className="hover:text-[#4c1b87] dark:hover:text-[#d8baff]">Terms</a>
            <a href="#" className="hover:text-[#4c1b87] dark:hover:text-[#d8baff]">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
