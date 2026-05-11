const EMPTY_GUID_COMPACT = '00000000000000000000000000000000'

export function isValidHouseholdId(
  id: string | undefined | null
): id is string {
  if (id === undefined || id === null) return false
  const trimmed = String(id).trim()
  if (!trimmed) return false
  const compact = trimmed.replace(/-/g, '').toLowerCase()
  return compact !== EMPTY_GUID_COMPACT
}
