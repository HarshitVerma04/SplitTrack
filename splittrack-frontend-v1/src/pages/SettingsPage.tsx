import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveAppState } from '../api/useLiveAppState'
import { useAuth } from '../auth/AuthProvider'
import { updateMe } from '../auth/authApi'
import { AppShell } from '../components/AppShell'
import { useTheme } from '../theme/ThemeProvider'
import { useToast } from '../ui/ToastProvider'

type PageMode = 'live' | 'demo'

type SettingsPageProps = {
  mode?: PageMode
}

export function SettingsPage({ mode: pageMode = 'live' }: SettingsPageProps) {
  const navigate = useNavigate()
  const { accessToken, logout } = useAuth()
  const { showToast } = useToast()
  const { mode: themeMode, setMode } = useTheme()
  const isDemo = pageMode === 'demo'
  const { appState, isLoading, error } = useLiveAppState(pageMode)
  const [username, setUsername] = useState('harsh_24')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [muteByGroup, setMuteByGroup] = useState<Record<string, boolean>>({
    'Goa Trip 2026': false,
    'Flatmates Central': true,
    'Weekend Brunch': false,
  })

  const usernameError = useMemo(() => {
    if (!/^[a-z0-9_]{3,20}$/i.test(username)) {
      return 'Use 3-20 characters: letters, numbers, underscore.'
    }
    return ''
  }, [username])

  useEffect(() => {
    if (!isDemo && appState?.profile.name) {
      setUsername(appState.profile.name)
    }
  }, [isDemo, appState])

  async function onSaveProfile() {
    if (isDemo) {
      showToast('Profile updates are disabled in demo mode.', 'info')
      return
    }
    if (!accessToken) {
      showToast('Session expired. Please log in again.', 'error')
      return
    }
    if (usernameError) {
      showToast(usernameError, 'error')
      return
    }

    setIsSavingProfile(true)
    try {
      await updateMe(accessToken, { name: username.trim() })
      showToast('Profile updated successfully.', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update profile.', 'error')
    } finally {
      setIsSavingProfile(false)
    }
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
          <h3 className="font-semibold text-[#191c1d] dark:text-[#f0f1f2]">Username</h3>
          <p className="mt-1 text-sm text-[#4b4451] dark:text-[#cac4cf]">Editable with uniqueness checks.</p>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mt-3 w-full rounded-lg bg-[#edeeef] p-3 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
          />
          {usernameError ? <p className="mt-2 text-xs font-semibold text-[#93000a]">{usernameError}</p> : null}
          <button
            onClick={() => void onSaveProfile()}
            disabled={Boolean(usernameError) || isSavingProfile}
            className="mt-3 rounded-lg bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingProfile ? 'Saving...' : 'Save Username'}
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
