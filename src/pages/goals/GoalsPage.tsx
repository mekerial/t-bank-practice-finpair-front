import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Card from '../../shared/ui/Card'
import Button from '../../shared/ui/Button'
import AsyncDataView from '../../shared/ui/AsyncDataView'
import { IconPlus, IconGoals } from '../../shared/ui/icons'
import { formatMoneyPlain } from '../../shared/lib/financeView'
import { isValidHouseholdId } from '../../shared/lib/householdId'
import {
  clearCreateGoalError,
  createGoal,
  fetchGoals,
  setMainGoal,
  useAppDispatch,
  useAppSelector
} from '../../app/store'
import type { Goal } from '../../app/store/slices/goalsSlice'
import GoalCreateForm, {
  type GoalCreateFormValues
} from './components/GoalCreateForm'
import { useAsyncData } from '../../shared/hooks/useAsyncData'
import { fetchCoupleRequest } from '../../shared/api/settingsApi'
import type { CoupleDetails } from '../../shared/api/settingsApi'
import './goals.css'

type ProgressVariant = 'default' | 'light'
type GoalStatus = 'not-started' | 'in-progress' | 'almost-done' | 'done'

function ProgressBar({
  percent,
  variant = 'default'
}: {
  percent: number
  variant?: ProgressVariant
}) {
  return (
    <div className={'progress progress--' + variant}>
      <div
        className="progress__fill"
        style={{ width: Math.min(100, percent) + '%' }}
      />
    </div>
  )
}

function getGoalStatus(percent: number): { label: string; key: GoalStatus } {
  if (percent <= 0) {
    return { label: 'Не начато', key: 'not-started' }
  }

  if (percent >= 100) {
    return { label: 'Выполнено', key: 'done' }
  }

  if (percent >= 80) {
    return { label: 'Почти готово', key: 'almost-done' }
  }

  return { label: 'В процессе', key: 'in-progress' }
}

function getGoalEmoji(title: string) {
  const value = title.toLowerCase()

  if (value.includes('дом') || value.includes('квар')) return '🏠'
  if (value.includes('машин') || value.includes('авто')) return '🚗'
  if (
    value.includes('итал') ||
    value.includes('дубай') ||
    value.includes('китай') ||
    value.includes('отпуск') ||
    value.includes('путеш')
  ) {
    return '🏖️'
  }
  if (
    value.includes('образ') ||
    value.includes('учеб') ||
    value.includes('курс')
  ) {
    return '🎓'
  }
  if (value.includes('ремонт')) return '🛠️'
  if (value.includes('ноут')) return '💻'
  if (value.includes('телефон')) return '📱'
  if (value.includes('свад')) return '💍'

  return '🎯'
}

function GoalCard({
  goal,
  onSetMain
}: {
  goal: Goal
  onSetMain: (goalId: Goal['id']) => void
}) {
  const status = getGoalStatus(goal.percent)

  return (
    <div className="goal-card">
      <div className="goal-card__header">
        <div className="goal-card__emoji" role="img" aria-label={goal.title}>
          {getGoalEmoji(goal.title)}
        </div>

        <div className="goal-card__main">
          <div className="goal-card__title-row">
            <div className="goal-card__title">{goal.title}</div>
            {goal.isMain && <span className="goal-card__badge">Главная</span>}
          </div>
          <div className="goal-card__deadline">{goal.deadline}</div>
        </div>

        <div className="goal-card__percent">{goal.percent}%</div>
      </div>

      <ProgressBar percent={goal.percent} />

      <div className="goal-card__row">
        <span>{formatMoneyPlain(goal.collected)}</span>
        <span>{formatMoneyPlain(goal.target)}</span>
      </div>

      <div className="goal-card__status">
        <span className={`goal-status goal-status--${status.key}`}>
          {status.label}
        </span>
      </div>

      <div className="goal-card__stats">
        <div className="goal-stat">
          <div className="goal-stat__label">Ежемесячно</div>
          <div className="goal-stat__value">
            {formatMoneyPlain(goal.monthly)}
          </div>
        </div>

        <div className="goal-stat">
          <div className="goal-stat__label">Осталось</div>
          <div className="goal-stat__value">
            {formatMoneyPlain(goal.remaining)}
          </div>
        </div>
      </div>

      <div className="goal-card__actions">
        <button
          type="button"
          className="goal-card__action-btn"
          onClick={() => onSetMain(goal.id)}
          disabled={goal.isMain}
        >
          {goal.isMain ? 'Главная цель' : 'Сделать главной'}
        </button>
      </div>
    </div>
  )
}

function getMonthsLeft(
  target: number,
  collected: number,
  monthly: number
): number | null {
  const remaining = Math.max(target - collected, 0)

  if (remaining === 0) return 0
  if (monthly <= 0) return null

  return Math.ceil(remaining / monthly)
}

function buildGoalTips(goals: Goal[]): Array<{ id: string; title: string; text: string }> {
  if (goals.length === 0) return []
  const avgProgress =
    goals.reduce((acc, goal) => acc + goal.percent, 0) / goals.length
  const topGoal = [...goals].sort((a, b) => b.remaining - a.remaining)[0]

  return [
    {
      id: 'progress',
      title: 'Средний прогресс',
      text: `По всем целям сейчас ${Math.round(avgProgress)}%.`
    },
    {
      id: 'focus',
      title: 'Фокус месяца',
      text: `Больше всего осталось по цели "${topGoal.title}" — ${formatMoneyPlain(
        topGoal.remaining
      )}.`
    }
  ]
}

export default function GoalsPage() {
  const dispatch = useAppDispatch()
  const { items: goals, status, error, createError } = useAppSelector((s) => s.goals)
  const emptyCouple: CoupleDetails = {
    id: '',
    inviteCode: '',
    currency: 'RUB',
    splitType: 'equal',
    notifications: {},
    members: [],
    users: []
  }
  const { data: coupleData } = useAsyncData(
    'goals-couple',
    async () => {
      try {
        return await fetchCoupleRequest()
      } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status === 404) return emptyCouple
        throw e
      }
    }
  )
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const goalsHouseholdId = coupleData?.id
  useEffect(() => {
    if (status === 'idle' && isValidHouseholdId(goalsHouseholdId)) {
      void dispatch(fetchGoals())
    }
  }, [dispatch, status, goalsHouseholdId])

  useEffect(() => {
    if (isValidHouseholdId(goalsHouseholdId)) {
      void dispatch(fetchGoals())
    }
  }, [dispatch, goalsHouseholdId])

  const totalGoals = useMemo(() => goals.length, [goals])
  const goalTips = useMemo(() => buildGoalTips(goals), [goals])
  const mainGoal = useMemo(() => {
    return goals.find((goal) => goal.isMain)
  }, [goals])
  const featuredGoal = useMemo(() => {
    return mainGoal ?? goals[0]
  }, [goals, mainGoal])

  const handleCloseCreate = () => {
    setIsCreateOpen(false)
  }

  const handleCreateGoal = async (data: GoalCreateFormValues) => {
    dispatch(clearCreateGoalError())
    const result = await dispatch(createGoal(data))
    if (createGoal.fulfilled.match(result)) {
      setIsCreateOpen(false)
    }
  }
  const handleSetMainGoal = (goalId: Goal['id']) => {
    dispatch(setMainGoal(goalId))
  }

  if (!featuredGoal) {
    return (
      <div className="goals">
        <div className="goals__header">
          <h1 className="goals__title">Цели</h1>

          <Button
            type="button"
            onClick={() => setIsCreateOpen((prev) => !prev)}
          >
            {isCreateOpen ? (
              <span className="goals__toggle-icon" aria-hidden="true">
                ✕
              </span>
            ) : (
              <IconPlus width={16} height={16} />
            )}

            <span style={{ marginLeft: 6 }}>
              {isCreateOpen ? 'Закрыть' : 'Добавить цель'}
            </span>
          </Button>
        </div>

        {isCreateOpen && (
          <GoalCreateForm
            onSubmitForm={handleCreateGoal}
            onCancel={handleCloseCreate}
          />
        )}

        <Card title="Цели">
          <p className="goals__empty">Пока нет целей. Добавьте первую цель.</p>
        </Card>
      </div>
    )
  }

  const monthsLeft = getMonthsLeft(
    featuredGoal.target,
    featuredGoal.collected,
    featuredGoal.monthly
  )
  const mainStatus = getGoalStatus(featuredGoal.percent)

  return (
    <div className="goals">
      <div className="goals__header">
        <h1 className="goals__title">Цели</h1>

        <Button type="button" onClick={() => setIsCreateOpen((prev) => !prev)}>
          {isCreateOpen ? (
            <span className="goals__toggle-icon" aria-hidden="true">
              ✕
            </span>
          ) : (
            <IconPlus width={16} height={16} />
          )}

          <span style={{ marginLeft: 6 }}>
            {isCreateOpen ? 'Закрыть' : 'Добавить цель'}
          </span>
        </Button>
      </div>

      {createError && <p className="auth-form__common-error">{createError}</p>}

      {isCreateOpen && (
        <GoalCreateForm
          onSubmitForm={handleCreateGoal}
          onCancel={handleCloseCreate}
        />
      )}

      <AsyncDataView
        status={
          status === 'loading'
            ? 'loading'
            : status === 'failed'
              ? 'error'
              : 'success'
        }
        error={error}
        onRetry={() => void dispatch(fetchGoals())}
        loadingLabel="Загружаем цели…"
      >
        <div className="main-goal">
        <div className="main-goal__row">
          <div>
            <div className="main-goal__label">
              {mainGoal ? 'Главная цель' : 'Фокус сейчас'}
            </div>

            <div className="main-goal__title-row">
              <span
                className="main-goal__emoji"
                role="img"
                aria-label={featuredGoal.title}
              >
                {getGoalEmoji(featuredGoal.title)}
              </span>
              <div className="main-goal__title">{featuredGoal.title}</div>
            </div>

            <div className="main-goal__meta">
              <span>📅 {featuredGoal.deadline}</span>
              <span>{formatMoneyPlain(featuredGoal.monthly)}/мес</span>
            </div>
          </div>

          <div className="main-goal__percent">
            <div className="main-goal__percent-value">{featuredGoal.percent}%</div>
            <div className="main-goal__percent-hint">достигнуто</div>
          </div>
        </div>

        <div className="main-goal__progress">
          <div className="main-goal__progress-top">
            <span>{formatMoneyPlain(featuredGoal.collected)}</span>
            <span>{formatMoneyPlain(featuredGoal.target)}</span>
          </div>
          <ProgressBar percent={featuredGoal.percent} variant="light" />
        </div>

        <div className="main-goal__status">
          <span
            className={`goal-status goal-status--${mainStatus.key} goal-status--light`}
          >
            {mainStatus.label}
          </span>
        </div>

        <div className="main-goal__stats">
          <div className="main-goal__stat">
            <div className="main-goal__stat-label">Осталось</div>
            <div className="main-goal__stat-value">
              {formatMoneyPlain(featuredGoal.remaining)}
            </div>
          </div>

          <div className="main-goal__stat">
            <div className="main-goal__stat-label">Ещё месяцев</div>
            <div className="main-goal__stat-value">
              {monthsLeft === null ? '—' : monthsLeft}
            </div>
          </div>

          <div className="main-goal__stat">
            <div className="main-goal__stat-label">Прогресс</div>
            <div className="main-goal__stat-value main-goal__stat-value--icon">
              <IconGoals width={20} height={20} /> {mainStatus.label.toLowerCase()}
            </div>
          </div>
        </div>
        </div>

        <div className="goals__section-head">
          <div className="goals__section-title">Все цели</div>
          <div className="goals__count">Всего: {totalGoals}</div>
        </div>

        <div className="goals__grid">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onSetMain={handleSetMainGoal} />
          ))}
        </div>

        <Card title="💡 Советы по накоплению">
          <div className="goal-tips">
            {goalTips.map((t) => (
              <div key={t.id} className="goal-tip">
                <div className="goal-tip__title">{t.title}</div>
                <div className="goal-tip__text">{t.text}</div>
              </div>
            ))}
          </div>
        </Card>
      </AsyncDataView>
    </div>
  )
}