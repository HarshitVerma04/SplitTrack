import { AppShell } from '../components/AppShell'

export function SettingsPage() {
  return (
    <AppShell title="Profile & Settings" subtitle="Theme, reminders, and account preferences">
      <section className="space-y-4">
        <article className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
          <h3 className="font-semibold text-[#191c1d] dark:text-[#f0f1f2]">Theme</h3>
          <p className="mt-1 text-sm text-[#4b4451] dark:text-[#cac4cf]">System default with manual override.</p>
        </article>
        <article className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
          <h3 className="font-semibold text-[#191c1d] dark:text-[#f0f1f2]">Reminder Mute by Group</h3>
          <p className="mt-1 text-sm text-[#4b4451] dark:text-[#cac4cf]">Toggle reminders independently per group.</p>
        </article>
        <article className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
          <h3 className="font-semibold text-[#191c1d] dark:text-[#f0f1f2]">Username</h3>
          <p className="mt-1 text-sm text-[#4b4451] dark:text-[#cac4cf]">Editable with uniqueness checks.</p>
        </article>
      </section>
    </AppShell>
  )
}
