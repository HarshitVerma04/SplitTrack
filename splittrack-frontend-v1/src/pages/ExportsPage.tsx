import { useState } from 'react'
import { downloadExportCsv, downloadExportPdf } from '../api/appApi'
import { AppShell } from '../components/AppShell'
import { useLiveAppState } from '../api/useLiveAppState'
import { useAuth } from '../auth/AuthProvider'
import { useToast } from '../ui/ToastProvider'

type PageMode = 'live' | 'demo'

type ExportsPageProps = {
  mode?: PageMode
}

const demoExportsData = [
  { id: 'e1', type: 'CSV', scope: 'Goa Trip 2026', generatedAt: '30-03-2026 09:12 IST' },
  { id: 'e2', type: 'PDF', scope: 'Personal Summary', generatedAt: '29-03-2026 18:40 IST' },
]

export function ExportsPage({ mode = 'live' }: ExportsPageProps) {
  const isDemo = mode === 'demo'
  const { accessToken } = useAuth()
  const { showToast } = useToast()
  const { appState, isLoading, error } = useLiveAppState(mode)
  const exportsData = isDemo ? demoExportsData : appState?.exports.items ?? []
  const [isExportingCsv, setIsExportingCsv] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  function triggerDownload(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  async function onExportCsv() {
    if (isDemo) {
      showToast('Export is available after login.', 'info')
      return
    }
    if (!accessToken) {
      showToast('Session expired. Please log in again.', 'error')
      return
    }

    setIsExportingCsv(true)
    try {
      const blob = await downloadExportCsv(accessToken)
      triggerDownload(blob, 'splittrack-export.csv')
      showToast('CSV export downloaded.', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to export CSV.', 'error')
    } finally {
      setIsExportingCsv(false)
    }
  }

  async function onExportPdf() {
    if (isDemo) {
      showToast('Export is available after login.', 'info')
      return
    }
    if (!accessToken) {
      showToast('Session expired. Please log in again.', 'error')
      return
    }

    setIsExportingPdf(true)
    try {
      const blob = await downloadExportPdf(accessToken)
      triggerDownload(blob, 'splittrack-summary.pdf')
      showToast('PDF export downloaded.', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to export PDF.', 'error')
    } finally {
      setIsExportingPdf(false)
    }
  }

  return (
    <AppShell
      mode={mode}
      title="Export Center"
      subtitle={isDemo ? 'Generate plain structured CSV and PDF reports' : 'No exports yet. Generate a report when needed.'}
    >
      {!isDemo && isLoading ? (
        <div className="mb-4 rounded-xl bg-white p-4 text-sm text-[#4b4451] shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:text-[#cac4cf] dark:ring-[#2d3234]">
          Loading exports...
        </div>
      ) : null}
      {!isDemo && error ? (
        <div className="mb-4 rounded-xl bg-[#fff4f4] p-4 text-sm text-[#93000a] shadow-sm ring-1 ring-[#ffdad6] dark:bg-[#3b2222] dark:text-[#ffb4ab] dark:ring-[#5c3030]">
          Could not load exports: {error}
        </div>
      ) : null}
      <div className="mb-4 flex flex-wrap gap-3">
        <button
          onClick={() => void onExportCsv()}
          disabled={isExportingCsv}
          className="rounded-lg bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-4 py-2 text-sm font-bold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isExportingCsv ? 'Exporting...' : 'Export CSV'}
        </button>
        <button
          onClick={() => void onExportPdf()}
          disabled={isExportingPdf}
          className="rounded-lg bg-[#e7e8e9] px-4 py-2 text-sm font-bold text-[#4c1b87] transition hover:bg-[#e1e3e4] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#2b2b2b] dark:text-[#d8baff]"
        >
          {isExportingPdf ? 'Exporting...' : 'Export PDF'}
        </button>
      </div>
      <div className="space-y-3">
        {exportsData.map((item) => (
          <div key={item.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
            <p className="font-semibold text-[#191c1d] dark:text-[#f0f1f2]">{item.type} • {item.scope}</p>
            <p className="text-xs text-[#4b4451] dark:text-[#cac4cf]">Generated {item.generatedAt}</p>
          </div>
        ))}
        {exportsData.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-sm text-[#4b4451] shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:text-[#cac4cf] dark:ring-[#2d3234]">
            No exports yet. Generate a report after adding expenses.
          </div>
        ) : null}
      </div>
    </AppShell>
  )
}
