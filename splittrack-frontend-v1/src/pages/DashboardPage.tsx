import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Bolt, CircleDollarSign, HandCoins, Plus, ReceiptIndianRupee, UsersRound } from 'lucide-react'
import { createExpense, createGroup, createSettlement, getGroups, getUsers, type GroupSummary, type UserDirectoryItem } from '../api/appApi'
import { useLiveAppState } from '../api/useLiveAppState'
import { useAuth } from '../auth/AuthProvider'
import { AppShell } from '../components/AppShell'
import { useToast } from '../ui/ToastProvider'

type DashboardMode = 'live' | 'demo'

type DashboardPageProps = {
  mode?: DashboardMode
}

type SummaryCard = {
  label: string
  value: string
  note: string
  icon: typeof CircleDollarSign
  valueTone?: string
}

type ActivityItem = {
  id: string
  title: string
  group: string
  amount: string
  time: string
  tone: string
}

type GroupItem = {
  id: string
  name: string
  members: number
  spend: string
  spendTone: string
  status: string
}

const demoSummaryCards: SummaryCard[] = [
  { label: 'Total Net Balance', value: '₹12,450.00', note: '+14% from last month', icon: CircleDollarSign, valueTone: 'text-[#4c1b87] dark:text-[#d8baff]' },
  { label: 'You are owed', value: '₹18,200.00', note: '8 pending receipts', icon: ArrowUpRight, valueTone: 'text-[#15803d] dark:text-[#4ade80]' },
  { label: 'You owe', value: '₹5,750.00', note: '3 pending payouts', icon: HandCoins, valueTone: 'text-[#b42318] dark:text-[#f87171]' },
]

const emptySummaryCards: SummaryCard[] = [
  { label: 'Total Net Balance', value: '₹0.00', note: 'No transactions yet', icon: CircleDollarSign, valueTone: 'text-[#4c1b87] dark:text-[#d8baff]' },
  { label: 'You are owed', value: '₹0.00', note: 'No receivables yet', icon: ArrowUpRight, valueTone: 'text-[#15803d] dark:text-[#4ade80]' },
  { label: 'You owe', value: '₹0.00', note: 'No payables yet', icon: HandCoins, valueTone: 'text-[#b42318] dark:text-[#f87171]' },
]

const demoRecentActivity: ActivityItem[] = [
  { id: 'a1', title: 'Dinner at Soho House', group: 'Weekend Trip', amount: '+ ₹4,200.00', time: '2 hours ago', tone: 'text-[#15803d] dark:text-[#4ade80]' },
  { id: 'a2', title: 'Electricity Bill', group: 'Flatmates', amount: '- ₹1,150.00', time: 'Yesterday', tone: 'text-[#b42318] dark:text-[#f87171]' },
  { id: 'a3', title: 'Airport Taxi', group: 'Goa Trip 2026', amount: '+ ₹2,400.00', time: '2 days ago', tone: 'text-[#15803d] dark:text-[#4ade80]' },
]

const demoGroups: GroupItem[] = [
  { id: 'g1', name: 'Goa Trip 2026', members: 8, spend: '+ ₹12,850.00', spendTone: 'text-[#15803d] dark:text-[#4ade80]', status: 'You are owed' },
  { id: 'g2', name: 'Flatmates Central', members: 4, spend: '- ₹2,400.00', spendTone: 'text-[#b42318] dark:text-[#f87171]', status: 'You owe' },
  { id: 'g3', name: 'Weekend Brunch', members: 6, spend: '+ ₹1,260.00', spendTone: 'text-[#15803d] dark:text-[#4ade80]', status: 'You are owed' },
]

export function DashboardPage({ mode = 'live' }: DashboardPageProps) {
  const isDemo = mode === 'demo'
  const { appState, isLoading, error, refetch } = useLiveAppState(mode)
  const { accessToken, user } = useAuth()
  const { showToast } = useToast()

  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showSettlementModal, setShowSettlementModal] = useState(false)
  const [groupOptions, setGroupOptions] = useState<GroupSummary[]>([])
  const [memberOptions, setMemberOptions] = useState<UserDirectoryItem[]>([])
  const [isPreparing, setIsPreparing] = useState(false)

  const [expenseGroupId, setExpenseGroupId] = useState('')
  const [expenseTitle, setExpenseTitle] = useState('')
  const [expenseCategory, setExpenseCategory] = useState('General')
  const [expenseTotal, setExpenseTotal] = useState(0)
  const [expenseMyShare, setExpenseMyShare] = useState(0)
  const [isCreatingExpense, setIsCreatingExpense] = useState(false)

  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDescription, setNewGroupDescription] = useState('')
  const [newGroupMemberIds, setNewGroupMemberIds] = useState<string[]>([])
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)

  const [settlementToUserId, setSettlementToUserId] = useState('')
  const [settlementAmount, setSettlementAmount] = useState(0)
  const [isCreatingSettlement, setIsCreatingSettlement] = useState(false)

  useEffect(() => {
    if (isDemo || !accessToken) return
    if (!showExpenseModal && !showGroupModal && !showSettlementModal) return

    let cancelled = false
    const loadOptions = async () => {
      setIsPreparing(true)
      try {
        const [groupsRes, usersRes] = await Promise.all([getGroups(accessToken), getUsers(accessToken)])
        if (cancelled) return
        setGroupOptions(groupsRes)
        setMemberOptions(usersRes)
        setExpenseGroupId((current) => current || groupsRes[0]?.id || '')
        setSettlementToUserId((current) => current || usersRes[0]?.id || '')
      } catch (err) {
        if (!cancelled) {
          showToast(err instanceof Error ? err.message : 'Failed to load form options.', 'error')
        }
      } finally {
        if (!cancelled) {
          setIsPreparing(false)
        }
      }
    }

    void loadOptions()
    return () => {
      cancelled = true
    }
  }, [isDemo, accessToken, showExpenseModal, showGroupModal, showSettlementModal, showToast])

  async function onConfirmCreateExpense() {
    if (!accessToken || !user?.id) {
      showToast('Session expired. Please log in again.', 'error')
      return
    }
    if (!expenseGroupId || !expenseTitle.trim() || expenseTotal <= 0 || expenseMyShare <= 0) {
      showToast('Please fill all expense details before finalizing.', 'error')
      return
    }
    if (Number(expenseMyShare.toFixed(2)) !== Number(expenseTotal.toFixed(2))) {
      showToast('For quick add, your share must equal total amount.', 'error')
      return
    }

    setIsCreatingExpense(true)
    try {
      await createExpense(accessToken, {
        groupId: expenseGroupId,
        title: expenseTitle.trim(),
        category: expenseCategory.trim() || 'General',
        totalAmount: expenseTotal,
        splits: [{ userId: user.id, amount: expenseMyShare }],
      })
      setShowExpenseModal(false)
      setExpenseTitle('')
      setExpenseCategory('General')
      setExpenseTotal(0)
      setExpenseMyShare(0)
      showToast('Expense created.', 'success')
      refetch()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create expense.', 'error')
    } finally {
      setIsCreatingExpense(false)
    }
  }

  async function onConfirmCreateGroup() {
    if (!accessToken) {
      showToast('Session expired. Please log in again.', 'error')
      return
    }
    if (!newGroupName.trim()) {
      showToast('Group name is required.', 'error')
      return
    }

    setIsCreatingGroup(true)
    try {
      await createGroup(accessToken, {
        name: newGroupName.trim(),
        description: newGroupDescription.trim() || undefined,
        memberIds: newGroupMemberIds,
      })
      setShowGroupModal(false)
      setNewGroupName('')
      setNewGroupDescription('')
      setNewGroupMemberIds([])
      showToast('Group created.', 'success')
      refetch()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create group.', 'error')
    } finally {
      setIsCreatingGroup(false)
    }
  }

  async function onConfirmSettlement() {
    if (!accessToken) {
      showToast('Session expired. Please log in again.', 'error')
      return
    }
    if (!settlementToUserId || settlementAmount <= 0) {
      showToast('Select a recipient and enter settlement amount.', 'error')
      return
    }

    setIsCreatingSettlement(true)
    try {
      await createSettlement(accessToken, {
        toUserId: settlementToUserId,
        amount: settlementAmount,
      })
      setShowSettlementModal(false)
      setSettlementAmount(0)
      showToast('Settlement request sent.', 'success')
      refetch()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to send settlement request.', 'error')
    } finally {
      setIsCreatingSettlement(false)
    }
  }

  const summaryCards = isDemo
    ? demoSummaryCards
    : [
        {
          label: 'Total Net Balance',
          value: appState?.dashboard.totalNetBalance ?? emptySummaryCards[0].value,
          note: appState?.dashboard.totalNetBalanceNote ?? emptySummaryCards[0].note,
          icon: CircleDollarSign,
          valueTone: 'text-[#4c1b87] dark:text-[#d8baff]',
        },
        {
          label: 'You are owed',
          value: appState?.dashboard.youAreOwed ?? emptySummaryCards[1].value,
          note: appState?.dashboard.youAreOwedNote ?? emptySummaryCards[1].note,
          icon: ArrowUpRight,
          valueTone: 'text-[#15803d] dark:text-[#4ade80]',
        },
        {
          label: 'You owe',
          value: appState?.dashboard.youOwe ?? emptySummaryCards[2].value,
          note: appState?.dashboard.youOweNote ?? emptySummaryCards[2].note,
          icon: HandCoins,
          valueTone: 'text-[#b42318] dark:text-[#f87171]',
        },
      ]
  const recentActivity = isDemo ? demoRecentActivity : appState?.dashboard.recentActivity ?? []
  const groups = isDemo ? demoGroups : appState?.dashboard.groups ?? []

  return (
    <AppShell
      mode={mode}
      title={isDemo ? 'Dashboard Demo' : 'Dashboard'}
      subtitle={isDemo ? 'Preview with sample values (not logged in)' : 'No data yet. Add your first expense to get started.'}
    >
      {!isDemo && isLoading ? (
        <section className="mb-6 rounded-xl bg-white p-4 text-sm text-[#4b4451] shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#242b35] dark:text-[#cac4cf] dark:ring-[#384150]">
          Loading dashboard data...
        </section>
      ) : null}
      {!isDemo && error ? (
        <section className="mb-6 rounded-xl bg-[#fff4f4] p-4 text-sm text-[#93000a] shadow-sm ring-1 ring-[#ffdad6] dark:bg-[#3b2222] dark:text-[#ffb4ab] dark:ring-[#5c3030]">
          Could not load dashboard data: {error}
        </section>
      ) : null}
      <section className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card, index) => {
          const Icon = card.icon

          return (
            <motion.article
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
              className="card-interactive rounded-xl bg-white p-5 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#242b35] dark:ring-[#384150]"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-[#4b4451] dark:text-[#cac4cf]">{card.label}</p>
                <div className="rounded-lg bg-[#eddcff] p-2 text-[#4c1b87] dark:bg-[#2f3743] dark:text-[#d8baff]">
                  <Icon size={16} />
                </div>
              </div>
              <p className={["font-[Manrope] text-3xl font-extrabold tracking-tight", card.valueTone ?? 'text-[#191c1d] dark:text-[#f0f1f2]'].join(' ')}>{card.value}</p>
              <p className="mt-2 text-xs font-semibold text-[#4b4451] dark:text-[#cac4cf]">{card.note}</p>
            </motion.article>
          )
        })}
      </section>

      <section className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => {
            if (isDemo) {
              showToast('This action is available after login.', 'info')
              return
            }
            setShowExpenseModal(true)
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:scale-[1.02]"
        >
          <Plus size={16} /> Add Expense
        </button>
        <button
          onClick={() => {
            if (isDemo) {
              showToast('This action is available after login.', 'info')
              return
            }
            setShowSettlementModal(true)
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#e7e8e9] px-5 py-3 text-sm font-bold text-[#4c1b87] transition hover:-translate-y-0.5 hover:bg-[#e1e3e4] dark:bg-[#2a3039] dark:text-[#d8baff]"
        >
          <Bolt size={16} /> Settle Up
        </button>
        <button
          onClick={() => {
            if (isDemo) {
              showToast('This action is available after login.', 'info')
              return
            }
            setShowGroupModal(true)
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#e7e8e9] px-5 py-3 text-sm font-bold text-[#4c1b87] transition hover:-translate-y-0.5 hover:bg-[#e1e3e4] dark:bg-[#2a3039] dark:text-[#d8baff]"
        >
          <UsersRound size={16} /> Create Group
        </button>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-[Manrope] text-2xl font-bold tracking-tight text-[#191c1d] dark:text-[#f0f1f2]">Recent Activity</h3>
            <button className="text-sm font-semibold text-[#4c1b87] dark:text-[#d8baff]">View All</button>
          </div>
          {recentActivity.length === 0 ? (
            <div className="rounded-xl bg-white p-6 text-sm text-[#4b4451] shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#242b35] dark:text-[#cac4cf] dark:ring-[#384150]">
              No activity yet. Add your first expense to start tracking balances.
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item, index) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  className="card-interactive rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#242b35] dark:ring-[#384150]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#191c1d] dark:text-[#f0f1f2]">{item.title}</p>
                      <p className="text-xs text-[#4b4451] dark:text-[#cac4cf]">{item.group} • {item.time}</p>
                    </div>
                    <p className={["font-[Manrope] text-lg font-extrabold tracking-tight", item.tone].join(' ')}>{item.amount}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-[Manrope] text-2xl font-bold tracking-tight text-[#191c1d] dark:text-[#f0f1f2]">Active Groups</h3>
            <span className="rounded bg-[#e7e8e9] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#4b4451] dark:bg-[#2a3039] dark:text-[#cac4cf]">
              {groups.length} total
            </span>
          </div>
          {groups.length === 0 ? (
            <div className="rounded-xl bg-white p-6 text-sm text-[#4b4451] shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#242b35] dark:text-[#cac4cf] dark:ring-[#384150]">
              No groups yet. Create one to start splitting expenses.
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map((group, index) => (
                <motion.article
                  key={group.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  className="card-interactive rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#242b35] dark:ring-[#384150]"
                >
                  <p className="font-semibold text-[#191c1d] dark:text-[#f0f1f2]">{group.name}</p>
                  <div className="mt-1 flex items-center justify-between text-xs text-[#4b4451] dark:text-[#cac4cf]">
                    <span>{group.members} members</span>
                    <span className={["inline-flex items-center gap-1 font-bold", group.spendTone].join(' ')}>
                      <ReceiptIndianRupee size={12} />{group.spend}
                    </span>
                  </div>
                  <p className={["mt-1 text-xs font-semibold", group.spendTone].join(' ')}>{group.status}</p>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {showExpenseModal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl dark:bg-[#232627]">
            <h4 className="text-lg font-bold text-[#191c1d] dark:text-[#f0f1f2]">Add Expense</h4>
            <p className="mt-1 text-sm text-[#4b4451] dark:text-[#cac4cf]">Enter details, then finalize or cancel.</p>
            {isPreparing ? (
              <p className="mt-3 text-sm text-[#4b4451] dark:text-[#cac4cf]">Loading options...</p>
            ) : (
              <div className="mt-3 space-y-3">
                <select
                  value={expenseGroupId}
                  onChange={(event) => setExpenseGroupId(event.target.value)}
                  className="w-full rounded-lg bg-[#edeeef] p-2 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
                >
                  <option value="">Select group</option>
                  {groupOptions.map((group) => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
                <input
                  value={expenseTitle}
                  onChange={(event) => setExpenseTitle(event.target.value)}
                  placeholder="Expense title"
                  className="w-full rounded-lg bg-[#edeeef] p-2 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
                />
                <input
                  value={expenseCategory}
                  onChange={(event) => setExpenseCategory(event.target.value)}
                  placeholder="Category"
                  className="w-full rounded-lg bg-[#edeeef] p-2 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={expenseTotal}
                    onChange={(event) => setExpenseTotal(Number(event.target.value) || 0)}
                    placeholder="Total amount"
                    className="w-full rounded-lg bg-[#edeeef] p-2 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
                  />
                  <input
                    type="number"
                    value={expenseMyShare}
                    onChange={(event) => setExpenseMyShare(Number(event.target.value) || 0)}
                    placeholder="Your share"
                    className="w-full rounded-lg bg-[#edeeef] p-2 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
                  />
                </div>
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowExpenseModal(false)}
                className="rounded-lg bg-[#e7e8e9] px-4 py-2 text-sm font-bold text-[#4b4451] dark:bg-[#2a3039] dark:text-[#cac4cf]"
              >
                Cancel
              </button>
              <button
                onClick={() => void onConfirmCreateExpense()}
                disabled={isCreatingExpense || isPreparing}
                className="rounded-lg bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreatingExpense ? 'Saving...' : 'Finalize'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showGroupModal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl dark:bg-[#232627]">
            <h4 className="text-lg font-bold text-[#191c1d] dark:text-[#f0f1f2]">Create Group</h4>
            <p className="mt-1 text-sm text-[#4b4451] dark:text-[#cac4cf]">Add details, then confirm or cancel.</p>
            {isPreparing ? (
              <p className="mt-3 text-sm text-[#4b4451] dark:text-[#cac4cf]">Loading options...</p>
            ) : (
              <div className="mt-3 space-y-3">
                <input
                  value={newGroupName}
                  onChange={(event) => setNewGroupName(event.target.value)}
                  placeholder="Group name"
                  className="w-full rounded-lg bg-[#edeeef] p-2 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
                />
                <input
                  value={newGroupDescription}
                  onChange={(event) => setNewGroupDescription(event.target.value)}
                  placeholder="Description (optional)"
                  className="w-full rounded-lg bg-[#edeeef] p-2 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
                />
                <div className="max-h-40 space-y-2 overflow-auto rounded-lg bg-[#f3f4f5] p-2 dark:bg-[#1e1e1e]">
                  {memberOptions.map((member) => (
                    <label key={member.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={newGroupMemberIds.includes(member.id)}
                        onChange={(event) => {
                          setNewGroupMemberIds((prev) =>
                            event.target.checked ? [...prev, member.id] : prev.filter((id) => id !== member.id),
                          )
                        }}
                        className="accent-[#4c1b87]"
                      />
                      <span>{member.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowGroupModal(false)}
                className="rounded-lg bg-[#e7e8e9] px-4 py-2 text-sm font-bold text-[#4b4451] dark:bg-[#2a3039] dark:text-[#cac4cf]"
              >
                Cancel
              </button>
              <button
                onClick={() => void onConfirmCreateGroup()}
                disabled={isCreatingGroup || isPreparing}
                className="rounded-lg bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreatingGroup ? 'Saving...' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showSettlementModal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl dark:bg-[#232627]">
            <h4 className="text-lg font-bold text-[#191c1d] dark:text-[#f0f1f2]">Settle Up</h4>
            <p className="mt-1 text-sm text-[#4b4451] dark:text-[#cac4cf]">Create a settlement request or cancel.</p>
            {isPreparing ? (
              <p className="mt-3 text-sm text-[#4b4451] dark:text-[#cac4cf]">Loading options...</p>
            ) : (
              <div className="mt-3 space-y-3">
                <select
                  value={settlementToUserId}
                  onChange={(event) => setSettlementToUserId(event.target.value)}
                  className="w-full rounded-lg bg-[#edeeef] p-2 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
                >
                  <option value="">Select recipient</option>
                  {memberOptions.map((member) => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={settlementAmount}
                  onChange={(event) => setSettlementAmount(Number(event.target.value) || 0)}
                  placeholder="Amount"
                  className="w-full rounded-lg bg-[#edeeef] p-2 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
                />
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowSettlementModal(false)}
                className="rounded-lg bg-[#e7e8e9] px-4 py-2 text-sm font-bold text-[#4b4451] dark:bg-[#2a3039] dark:text-[#cac4cf]"
              >
                Cancel
              </button>
              <button
                onClick={() => void onConfirmSettlement()}
                disabled={isCreatingSettlement || isPreparing}
                className="rounded-lg bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreatingSettlement ? 'Sending...' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  )
}
