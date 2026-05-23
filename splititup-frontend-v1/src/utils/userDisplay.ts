export type UserIdentity = {
  id?: string | null
  name?: string | null
  email?: string | null
}

const PLACEHOLDER_NAME_PATTERNS = [
  /\bdebug\b/i,
  /\btest\b/i,
  /\blive\s*test\b/i,
  /\bdummy\b/i,
  /\bqa\b/i,
  /^ready\s*user$/i,
  /^test\s*user$/i,
  /^demo\s*user$/i,
  /^sample\s*user$/i,
  /^placeholder$/i,
  /^user$/i,
]

function toTitleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
    .join(' ')
}

function looksLikePlaceholder(name: string): boolean {
  return PLACEHOLDER_NAME_PATTERNS.some((pattern) => pattern.test(name.trim()))
}

function looksLikePlaceholderEmail(email: string): boolean {
  const local = (email.split('@')[0] ?? '').toLowerCase()
  return /(debug|test|live.?test|dummy|sample|placeholder|qa)/i.test(local)
}

function fromEmail(email: string): string {
  const local = email.split('@')[0] ?? ''
  const cleaned = local.replace(/[._-]+/g, ' ').trim()
  if (!cleaned) {
    return 'Member'
  }
  return toTitleCase(cleaned)
}

function fromId(id: string): string {
  return `Member ${id.slice(0, 6).toUpperCase()}`
}

export function getDisplayName(user: UserIdentity): string {
  const rawName = user.name?.trim() ?? ''
  if (rawName && !looksLikePlaceholder(rawName)) {
    return toTitleCase(rawName)
  }

  const email = user.email?.trim()
  if (email) {
    return fromEmail(email)
  }

  const id = user.id?.trim()
  if (id) {
    return fromId(id)
  }

  return 'Member'
}

export function normalizeNameInput(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase()
}

export function isLikelyPlaceholderUser(user: UserIdentity): boolean {
  const name = user.name?.trim() ?? ''
  if (name && looksLikePlaceholder(name)) {
    return true
  }

  const email = user.email?.trim() ?? ''
  if (email && looksLikePlaceholderEmail(email)) {
    return true
  }

  return false
}

function isSubsequence(needle: string, haystack: string): boolean {
  let pointer = 0
  for (let index = 0; index < haystack.length && pointer < needle.length; index += 1) {
    if (haystack[index] === needle[pointer]) {
      pointer += 1
    }
  }
  return pointer === needle.length
}

function scoreAlias(needle: string, alias: string): number {
  if (!needle || !alias) {
    return 0
  }
  if (alias === needle) {
    return 100
  }
  if (alias.startsWith(needle)) {
    return 90
  }
  if (alias.includes(needle)) {
    return 82
  }

  const needleTokens = needle.split(' ').filter(Boolean)
  const aliasTokens = alias.split(' ').filter(Boolean)
  if (
    needleTokens.length > 1 &&
    needleTokens.every((token) => aliasTokens.some((aliasToken) => aliasToken.startsWith(token)))
  ) {
    return 74
  }

  const compactNeedle = needle.replace(/\s+/g, '')
  const compactAlias = alias.replace(/\s+/g, '')
  if (compactNeedle.length >= 3 && isSubsequence(compactNeedle, compactAlias)) {
    return 60
  }

  return 0
}

function getSearchAliases(user: UserIdentity): string[] {
  const aliases = new Set<string>()
  aliases.add(normalizeNameInput(getDisplayName(user)))

  const email = normalizeNameInput(user.email ?? '')
  if (email) {
    aliases.add(email)
    aliases.add(email.split('@')[0] ?? '')
  }

  return Array.from(aliases).filter(Boolean)
}

export function fuzzyFindUserByNameOrEmail<T extends UserIdentity>(
  users: T[],
  rawValue: string,
): { match?: T; suggestions: string[] } {
  const needle = normalizeNameInput(rawValue)
  if (!needle) {
    return { suggestions: [] }
  }

  const ranked = users
    .map((user) => {
      const bestScore = getSearchAliases(user)
        .map((alias) => scoreAlias(needle, alias))
        .reduce((best, score) => (score > best ? score : best), 0)
      return { user, score: bestScore }
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)

  const suggestions = Array.from(
    new Set(
      ranked
        .filter((item) => item.score >= 45)
        .slice(0, 3)
        .map((item) => getDisplayName(item.user)),
    ),
  )

  const best = ranked[0]
  if (best && best.score >= 60) {
    return { match: best.user, suggestions }
  }

  return { suggestions }
}
