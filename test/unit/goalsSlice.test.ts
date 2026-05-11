import reducer, {
  clearCreateGoalError,
  createGoal,
  deleteGoal,
  fetchGoals,
  type Goal
} from '../../src/app/store/slices/goalsSlice'

describe('goalsSlice reducer', () => {
  const existingGoal: Goal = {
    id: 'goal-1',
    title: 'Подушка',
    deadline: 'май 2026',
    percent: 25,
    collected: 25000,
    target: 100000,
    monthly: 5000,
    remaining: 75000,
    isMain: true
  }

  it('ставит main-цель первой и снимает main у остальных', () => {
    const base = reducer(
      undefined,
      fetchGoals.fulfilled([existingGoal], 'req', undefined)
    )
    const newMainGoal: Goal = {
      id: 'goal-2',
      title: 'Отпуск',
      deadline: 'июнь 2026',
      percent: 10,
      collected: 10000,
      target: 100000,
      monthly: 10000,
      remaining: 90000,
      isMain: true
    }

    const next = reducer(
      base,
      createGoal.fulfilled(newMainGoal, 'req', {
        title: 'Отпуск',
        deadline: '2026-06-01',
        collected: '10000',
        target: '100000',
        monthly: '10000',
        isMain: true
      })
    )

    expect(next.items[0].id).toBe('goal-2')
    expect(next.items[0].isMain).toBe(true)
    expect(next.items[1].isMain).toBe(false)
  })

  it('после удаления закреплённой цели не назначает другую «в фокусе»', () => {
    const main: Goal = { ...existingGoal, id: 'g-main', isMain: true }
    const other: Goal = {
      id: 'g-other',
      title: 'Вторая',
      deadline: 'июнь 2026',
      percent: 5,
      collected: 5000,
      target: 100000,
      monthly: 2000,
      remaining: 95000,
      isMain: false
    }
    const base = reducer(undefined, fetchGoals.fulfilled([main, other], 'r', undefined))
    const next = reducer(base, deleteGoal.fulfilled('g-main', 'r', 'g-main'))
    expect(next.items).toHaveLength(1)
    expect(next.items[0].id).toBe('g-other')
    expect(next.items[0].isMain).toBeFalsy()
  })

  it('очищает createError', () => {
    const failed = reducer(
      undefined,
      createGoal.rejected(
        new Error('fail'),
        'req',
        {
          title: 'x',
          deadline: '',
          collected: '0',
          target: '0',
          monthly: '0',
          isMain: false
        },
        'Ошибка'
      )
    )
    const cleared = reducer(failed, clearCreateGoalError())
    expect(cleared.createError).toBeNull()
  })
})
