const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export type UserDirectoryItem = {
  id: string
  name: string
  email: string
}

export type GroupSummary = {
  id: string
  name: string
  description: string | null
  memberCount: number
  createdAt: string
}

export type ExpenseCreatePayload = {
  groupId: string
  title: string
  category: string
  totalAmount: number
  payerId?: string
  splits: Array<{
    userId: string
    amount: number
  }>
}

export type ExpenseUpdatePayload = {
  title?: string
  category?: string
  totalAmount?: number
  payerId?: string
  splits?: Array<{
    userId: string
    amount: number
  }>
}

export type SettlementCreatePayload = {
  toUserId: string
  amount: number
}

export type AppState = {
  profile: {
    name: string
    email: string
  }
  dashboard: {
    totalNetBalance: string
    totalNetBalanceNote: string
    youAreOwed: string
    youAreOwedNote: string
    youOwe: string
    youOweNote: string
    recentActivity: Array<{
      id: string
      title: string
      group: string
      amount: string
      time: string
      tone: string
    }>
    groups: Array<{
      id: string
      name: string
      members: number
      spend: string
      spendTone: string
      status: string
    }>
  }
  groupLedger: {
    title: string
    dateRange: string
    totalGroupSpending: string
    members: Array<{
      id: string
      name: string
      status: string
      amount: string
      tone: string
    }>
    ledgerDays: Array<{
      date: string
      rows: Array<{
        id: string
        title: string
        category: string
        payer: string
        split: string
        yourShare: string
        total: string
      }>
    }>
  }
  notifications: {
    items: Array<{
      id: string
      title: string
      time: string
      priority: string
    }>
  }
  settlements: {
    items: Array<{
      id: string
      from: string
      to: string
      amount: number
      status: string
    }>
  }
  oneOnOne: {
    items: Array<{
      id: string
      title: string
      amount: number
      yourShare: number
      date: string
    }>
  }
  analytics: {
    cards: Array<{
      label: string
      value: string
    }>
  }
  exports: {
    items: Array<{
      id: string
      type: string
      scope: string
      generatedAt: string
    }>
  }
  expenseDetail: {
    expense: {
      id: string
      title: string
      summary: string
      comments: Array<{
        id: string
        message: string
      }>
    } | null
  }
}

async function requestWithAuth<T>(
  path: string,
  accessToken: string,
  init: RequestInit = {},
): Promise<T> {
  const hasBody = init.body !== undefined && init.body !== null
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${accessToken}`,
      ...(init.headers ?? {}),
    },
    body: init.body,
  })

  if (!response.ok) {
    let message = 'Request failed'
    try {
      const body = (await response.json()) as { message?: string }
      if (body.message) {
        message = body.message
      }
    } catch {
      // Ignore parse errors and keep fallback message.
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const contentLength = response.headers.get('content-length')
  if (contentLength === '0') {
    return undefined as T
  }

  return (await response.json()) as T
}

async function requestBlobWithAuth(
  path: string,
  accessToken: string,
  init: RequestInit = {},
): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.headers ?? {}),
    },
    body: init.body,
  })

  if (!response.ok) {
    let message = 'Request failed'
    try {
      const body = (await response.json()) as { message?: string }
      if (body.message) {
        message = body.message
      }
    } catch {
      // Ignore parse errors and keep fallback message.
    }
    throw new Error(message)
  }

  return response.blob()
}

export async function getAppState(accessToken: string): Promise<AppState> {
  return requestWithAuth<AppState>('/app/state', accessToken)
}

export async function getUsers(accessToken: string): Promise<UserDirectoryItem[]> {
  return requestWithAuth<UserDirectoryItem[]>('/users', accessToken)
}

export async function getGroups(accessToken: string): Promise<GroupSummary[]> {
  return requestWithAuth<GroupSummary[]>('/groups', accessToken)
}

export async function getGroupMembers(accessToken: string, groupId: string): Promise<UserDirectoryItem[]> {
  return requestWithAuth<UserDirectoryItem[]>(`/groups/${groupId}/members`, accessToken)
}

export async function createGroup(
  accessToken: string,
  payload: { name: string; description?: string; memberIds?: string[] },
): Promise<GroupSummary> {
  return requestWithAuth<GroupSummary>('/groups', accessToken, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function createExpense(accessToken: string, payload: ExpenseCreatePayload): Promise<void> {
  await requestWithAuth('/expenses', accessToken, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateExpense(accessToken: string, expenseId: string, payload: ExpenseUpdatePayload): Promise<void> {
  await requestWithAuth(`/expenses/${expenseId}`, accessToken, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function createSettlement(accessToken: string, payload: SettlementCreatePayload): Promise<void> {
  await requestWithAuth('/settlements', accessToken, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateSettlementStatus(
  accessToken: string,
  settlementId: string,
  status: 'ACCEPTED' | 'REJECTED' | 'PENDING',
): Promise<void> {
  await requestWithAuth(`/settlements/${settlementId}/status`, accessToken, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export async function deleteExpense(accessToken: string, expenseId: string): Promise<void> {
  await requestWithAuth(`/expenses/${expenseId}`, accessToken, {
    method: 'DELETE',
  })
}

export async function deleteGroup(accessToken: string, groupId: string): Promise<void> {
  await requestWithAuth(`/groups/${groupId}`, accessToken, {
    method: 'DELETE',
  })
}

export async function addGroupMembers(accessToken: string, groupId: string, memberIds: string[]): Promise<GroupSummary> {
  return requestWithAuth<GroupSummary>(`/groups/${groupId}/members`, accessToken, {
    method: 'POST',
    body: JSON.stringify({ memberIds }),
  })
}

export async function removeGroupMember(accessToken: string, groupId: string, memberId: string): Promise<GroupSummary> {
  return requestWithAuth<GroupSummary>(`/groups/${groupId}/members/${memberId}`, accessToken, {
    method: 'DELETE',
  })
}

export async function downloadExportCsv(accessToken: string): Promise<Blob> {
  return requestBlobWithAuth('/exports/csv', accessToken)
}

export async function downloadExportPdf(accessToken: string): Promise<Blob> {
  return requestBlobWithAuth('/exports/pdf', accessToken)
}
