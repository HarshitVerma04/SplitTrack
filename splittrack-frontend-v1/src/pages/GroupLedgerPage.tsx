import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, ChevronRight, Filter, Plus, Tags, UsersRound } from 'lucide-react'
import { addGroupMembers, createGroup, deleteGroup, getGroups, getUsers, removeGroupMember, type GroupSummary, type UserDirectoryItem } from '../api/appApi'
import { useLiveAppState } from '../api/useLiveAppState'
import { useAuth } from '../auth/AuthProvider'
import { AppShell } from '../components/AppShell'
import { useToast } from '../ui/ToastProvider'

type PageMode = 'live' | 'demo'

type GroupLedgerPageProps = {
  mode?: PageMode
}

const demoMembers = [
  { id: 'm1', name: 'Ananya Sharma', status: 'Owes you', amount: '+₹12,400', tone: 'text-[#15803d] dark:text-[#4ade80]' },
  { id: 'm2', name: 'Rohan Verma', status: 'You owe', amount: '-₹4,200', tone: 'text-[#b42318] dark:text-[#f87171]' },
  { id: 'm3', name: 'Vikram Singh', status: 'All clear', amount: 'Settled', tone: 'text-[#4b4451]' },
]

const demoLedgerDays = [
  {
    date: '14-03-2026',
    rows: [
      { id: 'r1', title: 'Seafood Dinner at Brittos', category: 'Food', payer: 'Ananya Sharma', split: 'Split equally', yourShare: '₹2,450', total: '₹9,800' },
      { id: 'r2', title: 'Airport Taxi', category: 'Transport', payer: 'You', split: 'Split equally', yourShare: '₹600', total: '₹2,400' },
    ],
  },
  {
    date: '13-03-2026',
    rows: [
      { id: 'r3', title: 'Villa Booking Deposit', category: 'Stay', payer: 'Rohan Verma', split: 'Split unevenly', yourShare: '₹7,500', total: '₹30,000' },
    ],
  },
]

export function GroupLedgerPage({ mode = 'live' }: GroupLedgerPageProps) {
  const isDemo = mode === 'demo'
  const { showToast } = useToast()
  const { accessToken } = useAuth()
  const { appState, isLoading, error, refetch } = useLiveAppState(mode)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [memberIds, setMemberIds] = useState<string[]>([])
  const [users, setUsers] = useState<UserDirectoryItem[]>([])
  const [groups, setGroups] = useState<GroupSummary[]>([])
  const [deleteGroupId, setDeleteGroupId] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [targetGroupId, setTargetGroupId] = useState('')
  const [newMemberIds, setNewMemberIds] = useState<string[]>([])
  const [isAddingMembers, setIsAddingMembers] = useState(false)
  const [memberToRemoveId, setMemberToRemoveId] = useState('')
  const [isRemovingMember, setIsRemovingMember] = useState(false)

  useEffect(() => {
    if (isDemo || !accessToken) return
    let cancelled = false
    const loadUsers = async () => {
      try {
        const [userRows, groupRows] = await Promise.all([getUsers(accessToken), getGroups(accessToken)])
        if (!cancelled) {
          setUsers(userRows)
          setGroups(groupRows)
          setDeleteGroupId((current) => current || groupRows[0]?.id || '')
        }
      } catch {
        if (!cancelled) {
          setUsers([])
          setGroups([])
          showToast('Failed to load users/groups for group management.', 'error')
        }
      }
    }
    void loadUsers()
    return () => {
      cancelled = true
    }
  }, [isDemo, accessToken, showToast])

  async function onCreateGroup() {
    if (!accessToken) {
      showToast('Session expired. Please log in again.', 'error')
      return
    }
    if (!name.trim()) {
      showToast('Group name is required.', 'error')
      return
    }
    setIsCreating(true)
    try {
      await createGroup(accessToken, {
        name: name.trim(),
        description: description.trim() || undefined,
        memberIds,
      })
      setName('')
      setDescription('')
      setMemberIds([])
      const updatedGroups = await getGroups(accessToken)
      setGroups(updatedGroups)
      setDeleteGroupId(updatedGroups[0]?.id ?? '')
      showToast('Group created successfully.', 'success')
      refetch()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to create group.', 'error')
    } finally {
      setIsCreating(false)
    }
  }

  async function onDeleteGroup() {
    if (!accessToken || !deleteGroupId) return
    setIsDeleting(true)
    try {
      await deleteGroup(accessToken, deleteGroupId)
      const updatedGroups = await getGroups(accessToken)
      setGroups(updatedGroups)
      setDeleteGroupId(updatedGroups[0]?.id ?? '')
      showToast('Group deleted successfully.', 'success')
      refetch()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to delete group.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  async function onAddMembers() {
    if (!accessToken || !targetGroupId) {
      showToast('Select a group before adding members.', 'error')
      return
    }
    if (newMemberIds.length === 0) {
      showToast('Select at least one member.', 'error')
      return
    }

    setIsAddingMembers(true)
    try {
      await addGroupMembers(accessToken, targetGroupId, newMemberIds)
      setShowAddMemberModal(false)
      setNewMemberIds([])
      showToast('Members added successfully.', 'success')
      refetch()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to add members.', 'error')
    } finally {
      setIsAddingMembers(false)
    }
  }

  async function onRemoveMember() {
    if (!accessToken || !targetGroupId || !memberToRemoveId) {
      showToast('Select group and member to remove.', 'error')
      return
    }

    setIsRemovingMember(true)
    try {
      await removeGroupMember(accessToken, targetGroupId, memberToRemoveId)
      setMemberToRemoveId('')
      showToast('Member removed successfully.', 'success')
      refetch()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to remove member.', 'error')
    } finally {
      setIsRemovingMember(false)
    }
  }
  const members = isDemo ? demoMembers : appState?.groupLedger.members ?? []
  const ledgerDays = isDemo ? demoLedgerDays : appState?.groupLedger.ledgerDays ?? []
  const liveTitle = appState?.groupLedger.title ?? 'No Active Group Yet'
  const liveDateRange = appState?.groupLedger.dateRange ?? 'No dates yet'
  const liveTotal = appState?.groupLedger.totalGroupSpending ?? '₹0.00'

  return (
    <AppShell
      mode={mode}
      title={isDemo ? 'Goa Trip 2026' : 'Groups'}
      subtitle={isDemo ? 'Trip ledger and member-level balances' : 'No groups yet. Create your first group to get started.'}
    >
      {!isDemo && isLoading ? (
        <section className="mb-6 rounded-xl bg-white p-4 text-sm text-[#4b4451] shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:text-[#cac4cf] dark:ring-[#2d3234]">
          Loading group ledger...
        </section>
      ) : null}
      {!isDemo && error ? (
        <section className="mb-6 rounded-xl bg-[#fff4f4] p-4 text-sm text-[#93000a] shadow-sm ring-1 ring-[#ffdad6] dark:bg-[#3b2222] dark:text-[#ffb4ab] dark:ring-[#5c3030]">
          Could not load group data: {error}
        </section>
      ) : null}
      {!isDemo ? (
        <section className="mb-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
          <h4 className="font-semibold text-[#191c1d] dark:text-[#f0f1f2]">Create Group</h4>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Group name"
              className="rounded-lg bg-[#edeeef] px-3 py-2 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
            />
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description (optional)"
              className="rounded-lg bg-[#edeeef] px-3 py-2 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
            />
          </div>
          {users.length > 0 ? (
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {users.map((user) => (
                <label key={user.id} className="flex items-center gap-2 rounded-lg bg-[#f3f4f5] px-3 py-2 text-sm dark:bg-[#1e1e1e]">
                  <input
                    type="checkbox"
                    checked={memberIds.includes(user.id)}
                    onChange={(event) => {
                      setMemberIds((prev) =>
                        event.target.checked ? [...prev, user.id] : prev.filter((id) => id !== user.id),
                      )
                    }}
                    className="accent-[#4c1b87]"
                  />
                  <span>{user.name}</span>
                </label>
              ))}
            </div>
          ) : null}
          <button
            onClick={() => void onCreateGroup()}
            disabled={!name.trim() || isCreating}
            className="mt-3 rounded-lg bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreating ? 'Creating...' : 'Create Group'}
          </button>

          <div className="mt-4 border-t border-[#cdc3d3]/40 pt-4 dark:border-[#2d3234]">
            <h5 className="text-sm font-semibold text-[#191c1d] dark:text-[#f0f1f2]">Delete Group</h5>
            <div className="mt-2 flex flex-wrap gap-2">
              <select
                value={deleteGroupId}
                onChange={(event) => setDeleteGroupId(event.target.value)}
                className="min-w-56 rounded-lg bg-[#edeeef] px-3 py-2 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
              >
                <option value="">Select group</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
              <button
                onClick={() => void onDeleteGroup()}
                disabled={!deleteGroupId || isDeleting}
                className="rounded-lg bg-[#fbe9ec] px-4 py-2 text-sm font-bold text-[#93000a] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#3c1f24] dark:text-[#ffb4ab]"
              >
                {isDeleting ? 'Deleting...' : 'Delete Group'}
              </button>
            </div>
          </div>
        </section>
      ) : null}
      <section className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-[#eddcff] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#4c1b87]">{isDemo ? 'Active Trip' : 'Get Started'}</span>
            <span className="inline-flex items-center gap-1 text-xs text-[#4b4451] dark:text-[#cac4cf]"><CalendarDays size={12} />{isDemo ? 'Mar 12 - Mar 20, 2026' : liveDateRange}</span>
          </div>
          <h3 className="font-[Manrope] text-4xl font-extrabold tracking-tight text-[#191c1d] dark:text-[#f0f1f2]">{isDemo ? 'Goa Trip 2026' : liveTitle}</h3>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#4b4451] dark:text-[#cac4cf]">Total Group Spending</p>
          <p className="font-[Manrope] text-3xl font-extrabold text-[#4c1b87] dark:text-[#d8baff]">{isDemo ? '₹84,250.00' : liveTotal}</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {members.map((member, index) => (
          <motion.article
            key={member.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#eddcff] text-[#4c1b87] dark:bg-[#2b2b2b] dark:text-[#d8baff]">
                <UsersRound size={16} />
              </div>
              <span className={['text-xs font-bold', member.tone].join(' ')}>{member.amount}</span>
            </div>
            <p className="font-semibold text-[#191c1d] dark:text-[#f0f1f2]">{member.name}</p>
            <p className="text-xs text-[#4b4451] dark:text-[#cac4cf]">{member.status}</p>
          </motion.article>
        ))}
        <button
          onClick={() => {
            setTargetGroupId((current) => current || groups[0]?.id || '')
            setMemberToRemoveId('')
            setShowAddMemberModal(true)
          }}
          className="rounded-xl border border-dashed border-[#7c7483]/40 bg-[#f3f4f5] p-5 text-sm font-semibold text-[#4c1b87] transition hover:bg-[#e7e8e9] dark:border-[#4b4451] dark:bg-[#1e1e1e] dark:text-[#d8baff] dark:hover:bg-[#232627]"
        >
          Add Member
        </button>
      </section>

      {members.length === 0 ? (
        <section className="mt-6 rounded-2xl bg-white p-6 text-sm text-[#4b4451] shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:text-[#cac4cf] dark:ring-[#2d3234]">
          No members yet. Invite people after you create your first group.
        </section>
      ) : null}

      <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#cdc3d3]/30 dark:bg-[#232627] dark:ring-[#2d3234]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#cdc3d3]/30 px-5 py-4 dark:border-[#2d3234]">
          <div className="inline-flex items-center gap-2">
            <Filter size={16} className="text-[#4b4451] dark:text-[#cac4cf]" />
            <h4 className="font-[Manrope] text-lg font-bold tracking-tight text-[#191c1d] dark:text-[#f0f1f2]">Activity Ledger</h4>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="inline-flex items-center gap-1 rounded-full bg-[#f3f4f5] px-3 py-2 text-xs font-semibold text-[#4b4451] dark:bg-[#1e1e1e] dark:text-[#cac4cf]"><CalendarDays size={12} />All Dates</button>
            <button className="inline-flex items-center gap-1 rounded-full bg-[#f3f4f5] px-3 py-2 text-xs font-semibold text-[#4b4451] dark:bg-[#1e1e1e] dark:text-[#cac4cf]"><UsersRound size={12} />Everyone</button>
            <button className="inline-flex items-center gap-1 rounded-full bg-[#f3f4f5] px-3 py-2 text-xs font-semibold text-[#4b4451] dark:bg-[#1e1e1e] dark:text-[#cac4cf]"><Tags size={12} />Categories</button>
          </div>
        </div>

        {ledgerDays.map((day) => (
          <div key={day.date}>
            <div className="bg-[#f3f4f5] px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-[#4b4451] dark:bg-[#1e1e1e] dark:text-[#cac4cf]">
              {day.date}
            </div>
            {day.rows.map((row, index) => (
              <motion.article
                key={row.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-1 gap-4 px-5 py-4 transition hover:bg-[#f8f9fa] md:grid-cols-[1fr_auto_auto_auto] md:items-center dark:hover:bg-[#1e1e1e]"
              >
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <p className="font-semibold text-[#191c1d] dark:text-[#f0f1f2]">{row.title}</p>
                    <span className="rounded bg-[#e7e8e9] px-2 py-0.5 text-[10px] font-semibold text-[#4b4451] dark:bg-[#2b2b2b] dark:text-[#cac4cf]">{row.category}</span>
                  </div>
                  <p className="text-xs text-[#4b4451] dark:text-[#cac4cf]">Paid by {row.payer} • {row.split}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#4b4451] dark:text-[#cac4cf]">Your share</p>
                  <p className="font-[Manrope] text-lg font-extrabold text-[#4c1b87] dark:text-[#d8baff]">{row.yourShare}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#4b4451] dark:text-[#cac4cf]">Total</p>
                  <p className="font-[Manrope] text-lg font-extrabold text-[#191c1d] dark:text-[#f0f1f2]">{row.total}</p>
                </div>
                <div className="flex justify-end text-[#4b4451] dark:text-[#cac4cf]">
                  <ChevronRight size={18} />
                </div>
              </motion.article>
            ))}
          </div>
        ))}

        {ledgerDays.length === 0 ? (
          <div className="px-5 py-8 text-sm text-[#4b4451] dark:text-[#cac4cf]">
            No group activity yet. Added expenses will appear here.
          </div>
        ) : null}
      </section>

      <section className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => {
            if (isDemo) {
              showToast('This action is available after login.', 'info')
              return
            }
            window.location.href = '/add-expense'
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02]"
        >          <Plus size={16} /> Add Expense
        </button>
      </section>

      {showAddMemberModal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
          <section className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl dark:bg-[#232627]">
            <h4 className="text-lg font-bold text-[#191c1d] dark:text-[#f0f1f2]">Add Members</h4>
            <p className="mt-1 text-sm text-[#4b4451] dark:text-[#cac4cf]">Manage group members: add or remove users.</p>

            <div className="mt-3 space-y-3">
              <select
                value={targetGroupId}
                onChange={(event) => setTargetGroupId(event.target.value)}
                className="w-full rounded-lg bg-[#edeeef] px-3 py-2 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
              >
                <option value="">Select group</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>

              <div className="max-h-52 space-y-2 overflow-auto rounded-lg bg-[#f3f4f5] p-2 dark:bg-[#1e1e1e]">
                {users.map((member) => (
                  <label key={member.id} className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-[#eceef0] dark:hover:bg-[#2a2f31]">
                    <input
                      type="checkbox"
                      checked={newMemberIds.includes(member.id)}
                      onChange={(event) => {
                        setNewMemberIds((prev) =>
                          event.target.checked ? [...prev, member.id] : prev.filter((id) => id !== member.id),
                        )
                      }}
                      className="accent-[#4c1b87]"
                    />
                    <span>{member.name}</span>
                  </label>
                ))}
              </div>

              <div className="border-t border-[#cdc3d3]/40 pt-3 dark:border-[#2d3234]">
                <p className="mb-2 text-sm font-semibold text-[#191c1d] dark:text-[#f0f1f2]">Remove member</p>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={memberToRemoveId}
                    onChange={(event) => setMemberToRemoveId(event.target.value)}
                    className="min-w-56 rounded-lg bg-[#edeeef] px-3 py-2 text-sm outline-none ring-[#4c1b87]/30 focus:ring-2 dark:bg-[#1e1e1e]"
                  >
                    <option value="">Select member</option>
                    {users.map((member) => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => void onRemoveMember()}
                    disabled={isRemovingMember}
                    className="rounded-lg bg-[#fbe9ec] px-3 py-2 text-xs font-bold text-[#93000a] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#3c1f24] dark:text-[#ffb4ab]"
                  >
                    {isRemovingMember ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddMemberModal(false)
                  setNewMemberIds([])
                }}
                className="rounded-lg bg-[#e7e8e9] px-4 py-2 text-sm font-bold text-[#4b4451] dark:bg-[#2a3039] dark:text-[#cac4cf]"
              >
                Cancel
              </button>
              <button
                onClick={() => void onAddMembers()}
                disabled={isAddingMembers}
                className="rounded-lg bg-gradient-to-br from-[#4c1b87] to-[#6437a0] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAddingMembers ? 'Adding...' : 'OK'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </AppShell>
  )
}
