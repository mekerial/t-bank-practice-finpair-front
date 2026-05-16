const prefix = 'finpair:goal-focus:'

function key(householdId: string): string {
  return prefix + householdId
}

export function readStoredFocusedGoalId(householdId: string): string | null {
  try {
    const v = localStorage.getItem(key(householdId))
    return v && v.length > 0 ? v : null
  } catch {
    return null
  }
}

export function writeStoredFocusedGoalId(
  householdId: string,
  goalId: string | null
): void {
  try {
    const k = key(householdId)
    if (goalId === null || goalId === '') localStorage.removeItem(k)
    else localStorage.setItem(k, goalId)
  } catch {
  }
}
