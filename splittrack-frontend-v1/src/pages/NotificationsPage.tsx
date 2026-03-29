import { AppShell } from '../components/AppShell'
import { mockNotifications } from '../data/mock'

export function NotificationsPage() {
  return (
    <AppShell title="Notifications" subtitle="Read, prioritize, and clear updates">
      <section className="space-y-3">
        {mockNotifications.map((item) => (
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
      </section>
    </AppShell>
  )
}
