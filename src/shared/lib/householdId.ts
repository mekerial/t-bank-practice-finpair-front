const EMPTY_GUID_COMPACT = '00000000000000000000000000000000'

/**
 * Couple API для «нет пары» отдаёт Guid.Empty — это не реальный household.
 */
export function isValidHouseholdId(id: string | undefined | null): boolean {
  if (id === undefined || id === null) return false
  const trimmed = String(id).trim()
  if (!trimmed) return false
  const compact = trimmed.replace(/-/g, '').toLowerCase()
  return compact !== EMPTY_GUID_COMPACT
}
