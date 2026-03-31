import { motion } from 'framer-motion'
import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

function AuthLayout({
  title,
  subtitle,
  cta,
  ctaHref,
  children,
}: {
  title: string
  subtitle: string
  cta: string
  ctaHref: string
  children: ReactNode
}) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f8f9fa] px-4 dark:bg-[#191c1d]">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0px_24px_48px_rgba(40,16,78,0.08)] dark:bg-[#232627]"
      >
        <h1 className="font-[Manrope] text-3xl font-extrabold tracking-tight text-[#4c1b87] dark:text-[#d8baff]">{title}</h1>
        <p className="mt-1 text-sm text-[#4b4451] dark:text-[#cac4cf]">{subtitle}</p>
        <div className="mt-6">{children}</div>
        <Link to={ctaHref} className="mt-4 inline-block text-sm font-semibold text-[#4c1b87] dark:text-[#d8baff]">
          {cta}
        </Link>
      </motion.div>
    </div>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      navigate('/dashboard', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not login. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome Back" subtitle="Login to continue" cta="Create account" ctaHref="/signup">
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full rounded-lg bg-[#edeeef] p-3 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          className="w-full rounded-lg bg-[#edeeef] p-3 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
        />
        {error ? <p className="text-xs font-semibold text-[#93000a]">{error}</p> : null}
        <button
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-br from-[#4c1b87] to-[#6437a0] py-3 text-sm font-bold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Signing in...' : 'Continue'}
        </button>
      </form>
    </AuthLayout>
  )
}

export function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup({ name, email, password })
      navigate('/dashboard', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign up. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create Account" subtitle="Start splitting expenses" cta="Already have an account" ctaHref="/login">
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full rounded-lg bg-[#edeeef] p-3 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
          placeholder="Full Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          minLength={2}
          maxLength={120}
          required
        />
        <input
          className="w-full rounded-lg bg-[#edeeef] p-3 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          className="w-full rounded-lg bg-[#edeeef] p-3 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
        />
        {error ? <p className="text-xs font-semibold text-[#93000a]">{error}</p> : null}
        <button
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-br from-[#4c1b87] to-[#6437a0] py-3 text-sm font-bold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Creating account...' : 'Continue'}
        </button>
      </form>
    </AuthLayout>
  )
}

export function OnboardingPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f8f9fa] px-4 dark:bg-[#191c1d]">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0px_24px_48px_rgba(40,16,78,0.08)] dark:bg-[#232627]">
        <h1 className="font-[Manrope] text-3xl font-extrabold tracking-tight text-[#4c1b87] dark:text-[#d8baff]">One-step setup</h1>
        <p className="mt-1 text-sm text-[#4b4451] dark:text-[#cac4cf]">Pick username and phone (optional).</p>
        <div className="mt-6 space-y-3">
          <input className="w-full rounded-lg bg-[#edeeef] p-3 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]" placeholder="Username" />
          <input className="w-full rounded-lg bg-[#edeeef] p-3 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]" placeholder="Phone (optional)" />
          <Link to="/dashboard" className="block w-full rounded-lg bg-gradient-to-br from-[#4c1b87] to-[#6437a0] py-3 text-center text-sm font-bold text-white transition hover:scale-[1.01]">
            Finish
          </Link>
        </div>
      </div>
    </div>
  )
}
