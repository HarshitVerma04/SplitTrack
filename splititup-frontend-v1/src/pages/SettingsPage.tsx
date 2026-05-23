import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveAppState } from '../api/useLiveAppState'
import { useAuth } from '../auth/AuthProvider'
import { updateMe } from '../auth/authApi'
import { AppShell } from '../components/AppShell'
import { useExpenseCategories } from '../hooks/useExpenseCategories'
import { useTheme } from '../theme/ThemeProvider'
import { getDisplayName } from '../utils/userDisplay'
import { useToast } from '../ui/ToastProvider'

type PageMode = 'live' | 'demo'

type SettingsPageProps = {
  mode?: PageMode
}

const SETTINGS_STORAGE_KEY = 'splititup.settings.profile.v2'

type LocalSettings = {
  phone: string
  timezone: string
  currency: string
  pendingEmail: string
  weeklySummary: boolean
  productUpdates: boolean
}

const defaultLocalSettings: LocalSettings = {
  phone: '',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  pendingEmail: '',
  weeklySummary: true,
  productUpdates: false,
}

export function SettingsPage({ mode: pageMode = 'live' }: SettingsPageProps) {
  const navigate = useNavigate()
  const { accessToken, user, logout } = useAuth()
  const { showToast } = useToast()
  const { mode: themeMode, setMode } = useTheme()
  const { categories, addCategory, removeCategory, resetCategories, isDefaultCategory } = useExpenseCategories()
  const isDemo = pageMode === 'demo'
  const { appState, isLoading, error } = useLiveAppState(pageMode)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState(defaultLocalSettings.phone)
  const [timezone, setTimezone] = useState(defaultLocalSettings.timezone)
  const [currency, setCurrency] = useState(defaultLocalSettings.currency)
  const [pendingEmail, setPendingEmail] = useState(defaultLocalSettings.pendingEmail)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [weeklySummary, setWeeklySummary] = useState(defaultLocalSettings.weeklySummary)
  const [productUpdates, setProductUpdates] = useState(defaultLocalSettings.productUpdates)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPreferences, setIsSavingPreferences] = useState(false)
  const [isSavingSecurity, setIsSavingSecurity] = useState(false)
  const [muteByGroup, setMuteByGroup] = useState<Record<string, boolean>>({})

  const nameError = useMemo(() => {
    if (!fullName.trim()) {
      return 'Full name is required.'
    }
    if (fullName.trim().length < 2 || fullName.trim().length > 120) {
      return 'Use 2-120 characters for full name.'
    }
    return ''
  }, [fullName])

  const pendingEmailError = useMemo(() => {
    if (!pendingEmail.trim()) {
      return ''
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pendingEmail.trim())) {
      return 'Enter a valid email address.'
    }
    if (email && pendingEmail.trim().toLowerCase() === email.toLowerCase()) {
      return 'This is already your current email.'
    }
    return ''
  }, [pendingEmail, email])

  const passwordError = useMemo(() => {
    if (!currentPassword && !newPassword && !confirmPassword) {
      return ''
    }
    if (!currentPassword.trim()) {
      return 'Current password is required.'
    }
    if (newPassword.length < 8) {
      return 'New password must be at least 8 characters.'
    }
    if (newPassword !== confirmPassword) {
      return 'New password and confirmation do not match.'
    }
    if (newPassword === currentPassword) {
      return 'New password must be different from current password.'
    }
    return ''
  }, [currentPassword, newPassword, confirmPassword])

  useEffect(() => {
    const resolvedName = appState?.profile.name ?? user?.name
    const resolvedEmail = appState?.profile.email ?? user?.email
    if (resolvedName) {
      setFullName(getDisplayName({ name: resolvedName, email: resolvedEmail }))
    }
    if (resolvedEmail) {
      setEmail(resolvedEmail)
      setPendingEmail((previous) => (previous ? previous : resolvedEmail))
    }
  }, [appState, user])

  useEffect(() => {
    const groups = appState?.dashboard?.groups
    if (!groups || groups.length === 0) return
    setMuteByGroup((prev) => {
      const next: Record<string, boolean> = {}
      for (const g of groups) {
        next[g.name] = prev[g.name] ?? false
      }
      return next
    })
  }, [appState])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
      if (!raw) {
        return
      }
      const saved = JSON.parse(raw) as LocalSettings
      setPhone(saved.phone ?? defaultLocalSettings.phone)
      setTimezone(saved.timezone ?? defaultLocalSettings.timezone)
      setCurrency(saved.currency ?? defaultLocalSettings.currency)
      setPendingEmail(saved.pendingEmail ?? defaultLocalSettings.pendingEmail)
      setWeeklySummary(saved.weeklySummary ?? defaultLocalSettings.weeklySummary)
      setProductUpdates(saved.productUpdates ?? defaultLocalSettings.productUpdates)
    } catch {
      // Keep defaults when local settings cannot be parsed.
    }
  }, [])

  function persistLocalSettings(next: LocalSettings) {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next))
  }

  async function onSaveProfile() {
    if (isDemo) {
      showToast('Profile updates are disabled in demo mode.', 'info')
      return
    }
    if (!accessToken) {
      showToast('Session expired. Please log in again.', 'error')
      return
    }
    if (nameError) {
      showToast(nameError, 'error')
      return
    }

    setIsSavingProfile(true)
    try {
      await updateMe(accessToken, { name: fullName.trim() })
      showToast('Profile updated successfully.', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update profile.', 'error')
    } finally {
      setIsSavingProfile(false)
    }
  }

  async function onSavePreferences() {
    if (pendingEmailError) {
      showToast(pendingEmailError, 'error')
      return
    }

    setIsSavingPreferences(true)
    try {
      const payload: LocalSettings = {
        phone,
        timezone,
        currency,
        pendingEmail,
        weeklySummary,
        productUpdates,
      }
      persistLocalSettings(payload)

      if (pendingEmail.trim() && email && pendingEmail.trim().toLowerCase() !== email.toLowerCase()) {
        showToast('Email change request saved locally. Backend email update endpoint is not available yet.', 'info')
      } else {
        showToast('Preferences saved.', 'success')
      }
    } finally {
      setIsSavingPreferences(false)
    }
  }

  async function onChangePassword() {
    if (passwordError) {
      showToast(passwordError, 'error')
      return
    }

    setIsSavingSecurity(true)
    try {
      showToast('Password flow validated. Backend password endpoint is not available yet.', 'info')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } finally {
      setIsSavingSecurity(false)
    }
  }

  function onAddExpenseCategory() {
    const result = addCategory(newCategoryName)
    if (!result.category) {
      showToast('Category name is required.', 'info')
      return
    }
    setNewCategoryName('')
    showToast(result.added ? 'Expense category added.' : 'Category already exists.', 'success')
  }

  function onRemoveExpenseCategory(category: string) {
    const removed = removeCategory(category)
    if (!removed) {
      showToast('Default categories cannot be removed.', 'info')
      return
    }
    showToast('Category removed.', 'success')
  }

  return (
    <AppShell mode={pageMode} title="Profile & Settings" subtitle="Theme, reminders, and account preferences">
      {!isDemo && isLoading ? (
        <article className="rounded-xl bg-white p-4 text-sm text-[#4b4451] shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:text-[#cac4cf] dark:ring-[#2d3234]">
          Loading profile settings...
        </article>
      ) : null}
      {!isDemo && error ? (
        <article className="rounded-xl bg-[#fff4f4] p-4 text-sm text-[#93000a] shadow-sm ring-1 ring-[#ffdad6] dark:bg-[#3b2222] dark:text-[#ffb4ab] dark:ring-[#5c3030]">
          Could not load profile settings: {error}
        </article>
      ) : null}
      <section className="space-y-4">
        <article className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
          <h3 className="font-semibold text-[#191c1d] dark:text-[#f0f1f2]">Theme</h3>
          <p className="mt-1 text-sm text-[#4b4451] dark:text-[#cac4cf]">System default with manual override.</p>
          <div className="mt-3 inline-flex rounded-lg bg-[#f3f4f5] p-1 dark:bg-[#1e1e1e]">
            {(['system', 'light', 'dark'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setMode(option)}
                className={[
                  'rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wider transition',
                  themeMode === option
                    ? 'bg-white text-[#4c1b87] shadow-sm dark:bg-[#232627] dark:text-[#d8baff]'
                    : 'text-[#4b4451] hover:bg-[#e7e8e9] dark:text-[#cac4cf] dark:hover:bg-[#232627]',
                ].join(' ')}
              >
                {option}
              </button>
            ))}
          </div>
        </article>
        <article className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
          <h3 className="font-semibold text-[#191c1d] dark:text-[#f0f1f2]">Profile</h3>
          <p className="mt-1 text-sm text-[#4b4451] dark:text-[#cac4cf]">Manage your identity details used across groups and reports.</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="text-sm font-semibold text-[#4b4451] dark:text-[#cac4cf] md:col-span-2">
              Full Name
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="mt-1 w-full rounded-lg bg-[#edeeef] p-3 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
              />
            </label>
            <label className="text-sm font-semibold text-[#4b4451] dark:text-[#cac4cf]">
              Current Email
              <input
                value={email}
                readOnly
                className="mt-1 w-full rounded-lg bg-[#f3f4f5] p-3 text-sm text-[#63707e] outline-none dark:bg-[#1e1e1e] dark:text-[#9ea5af]"
              />
            </label>
            <label className="text-sm font-semibold text-[#4b4451] dark:text-[#cac4cf]">
              New Email (optional)
              <input
                value={pendingEmail}
                onChange={(event) => setPendingEmail(event.target.value)}
                className="mt-1 w-full rounded-lg bg-[#edeeef] p-3 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
              />
            </label>
          </div>
          {nameError ? <p className="mt-2 text-xs font-semibold text-[#93000a]">{nameError}</p> : null}
          <button
            onClick={() => void onSaveProfile()}
            disabled={Boolean(nameError) || isSavingProfile}
            className="mt-3 rounded-lg bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </article>
        <article className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
          <h3 className="font-semibold text-[#191c1d] dark:text-[#f0f1f2]">Reminder Mute by Group</h3>
          <p className="mt-1 text-sm text-[#4b4451] dark:text-[#cac4cf]">Toggle reminders independently per group.</p>
          <div className="mt-3 space-y-2">
            {Object.entries(muteByGroup).map(([group, muted]) => (
              <label key={group} className="flex items-center justify-between rounded-lg bg-[#f3f4f5] px-3 py-2 text-sm dark:bg-[#1e1e1e]">
                <span>{group}</span>
                <input
                  type="checkbox"
                  checked={muted}
                  onChange={() => setMuteByGroup((prev) => ({ ...prev, [group]: !prev[group] }))}
                  className="h-4 w-4 accent-[#4c1b87]"
                />
              </label>
            ))}
          </div>
        </article>
        <article className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
          <h3 className="font-semibold text-[#191c1d] dark:text-[#f0f1f2]">Preferences</h3>
          <p className="mt-1 text-sm text-[#4b4451] dark:text-[#cac4cf]">Choose communication, locale, and billing defaults.</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="text-sm font-semibold text-[#4b4451] dark:text-[#cac4cf]">
              Phone
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+91 98765 43210"
                className="mt-1 w-full rounded-lg bg-[#edeeef] p-3 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
              />
            </label>
            <label className="text-sm font-semibold text-[#4b4451] dark:text-[#cac4cf]">
              Timezone
              <select
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
                className="mt-1 w-full rounded-lg bg-[#edeeef] p-3 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
              >
                <option value="Asia/Kolkata">Asia/Kolkata</option>
                <option value="Europe/London">Europe/London</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Asia/Singapore">Asia/Singapore</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-[#4b4451] dark:text-[#cac4cf]">
              Currency
              <select
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                className="mt-1 w-full rounded-lg bg-[#edeeef] p-3 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </label>
          </div>
          <label className="mt-3 flex items-center justify-between rounded-lg bg-[#f3f4f5] px-3 py-2 text-sm dark:bg-[#1e1e1e]">
            <span>Weekly summary emails</span>
            <input
              type="checkbox"
              checked={weeklySummary}
              onChange={() => setWeeklySummary((value) => !value)}
              className="h-4 w-4 accent-[#4c1b87]"
            />
          </label>
          <label className="mt-2 flex items-center justify-between rounded-lg bg-[#f3f4f5] px-3 py-2 text-sm dark:bg-[#1e1e1e]">
            <span>Product and feature updates</span>
            <input
              type="checkbox"
              checked={productUpdates}
              onChange={() => setProductUpdates((value) => !value)}
              className="h-4 w-4 accent-[#4c1b87]"
            />
          </label>
          {pendingEmailError ? <p className="mt-2 text-xs font-semibold text-[#93000a]">{pendingEmailError}</p> : null}
          <button
            onClick={() => void onSavePreferences()}
            disabled={Boolean(pendingEmailError) || isSavingPreferences}
            className="mt-3 rounded-lg bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingPreferences ? 'Saving...' : 'Save Preferences'}
          </button>
        </article>
        <article className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
          <h3 className="font-semibold text-[#191c1d] dark:text-[#f0f1f2]">Security</h3>
          <p className="mt-1 text-sm text-[#4b4451] dark:text-[#cac4cf]">Keep your account secure with periodic password changes.</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="text-sm font-semibold text-[#4b4451] dark:text-[#cac4cf] md:col-span-2">
              Current Password
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="mt-1 w-full rounded-lg bg-[#edeeef] p-3 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
              />
            </label>
            <label className="text-sm font-semibold text-[#4b4451] dark:text-[#cac4cf]">
              New Password
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="mt-1 w-full rounded-lg bg-[#edeeef] p-3 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
              />
            </label>
            <label className="text-sm font-semibold text-[#4b4451] dark:text-[#cac4cf]">
              Confirm Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-1 w-full rounded-lg bg-[#edeeef] p-3 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
              />
            </label>
          </div>
          {passwordError ? <p className="mt-2 text-xs font-semibold text-[#93000a]">{passwordError}</p> : null}
          <button
            onClick={() => void onChangePassword()}
            disabled={Boolean(passwordError) || isSavingSecurity}
            className="mt-3 rounded-lg bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingSecurity ? 'Saving...' : 'Change Password'}
          </button>
        </article>
        <article className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
          <h3 className="font-semibold text-[#191c1d] dark:text-[#f0f1f2]">Expense Categories</h3>
          <p className="mt-1 text-sm text-[#4b4451] dark:text-[#cac4cf]">Manage category options used in Add Expense and quick actions.</p>
          <div className="mt-3 flex gap-2">
            <input
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              placeholder="Add category"
              className="w-full rounded-lg bg-[#edeeef] p-3 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
            />
            <button
              onClick={onAddExpenseCategory}
              className="rounded-lg bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-4 py-2 text-sm font-semibold text-white"
            >
              Add
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((category) => (
              <div key={category} className="inline-flex items-center gap-2 rounded-full bg-[#f3f4f5] px-3 py-1.5 text-xs font-semibold text-[#4b4451] dark:bg-[#1e1e1e] dark:text-[#cac4cf]">
                <span>{category}</span>
                {!isDefaultCategory(category) ? (
                  <button
                    onClick={() => onRemoveExpenseCategory(category)}
                    className="rounded-full bg-[#fbe9ec] px-1.5 py-0.5 text-[10px] font-bold text-[#93000a] dark:bg-[#3c1f24] dark:text-[#ffb4ab]"
                    aria-label={`Remove ${category} category`}
                  >
                    X
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              resetCategories()
              showToast('Categories reset to defaults.', 'success')
            }}
            className="mt-3 rounded-lg bg-[#e7e8e9] px-4 py-2 text-xs font-bold text-[#4b4451] transition hover:bg-[#e1e3e4] dark:bg-[#2b2b2b] dark:text-[#cac4cf]"
          >
            Reset To Defaults
          </button>
        </article>
        <article className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
          <h3 className="font-semibold text-[#191c1d] dark:text-[#f0f1f2]">Session</h3>
          <p className="mt-1 text-sm text-[#4b4451] dark:text-[#cac4cf]">{isDemo ? 'Demo mode is not signed in.' : 'Sign out from this device.'}</p>
          <button
            onClick={() => {
              if (isDemo) {
                navigate('/login', { replace: true })
                return
              }
              logout()
              navigate('/login', { replace: true })
            }}
            className="mt-3 rounded-lg bg-[#fbe9ec] px-4 py-2 text-sm font-semibold text-[#93000a] transition hover:bg-[#f9dde2] dark:bg-[#3c1f24] dark:text-[#ffb4ab] dark:hover:bg-[#4a252b]"
          >
            {isDemo ? 'Go to Login' : 'Logout'}
          </button>
        </article>
      </section>
    </AppShell>
  )
}
