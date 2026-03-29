import { useMemo, useState } from 'react'
import { AlertTriangle, CalendarDays, IndianRupee, UsersRound } from 'lucide-react'
import { AppShell } from '../components/AppShell'

type SplitMode = 'equal' | 'custom' | 'percentage' | 'itemized'

type Participant = {
  id: string
  name: string
  amount: number
  percentage: number
}

const initialParticipants: Participant[] = [
  { id: 'p1', name: 'Me', amount: 612.5, percentage: 25 },
  { id: 'p2', name: 'Sarah Miller', amount: 612.5, percentage: 25 },
  { id: 'p3', name: 'Alex Johnson', amount: 612.5, percentage: 25 },
]

function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function currency(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function AddExpensePage() {
  const [mode, setMode] = useState<SplitMode>('equal')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState(2450)
  const [taxTip, setTaxTip] = useState(350)
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants)

  const resolvedParticipants = useMemo(() => {
    if (!participants.length) return participants

    if (mode === 'equal') {
      const totalPaise = Math.max(0, Math.round(amount * 100))
      const base = Math.floor(totalPaise / participants.length)
      const remainder = totalPaise - base * participants.length

      return participants.map((participant, index) => {
        const paise = base + (index < remainder ? 1 : 0)
        const shareAmount = paise / 100
        const sharePercentage = amount > 0 ? round2((shareAmount / amount) * 100) : 0
        return { ...participant, amount: shareAmount, percentage: sharePercentage }
      })
    }

    if (mode === 'percentage') {
      const next = participants.map((participant) => ({
        ...participant,
        amount: round2((amount * participant.percentage) / 100),
      }))
      const diff = round2(amount - next.reduce((sum, p) => sum + p.amount, 0))
      if (next.length > 0 && diff !== 0) {
        next[0] = { ...next[0], amount: round2(next[0].amount + diff) }
      }
      return next
    }

    return participants.map((participant) => ({
      ...participant,
      percentage: amount > 0 ? round2((participant.amount / amount) * 100) : 0,
    }))
  }, [participants, mode, amount])

  const allocated = useMemo(
    () => round2(resolvedParticipants.reduce((sum, p) => sum + p.amount, 0)),
    [resolvedParticipants],
  )
  const remaining = useMemo(() => round2(amount - allocated), [amount, allocated])
  const percentageTotal = useMemo(
    () => round2(resolvedParticipants.reduce((sum, p) => sum + p.percentage, 0)),
    [resolvedParticipants],
  )

  const subtotal = Math.max(0, amount - taxTip)

  function updateParticipant(id: string, key: 'amount' | 'percentage', value: number) {
    setParticipants((prev) => {
      const updated = prev.map((participant) =>
        participant.id === id
          ? { ...participant, [key]: round2(Math.max(0, value)) }
          : participant,
      )

      if (mode === 'percentage') {
        return updated
      }

      if (mode === 'custom' || mode === 'itemized') {
        return updated
      }

      return updated
    })
  }

  function addParticipant() {
    const id = `p${participants.length + 1}`
    const name = `Member ${participants.length + 1}`

    setParticipants((prev) => [...prev, { id, name, amount: 0, percentage: 0 }])
  }

  const percentageInvalid = mode === 'percentage' && percentageTotal !== 100
  const amountInvalid = (mode === 'custom' || mode === 'itemized') && remaining !== 0

  return (
    <AppShell title="Add Expense" subtitle="Record a new transaction for your group">
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="space-y-4 lg:col-span-5">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#4b4451] dark:text-[#cac4cf]">Description</label>
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What was this for?"
              className="w-full rounded-lg bg-[#edeeef] p-3 font-semibold outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#4b4451] dark:text-[#cac4cf]">Amount (INR)</label>
              <div className="relative">
                <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4c1b87]" />
                <input
                  type="number"
                  value={amount}
                  onChange={(event) => setAmount(Number(event.target.value) || 0)}
                  className="w-full rounded-lg bg-[#edeeef] py-3 pl-8 pr-3 font-bold outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#4b4451] dark:text-[#cac4cf]">Date</label>
              <div className="flex items-center gap-2 rounded-lg bg-[#edeeef] p-3 text-sm font-medium dark:bg-[#1e1e1e]">
                <CalendarDays size={14} />
                <span>24-05-2024</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#eddcff] text-[#4c1b87] dark:bg-[#2b2b2b] dark:text-[#d8baff]">
                <UsersRound size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#4b4451] dark:text-[#cac4cf]">Paid by</p>
                <p className="font-semibold">Me (You)</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[#6437a0] text-white">
                <UsersRound size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#4b4451] dark:text-[#cac4cf]">Group</p>
                <p className="font-semibold">Weekend Trip: Goa</p>
              </div>
            </div>
          </div>
        </section>

        <section className="lg:col-span-7">
          <div className="mb-4 flex rounded-xl bg-[#f3f4f5] p-1 dark:bg-[#1e1e1e]">
            {(['equal', 'custom', 'percentage', 'itemized'] as SplitMode[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setMode(tab)}
                className={[
                  'flex-1 rounded-lg px-3 py-2 text-sm font-semibold capitalize transition',
                  mode === tab
                    ? 'bg-white text-[#4c1b87] shadow-sm dark:bg-[#232627] dark:text-[#d8baff]'
                    : 'text-[#4b4451] hover:bg-[#e7e8e9] dark:text-[#cac4cf] dark:hover:bg-[#232627]',
                ].join(' ')}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="max-h-[430px] space-y-3 overflow-auto pr-1">
            {resolvedParticipants.map((participant) => (
              <article key={participant.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#191c1d] dark:text-[#f0f1f2]">{participant.name}</p>
                    <p className="text-xs text-[#4b4451] dark:text-[#cac4cf]">Contributor</p>
                  </div>
                  <p className="font-[Manrope] text-2xl font-extrabold text-[#4c1b87] dark:text-[#d8baff]">{currency(participant.amount)}</p>
                </div>

                {mode === 'custom' || mode === 'itemized' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-xs font-semibold text-[#4b4451] dark:text-[#cac4cf]">
                      Amount
                      <input
                        type="number"
                        value={participant.amount}
                        onChange={(event) => updateParticipant(participant.id, 'amount', Number(event.target.value) || 0)}
                        className="mt-1 w-full rounded-lg bg-[#edeeef] p-2 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
                      />
                    </label>
                    <label className="text-xs font-semibold text-[#4b4451] dark:text-[#cac4cf]">
                      Percentage
                      <input
                        type="number"
                        value={participant.percentage}
                        disabled={mode === 'custom' || mode === 'itemized'}
                        onChange={(event) => updateParticipant(participant.id, 'percentage', Number(event.target.value) || 0)}
                        className="mt-1 w-full rounded-lg bg-[#edeeef] p-2 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 disabled:opacity-60 dark:bg-[#1e1e1e]"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {mode === 'percentage' ? (
                      <label className="text-xs font-semibold text-[#4b4451] dark:text-[#cac4cf]">
                        Percentage
                        <input
                          type="number"
                          value={participant.percentage}
                          onChange={(event) => updateParticipant(participant.id, 'percentage', Number(event.target.value) || 0)}
                          className="mt-1 w-full rounded-lg bg-[#edeeef] p-2 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
                        />
                      </label>
                    ) : null}
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#4b4451] dark:text-[#cac4cf]">
                      {participant.percentage}% Share
                    </p>
                  </div>
                )}
              </article>
            ))}

            <button
              onClick={addParticipant}
              className="w-full rounded-xl border border-dashed border-[#7c7483]/40 bg-[#f3f4f5] p-3 text-sm font-semibold text-[#4c1b87] transition hover:bg-[#e7e8e9] dark:border-[#4b4451] dark:bg-[#1e1e1e] dark:text-[#d8baff] dark:hover:bg-[#232627]"
            >
              Add participant...
            </button>
          </div>

          <div className="mt-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-semibold text-[#4b4451] dark:text-[#cac4cf]">Calculated Total</span>
              <span className="font-[Manrope] font-bold text-[#191c1d] dark:text-[#f0f1f2]">{currency(allocated)}</span>
            </div>
            {percentageInvalid ? (
              <div className="mt-2 inline-flex items-start gap-2 rounded-lg bg-[#ffdad6]/70 p-3 text-sm text-[#93000a]">
                <AlertTriangle size={16} className="mt-[1px]" />
                <span>Percentage total must be exactly 100.00. Current: {percentageTotal.toFixed(2)}.</span>
              </div>
            ) : null}
            {amountInvalid ? (
              <div className="mt-2 inline-flex items-start gap-2 rounded-lg bg-[#ffdad6]/70 p-3 text-sm text-[#93000a]">
                <AlertTriangle size={16} className="mt-[1px]" />
                <span>
                  {remaining > 0
                    ? `Remaining balance: ${currency(remaining)}. Please allocate the full amount.`
                    : `Over-allocated by ${currency(Math.abs(remaining))}. Reduce allocations.`}
                </span>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <footer className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#f3f4f5] p-4 dark:bg-[#1e1e1e]">
        <div className="flex flex-wrap gap-6 text-sm">
          <p><span className="font-semibold text-[#4b4451] dark:text-[#cac4cf]">Subtotal:</span> <span className="font-[Manrope] font-bold">{currency(subtotal)}</span></p>
          <p>
            <span className="font-semibold text-[#4b4451] dark:text-[#cac4cf]">Tax & Tip:</span>{' '}
            <input
              type="number"
              value={taxTip}
              onChange={(event) => setTaxTip(Number(event.target.value) || 0)}
              className="ml-2 w-24 rounded bg-white px-2 py-1 text-sm font-semibold outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#232627]"
            />
          </p>
          <p><span className="font-semibold text-[#4b4451] dark:text-[#cac4cf]">Total:</span> <span className="font-[Manrope] text-lg font-extrabold text-[#4c1b87] dark:text-[#d8baff]">{currency(amount)}</span></p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl px-5 py-3 text-sm font-semibold text-[#4b4451] hover:bg-[#e7e8e9] dark:text-[#cac4cf] dark:hover:bg-[#232627]">Cancel</button>
          <button
            disabled={!description.trim() || amount <= 0 || percentageInvalid || amountInvalid}
            className="rounded-xl bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Add Expense
          </button>
        </div>
      </footer>
    </AppShell>
  )
}
