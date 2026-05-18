import { fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import GoalCreateForm from '../../src/pages/goals/components/GoalCreateForm'

describe('GoalCreateForm', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('calculates monthly contribution from target, collected amount and deadline', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-18T09:00:00Z'))

    render(
      <GoalCreateForm
        onSubmitForm={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    const target = document.querySelector<HTMLInputElement>('#goal-target')
    const collected = document.querySelector<HTMLInputElement>('#goal-collected')
    const deadline = document.querySelector<HTMLInputElement>('#goal-deadline')
    const monthly = document.querySelector<HTMLInputElement>('#goal-monthly')

    expect(target).not.toBeNull()
    expect(collected).not.toBeNull()
    expect(deadline).not.toBeNull()
    expect(monthly).not.toBeNull()

    fireEvent.change(target!, { target: { value: '120000' } })
    fireEvent.change(collected!, { target: { value: '30000' } })
    fireEvent.change(deadline!, { target: { value: '2026-08-18' } })

    expect(monthly).toHaveValue(30000)
    expect(monthly).toHaveAttribute('readonly')
  })
})
