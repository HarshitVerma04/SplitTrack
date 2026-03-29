import { useMemo, useState } from 'react'
import { AppShell } from '../components/AppShell'
import { useTheme } from '../theme/ThemeProvider'

export function SettingsPage() {
  const { mode, setMode } = useTheme()
  const [username, setUsername] = useState('harsh_24')
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

  return (
    <AppShell title="Profile & Settings" subtitle="Theme, reminders, and account preferences">
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
                  mode === option
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
        </article>
      </section>
    </AppShell>
  )
}
