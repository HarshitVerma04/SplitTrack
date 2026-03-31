import { AppShell } from '../components/AppShell'
import { useLiveAppState } from '../api/useLiveAppState'
import { mockNotifications } from '../data/mock'

type PageMode = 'live' | 'demo'

type NotificationsPageProps = {
  mode?: PageMode
}

export function NotificationsPage({ mode = 'live' }: NotificationsPageProps) {
  const isDemo = mode === 'demo'
  const { appState, isLoading, error } = useLiveAppState(mode)
  const notifications = isDemo ? mockNotifications : appState?.notifications.items ?? []

  return (
    <AppShell
      mode={mode}
      title="Notifications"
      subtitle={isDemo ? 'Read, prioritize, and clear updates' : 'No notifications yet. You are all caught up.'}
    >
      {!isDemo && isLoading ? (
        <article className="rounded-xl bg-white p-4 text-sm text-[#4b4451] shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:text-[#cac4cf] dark:ring-[#2d3234]">
          Loading notifications...
        </article>
      ) : null}
      {!isDemo && error ? (
        <article className="rounded-xl bg-[#fff4f4] p-4 text-sm text-[#93000a] shadow-sm ring-1 ring-[#ffdad6] dark:bg-[#3b2222] dark:text-[#ffb4ab] dark:ring-[#5c3030]">
          Could not load notifications: {error}
        </article>
      ) : null}
      <section className="space-y-3">
        {notifications.map((item) => (
          <article
            key={item.id}
            className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold text-[#191c1d] dark:text-[#f0f1f2]">{item.title}</p>
              <span
                className={[
                  'rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider',
                  item.priority === 'high'
                    ? 'bg-[#ffdad6] text-[#93000a]'
                    : 'bg-[#eddcff] text-[#4c1b87]',
                ].join(' ')}
              >
                {item.priority}
              </span>
            </div>
            <p className="mt-2 text-xs text-[#4b4451] dark:text-[#cac4cf]">{item.time}</p>
          </article>
        ))}
        {notifications.length === 0 ? (
          <article className="rounded-xl bg-white p-6 text-sm text-[#4b4451] shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:text-[#cac4cf] dark:ring-[#2d3234]">
            No notifications yet. New activity and reminders will appear here.
          </article>
        ) : null}
      </section>
    </AppShell>
  )
}
