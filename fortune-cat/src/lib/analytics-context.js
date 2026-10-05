export const USER_TYPE_KEY = 'analytics_user_type'

export function readUserType(storage, development = false) {
  if (development) return 'internal'
  try {
    const value = storage?.getItem(USER_TYPE_KEY)
    if (value === 'internal' || value === 'external') return value
  } catch { /* Storage is optional. */ }
  return 'unknown'
}

export function nextUserType(current, value) {
  if (current === 'internal') return 'internal'
  return value === 'internal' || value === 'external' ? value : 'unknown'
}
